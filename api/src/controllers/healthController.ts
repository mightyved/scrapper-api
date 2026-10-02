import type { Request, Response } from "express";

export function getHealth(_req: Request, res: Response) {
  res.json({
    status: "ok",
    service: "apac-remote-job-tracker-api",
    timestamp: new Date().toISOString()
  });
}
