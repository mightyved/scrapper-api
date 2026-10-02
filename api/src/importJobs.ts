import "dotenv/config";
import { logImportError, logImportStart, logImportSummary } from "./importers/importLogger.js";
import { runJobImport } from "./importers/importRunner.js";
import { prisma } from "./lib/prisma.js";

async function main() {
  logImportStart("manual");
  const summary = await runJobImport();
  logImportSummary("manual", summary);

  if (summary.savedCount === 0 && summary.errorCount > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    logImportError("manual", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
