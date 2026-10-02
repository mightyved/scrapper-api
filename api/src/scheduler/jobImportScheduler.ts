import cron, { type ScheduledTask } from "node-cron";
import { logImportError, logImportStart, logImportSummary } from "../importers/importLogger.js";
import { runJobImport } from "../importers/importRunner.js";

const defaultSchedule = "0 8 * * *";
const defaultTimezone = "Asia/Tokyo";

let scheduledTask: ScheduledTask | null = null;
let isImportRunning = false;

export function startDailyJobImportScheduler(): ScheduledTask | null {
  const enabled = process.env.IMPORT_CRON_ENABLED !== "false";
  const schedule = process.env.IMPORT_CRON_SCHEDULE || defaultSchedule;
  const timezone = process.env.IMPORT_CRON_TIMEZONE || defaultTimezone;

  if (!enabled) {
    console.log("[job-scheduler] Disabled by IMPORT_CRON_ENABLED=false");
    return null;
  }

  if (scheduledTask) {
    console.log("[job-scheduler] Already running");
    return scheduledTask;
  }

  if (!cron.validate(schedule)) {
    throw new Error(`Invalid IMPORT_CRON_SCHEDULE: ${schedule}`);
  }

  scheduledTask = cron.schedule(
    schedule,
    async () => {
      if (isImportRunning) {
        console.warn("[job-scheduler] Skipping scheduled import because a previous run is still active");
        return;
      }

      isImportRunning = true;
      logImportStart("scheduled");

      try {
        const summary = await runJobImport();
        logImportSummary("scheduled", summary);
      } catch (error) {
        logImportError("scheduled", error);
      } finally {
        isImportRunning = false;
      }
    },
    {
      name: "daily-job-import",
      noOverlap: true,
      timezone
    }
  );

  const nextRun = scheduledTask.getNextRun();
  console.log(
    `[job-scheduler] Daily job import scheduled cron="${schedule}" timezone="${timezone}" ` +
      `nextRun=${nextRun ? nextRun.toISOString() : "unknown"}`
  );

  return scheduledTask;
}

export async function stopDailyJobImportScheduler() {
  if (!scheduledTask) {
    return;
  }

  await scheduledTask.stop();
  scheduledTask = null;
  console.log("[job-scheduler] Stopped daily job import scheduler");
}
