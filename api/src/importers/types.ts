import type { JobSource } from "@prisma/client";

export type ImportableJob = {
  sourceId: string;
  externalId: string | null;
  title: string;
  companyName: string | null;
  description: string | null;
  applyUrl: string;
  locationText: string | null;
  remoteText: string | null;
  employmentType: string | null;
  salaryText: string | null;
  tags: string[];
  publishedAt: Date | null;
  expiresAt: Date | null;
};

export type ImportSource = Pick<JobSource, "id" | "name" | "type" | "url">;

export type SourceImportResult = {
  sourceId: string;
  sourceName: string;
  fetchedCount: number;
  savedCount: number;
  activeCount: number;
  hiddenCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
};

export type JobImportSummary = {
  startedAt: Date;
  finishedAt: Date;
  sourceResults: SourceImportResult[];
  fetchedCount: number;
  savedCount: number;
  activeCount: number;
  hiddenCount: number;
  skippedCount: number;
  errorCount: number;
};
