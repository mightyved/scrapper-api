import { Router } from "express";
import { getJobs } from "../controllers/jobsController.js";

export const jobRoutes = Router();

jobRoutes.get("/jobs", getJobs);
