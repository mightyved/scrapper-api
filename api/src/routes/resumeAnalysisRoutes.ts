import { Router } from "express";
import { analyzeResume, generateResume, resumeUpload } from "../controllers/resumeAnalysisController.js";

export const resumeAnalysisRoutes = Router();

resumeAnalysisRoutes.post("/resume/analyze", resumeUpload.single("resume"), analyzeResume);
resumeAnalysisRoutes.post("/resume/generate", resumeUpload.single("resume"), generateResume);
