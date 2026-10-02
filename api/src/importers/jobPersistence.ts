import { JobStatus, type PrismaClient } from "@prisma/client";
import { matchJob, toJobScoreUpdate } from "../matching/jobMatcher.js";
import type { ImportableJob } from "./types.js";

export type SaveImportedJobResult = {
  saved: boolean;
  active: boolean;
};

export async function saveImportedJob(prisma: PrismaClient, job: ImportableJob): Promise<SaveImportedJobResult> {
  const match = matchJob(job);
  const scoreUpdate = toJobScoreUpdate(match);
  const status = match.accepted ? JobStatus.ACTIVE : JobStatus.HIDDEN;
  const now = new Date();

  await prisma.job.upsert({
    where: { applyUrl: job.applyUrl },
    update: {
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      locationText: job.locationText,
      remoteText: job.remoteText,
      employmentType: job.employmentType,
      salaryText: job.salaryText,
      tags: job.tags,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt,
      lastSeenAt: now,
      status,
      ...scoreUpdate
    },
    create: {
      sourceId: job.sourceId,
      externalId: job.externalId,
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      applyUrl: job.applyUrl,
      locationText: job.locationText,
      remoteText: job.remoteText,
      employmentType: job.employmentType,
      salaryText: job.salaryText,
      tags: job.tags,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt,
      lastSeenAt: now,
      status,
      ...scoreUpdate
    }
  });

  return {
    active: match.accepted,
    saved: true
  };
}
