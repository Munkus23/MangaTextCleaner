import { mangaProjects, textBoxes, type MangaProject, type InsertMangaProject, type TextBox, type InsertTextBox } from "@shared/schema";

export interface IStorage {
  // Manga Projects
  createProject(project: InsertMangaProject): Promise<MangaProject>;
  getProject(id: number): Promise<MangaProject | undefined>;
  getAllProjects(): Promise<MangaProject[]>;
  updateProject(id: number, updates: Partial<MangaProject>): Promise<MangaProject | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Text Boxes
  createTextBox(textBox: InsertTextBox): Promise<TextBox>;
  getTextBoxesByProject(projectId: number): Promise<TextBox[]>;
  updateTextBox(id: number, updates: Partial<TextBox>): Promise<TextBox | undefined>;
  deleteTextBox(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, MangaProject>;
  private textBoxes: Map<number, TextBox>;
  private currentProjectId: number;
  private currentTextBoxId: number;

  constructor() {
    this.projects = new Map();
    this.textBoxes = new Map();
    this.currentProjectId = 1;
    this.currentTextBoxId = 1;
  }

  async createProject(insertProject: InsertMangaProject): Promise<MangaProject> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: MangaProject = {
      ...insertProject,
      editedImageUrl: insertProject.editedImageUrl || null,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: number): Promise<MangaProject | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<MangaProject[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updateProject(id: number, updates: Partial<MangaProject>): Promise<MangaProject | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete associated text boxes
    Array.from(this.textBoxes.entries())
      .filter(([_, textBox]) => textBox.projectId === id)
      .forEach(([textBoxId]) => this.textBoxes.delete(textBoxId));
    
    return this.projects.delete(id);
  }

  async createTextBox(insertTextBox: InsertTextBox): Promise<TextBox> {
    const id = this.currentTextBoxId++;
    const textBox: TextBox = {
      ...insertTextBox,
      fontSize: insertTextBox.fontSize || 14,
      fontColor: insertTextBox.fontColor || "#000000",
      backgroundColor: insertTextBox.backgroundColor || null,
      isBold: insertTextBox.isBold || false,
      isItalic: insertTextBox.isItalic || false,
      isUnderline: insertTextBox.isUnderline || false,
      originalText: insertTextBox.originalText || null,
      editedText: insertTextBox.editedText || null,
      confidence: insertTextBox.confidence || null,
      id,
      createdAt: new Date(),
    };
    this.textBoxes.set(id, textBox);
    return textBox;
  }

  async getTextBoxesByProject(projectId: number): Promise<TextBox[]> {
    return Array.from(this.textBoxes.values())
      .filter(textBox => textBox.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updateTextBox(id: number, updates: Partial<TextBox>): Promise<TextBox | undefined> {
    const textBox = this.textBoxes.get(id);
    if (!textBox) return undefined;

    const updatedTextBox = { ...textBox, ...updates };
    this.textBoxes.set(id, updatedTextBox);
    return updatedTextBox;
  }

  async deleteTextBox(id: number): Promise<boolean> {
    return this.textBoxes.delete(id);
  }
}

export const storage = new MemStorage();
