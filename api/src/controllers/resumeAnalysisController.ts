import type { Request, Response } from "express";
import mammoth from "mammoth";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { analyzeResumeAgainstJob, generateTailoredResumeForJob, type ResumeJobInput } from "../lib/resumeAnalysis.js";

const maxResumeFileSize = 4 * 1024 * 1024;

export const resumeUpload = multer({
  limits: {
    fileSize: maxResumeFileSize,
    files: 1
  },
  storage: multer.memoryStorage()
});

export async function analyzeResume(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "Upload a resume file before analysis." });
    return;
  }

  let job: ResumeJobInput;

  try {
    job = parseJobInput(req.body.job);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid job payload." });
    return;
  }

  try {
    const resumeText = await extractResumeText(file);
    const normalizedTextLength = resumeText.replace(/\s+/g, " ").trim().length;

    if (normalizedTextLength < 180) {
      res.status(400).json({
        error:
          "Resume text could not be extracted clearly. Try a text-based PDF, DOCX, TXT, MD, HTML, JSON, or CSV resume."
      });
      return;
    }

    const analysis = analyzeResumeAgainstJob(job, resumeText, file.originalname || "resume");
    res.json({ data: analysis });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to analyze resume." });
  }
}

export async function generateResume(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "Upload a resume file before generating a tailored draft." });
    return;
  }

  let job: ResumeJobInput;

  try {
    job = parseJobInput(req.body.job);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid job payload." });
    return;
  }

  try {
    const resumeText = await extractResumeText(file);
    const normalizedTextLength = resumeText.replace(/\s+/g, " ").trim().length;

    if (normalizedTextLength < 180) {
      res.status(400).json({
        error:
          "Resume text could not be extracted clearly. Try a text-based PDF, DOCX, TXT, MD, HTML, JSON, or CSV resume."
      });
      return;
    }

    const generated = generateTailoredResumeForJob(job, resumeText, file.originalname || "resume");
    res.json({ data: generated });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to generate a tailored resume." });
  }
}

function parseJobInput(value: unknown): ResumeJobInput {
  if (typeof value !== "string") {
    throw new Error("Job data is required for resume analysis.");
  }

  const parsed = JSON.parse(value) as Record<string, unknown>;
  const title = stringValue(parsed.title);

  if (!title) {
    throw new Error("Job title is required for resume analysis.");
  }

  return {
    title,
    companyName: stringValue(parsed.companyName),
    description: stringValue(parsed.description),
    locationText: stringValue(parsed.locationText),
    matchReasons: stringArray(parsed.matchReasons),
    remoteText: stringValue(parsed.remoteText),
    sourceName: stringValue(parsed.sourceName),
    tags: stringArray(parsed.tags)
  };
}

async function extractResumeText(file: Express.Multer.File): Promise<string> {
  const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.mimetype.toLowerCase();

  if (extension === "pdf" || mimeType.includes("pdf")) {
    return extractPdfText(file.buffer);
  }

  if (extension === "docx" || mimeType.includes("wordprocessingml")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (["csv", "html", "htm", "json", "md", "rtf", "text", "txt"].includes(extension) || mimeType.startsWith("text/")) {
    return file.buffer.toString("utf8");
  }

  throw new Error("Unsupported resume format. Use PDF, DOCX, TXT, MD, HTML, JSON, or CSV.");
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}
