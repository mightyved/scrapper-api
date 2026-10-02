import { JobSourceType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { saveImportedJob } from "./jobPersistence.js";
import { fetchLinkedInJobs, isLinkedInSource } from "./linkedinImporter.js";
import { fetchPublicApiJobs, isPublicApiSource } from "./publicApiImporters.js";
import { fetchRemoteOkJobs, isRemoteOkSource } from "./remoteOkImporter.js";
import { fetchRssJobs } from "./rssImporter.js";
import type { ImportableJob, ImportSource, JobImportSummary, SourceImportResult } from "./types.js";

export async function runJobImport(): Promise<JobImportSummary> {
  const startedAt = new Date();
  const sources = await prisma.jobSource.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" }
  });
  const sourceResults: SourceImportResult[] = [];

  for (const source of sources) {
    sourceResults.push(await importSource(source));
  }

  const finishedAt = new Date();

  return {
    startedAt,
    finishedAt,
    sourceResults,
    fetchedCount: sum(sourceResults, "fetchedCount"),
    savedCount: sum(sourceResults, "savedCount"),
    activeCount: sum(sourceResults, "activeCount"),
    hiddenCount: sum(sourceResults, "hiddenCount"),
    skippedCount: sum(sourceResults, "skippedCount"),
    errorCount: sum(sourceResults, "errorCount")
  };
}

async function importSource(source: ImportSource): Promise<SourceImportResult> {
  const result = createSourceResult(source);

  if (!hasImporter(source)) {
    result.skippedCount = 1;
    return result;
  }

  try {
    const jobs = await withTimeout(fetchJobsForSource(source), 30000, `Timed out importing ${source.name}`);
    result.fetchedCount = jobs.length;

    for (const job of jobs) {
      try {
        const saveResult = await saveImportedJob(prisma, job);

        if (saveResult.saved) {
          result.savedCount += 1;
        }

        if (saveResult.active) {
          result.activeCount += 1;
        } else {
          result.hiddenCount += 1;
        }
      } catch (error) {
        result.errorCount += 1;
        result.errors.push(errorToMessage(error));
      }
    }

    await prisma.jobSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date() }
    });
  } catch (error) {
    result.errorCount += 1;
    result.errors.push(errorToMessage(error));
  }

  return result;
}

function hasImporter(source: ImportSource): boolean {
  return (
    source.type === JobSourceType.RSS ||
    (source.type === JobSourceType.API && (isRemoteOkSource(source) || isPublicApiSource(source) || isLinkedInSource(source)))
  );
}

async function fetchJobsForSource(source: ImportSource): Promise<ImportableJob[]> {
  if (source.type === JobSourceType.RSS) {
    return fetchRssJobs(source);
  }

  if (source.type === JobSourceType.API && isRemoteOkSource(source)) {
    return fetchRemoteOkJobs(source);
  }

  if (source.type === JobSourceType.API && isPublicApiSource(source)) {
    return fetchPublicApiJobs(source);
  }

  if (source.type === JobSourceType.API && isLinkedInSource(source)) {
    return fetchLinkedInJobs(source);
  }

  return [];
}

function createSourceResult(source: ImportSource): SourceImportResult {
  return {
    sourceId: source.id,
    sourceName: source.name,
    fetchedCount: 0,
    savedCount: 0,
    activeCount: 0,
    hiddenCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: []
  };
}

function sum(results: SourceImportResult[], key: keyof Pick<SourceImportResult, "activeCount" | "errorCount" | "fetchedCount" | "hiddenCount" | "savedCount" | "skippedCount">): number {
  return results.reduce((total, result) => total + result[key], 0);
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      cause?: unknown;
      code?: unknown;
      errors?: unknown;
      message?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.code === "string") {
      return candidate.code;
    }

    if (candidate.cause) {
      return errorToMessage(candidate.cause);
    }

    if (Array.isArray(candidate.errors) && candidate.errors.length > 0) {
      return candidate.errors.map(errorToMessage).filter(Boolean).join("; ");
    }
  }

  return String(error) || "Unknown import error";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}
