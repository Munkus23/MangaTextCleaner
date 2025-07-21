import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMangaProjectSchema, insertTextBoxSchema } from "@shared/schema";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Extend Express Request type for multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Set up multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPG and PNG images are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  }, express.static("uploads"));

  // Create manga project with image upload
  app.post("/api/projects", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Project name is required" });
      }

      // Get image dimensions (you might want to use sharp for this in production)
      const imageUrl = `/uploads/${file.filename}`;
      
      const projectData = insertMangaProjectSchema.parse({
        name,
        originalImageUrl: imageUrl,
        width: 800, // Default dimensions, should be calculated from actual image
        height: 600,
      });

      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid project data" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // OCR text detection
  app.post("/api/projects/:id/ocr", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      let detections = [];
      let detectorUsed = "mock";

      // Try to use real Comic Text Detector service
      try {
        const ocrResponse = await fetch('http://localhost:5001/detect_url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: project.originalImageUrl })
        });

        if (ocrResponse.ok) {
          const ocrResult = await ocrResponse.json();
          if (ocrResult.success && ocrResult.text_boxes) {
            // Convert Comic Text Detector format to our format
            detections = ocrResult.text_boxes.map((box: any) => ({
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              originalText: box.text || "Detected text",
              confidence: Math.round((box.confidence || 0.8) * 100),
            }));
            detectorUsed = "comic-text-detector";
            console.log(`Comic Text Detector found ${detections.length} text regions`);
          }
        }
      } catch (ocrError) {
        console.log("Comic Text Detector not available:", ocrError instanceof Error ? ocrError.message : String(ocrError));
      }

      // Fallback to mock data if OCR service not available
      if (detections.length === 0) {
        detections = [
          {
            x: Math.floor(project.width * 0.15),
            y: Math.floor(project.height * 0.1),
            width: Math.floor(project.width * 0.3),
            height: Math.floor(project.height * 0.08),
            originalText: "Sample detected text",
            confidence: 87,
          },
          {
            x: Math.floor(project.width * 0.55),
            y: Math.floor(project.height * 0.25),
            width: Math.floor(project.width * 0.35),
            height: Math.floor(project.height * 0.06),
            originalText: "Another text block",
            confidence: 92,
          },
        ];
        console.log("Using mock OCR data");
      }

      // Create text boxes for detections
      const textBoxes = [];
      for (const detection of detections) {
        const textBoxData = insertTextBoxSchema.parse({
          projectId: id,
          ...detection,
        });
        const textBox = await storage.createTextBox(textBoxData);
        textBoxes.push(textBox);
      }

      res.json({ textBoxes, detectorUsed });
    } catch (error) {
      console.error("Error processing OCR:", error);
      res.status(500).json({ error: "Failed to process OCR" });
    }
  });

  // Get text boxes for a project
  app.get("/api/projects/:id/textboxes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const textBoxes = await storage.getTextBoxesByProject(id);
      res.json(textBoxes);
    } catch (error) {
      console.error("Error fetching text boxes:", error);
      res.status(500).json({ error: "Failed to fetch text boxes" });
    }
  });

  // Update text box
  app.patch("/api/textboxes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const textBox = await storage.updateTextBox(id, updates);
      if (!textBox) {
        return res.status(404).json({ error: "Text box not found" });
      }
      res.json(textBox);
    } catch (error) {
      console.error("Error updating text box:", error);
      res.status(500).json({ error: "Failed to update text box" });
    }
  });

  // Delete text box
  app.delete("/api/textboxes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTextBox(id);
      if (!deleted) {
        return res.status(404).json({ error: "Text box not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting text box:", error);
      res.status(500).json({ error: "Failed to delete text box" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
