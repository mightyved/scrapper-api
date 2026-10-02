import type { Request, Response } from "express";
import { JobStatus } from "@prisma/client";
import { fetchLiveMatchedJobs } from "../importers/liveJobFallback.js";
import { prisma } from "../lib/prisma.js";

export async function getJobs(_req: Request, res: Response) {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: JobStatus.ACTIVE },
      orderBy: [{ publishedAt: "desc" }, { firstSeenAt: "desc" }],
      select: {
        id: true,
        title: true,
        companyName: true,
        applyUrl: true,
        locationText: true,
        remoteText: true,
        totalScore: true,
        apacScore: true,
        relevanceScore: true,
        matchReasons: true,
        tags: true,
        publishedAt: true,
        source: {
          select: {
            id: true,
            name: true,
            type: true,
            url: true
          }
        }
      }
    });

    res.json({ data: jobs });
  } catch (error) {
    console.error(error);
    const liveJobs = await fetchLiveMatchedJobs();
    res.setHeader("X-Jobs-Source", "live-fallback");
    res.json({ data: liveJobs });
  }
}
