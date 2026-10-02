import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { healthRoutes } from "./routes/healthRoutes.js";
import { importRoutes } from "./routes/importRoutes.js";
import { jobRoutes } from "./routes/jobRoutes.js";
import { resumeAnalysisRoutes } from "./routes/resumeAnalysisRoutes.js";
import { sourceRoutes } from "./routes/sourceRoutes.js";

export const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins.length === 1 && corsOrigins[0] === "*" ? "*" : corsOrigins }));
app.use(express.json());

app.use(healthRoutes);
app.use(jobRoutes);
app.use(sourceRoutes);
app.use(resumeAnalysisRoutes);
app.use(importRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});
