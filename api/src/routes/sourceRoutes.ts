import { Router } from "express";
import { createSource, getSources } from "../controllers/sourcesController.js";

export const sourceRoutes = Router();

sourceRoutes.get("/sources", getSources);
sourceRoutes.post("/sources", createSource);
