import type { JobImportSummary, SourceImportResult } from "./types.js";

export type ImportRunMode = "manual" | "scheduled";

export function logImportStart(mode: ImportRunMode) {
  console.log(`[job-import:${mode}] Started at ${new Date().toISOString()}`);
}

export function logImportSummary(mode: ImportRunMode, summary: JobImportSummary) {
  const durationMs = summary.finishedAt.getTime() - summary.startedAt.getTime();

  console.log(
    `[job-import:${mode}] Finished at ${summary.finishedAt.toISOString()} ` +
      `duration=${formatDuration(durationMs)} fetched=${summary.fetchedCount} saved=${summary.savedCount} ` +
      `active=${summary.activeCount} hidden=${summary.hiddenCount} skipped=${summary.skippedCount} errors=${summary.errorCount}`
  );

  for (const source of summary.sourceResults) {
    logSourceSummary(mode, source);
  }
}

export function logImportError(mode: ImportRunMode, error: unknown) {
  console.error(`[job-import:${mode}] Failed at ${new Date().toISOString()}`, error);
}

function logSourceSummary(mode: ImportRunMode, source: SourceImportResult) {
  console.log(
    `[job-import:${mode}] Source "${source.sourceName}" ` +
      `fetched=${source.fetchedCount} saved=${source.savedCount} active=${source.activeCount} ` +
      `hidden=${source.hiddenCount} skipped=${source.skippedCount} errors=${source.errorCount}`
  );

  for (const error of source.errors) {
    console.error(`[job-import:${mode}] Source "${source.sourceName}" error: ${error}`);
  }
}

function formatDuration(durationMs: number): string {
  return `${Math.round(durationMs / 1000)}s`;
}
