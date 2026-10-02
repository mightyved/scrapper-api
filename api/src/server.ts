import "dotenv/config";
import { app } from "./app.js";
import { startDailyJobImportScheduler } from "./scheduler/jobImportScheduler.js";

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  startDailyJobImportScheduler();
});
