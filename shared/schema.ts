import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mangaProjects = pgTable("manga_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  editedImageUrl: text("edited_image_url"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const textBoxes = pgTable("text_boxes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => mangaProjects.id).notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  originalText: text("original_text"),
  editedText: text("edited_text"),
  confidence: integer("confidence"), // 0-100
  fontSize: integer("font_size").default(14),
  fontColor: text("font_color").default("#000000"),
  backgroundColor: text("background_color"),
  isBold: boolean("is_bold").default(false),
  isItalic: boolean("is_italic").default(false),
  isUnderline: boolean("is_underline").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMangaProjectSchema = createInsertSchema(mangaProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTextBoxSchema = createInsertSchema(textBoxes).omit({
  id: true,
  createdAt: true,
});

export type InsertMangaProject = z.infer<typeof insertMangaProjectSchema>;
export type MangaProject = typeof mangaProjects.$inferSelect;
export type InsertTextBox = z.infer<typeof insertTextBoxSchema>;
export type TextBox = typeof textBoxes.$inferSelect;
