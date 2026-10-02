import type { Request, Response } from "express";
import { logImportError, logImportStart, logImportSummary } from "../importers/importLogger.js";
import { runJobImport } from "../importers/importRunner.js";

export async function runCronImport(req: Request, res: Response) {
  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  logImportStart("scheduled");

  try {
    const summary = await runJobImport();
    logImportSummary("scheduled", summary);
    res.json({ ok: true, summary });
  } catch (error) {
    logImportError("scheduled", error);
    res.status(500).json({ error: "Job import failed" });
  }
}

function isAuthorizedCronRequest(req: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = req.header("authorization");

  return Boolean(expectedSecret && authorization === `Bearer ${expectedSecret}`);
}
