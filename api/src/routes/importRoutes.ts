import { Router } from "express";
import { runCronImport } from "../controllers/importController.js";

export const importRoutes = Router();

importRoutes.get("/import/cron", runCronImport);
