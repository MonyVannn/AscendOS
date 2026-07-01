import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "sync field trainer weeks",
  { hourUTC: 6, minuteUTC: 0 },
  internal.fieldTrainer.syncEnrollmentWeeks
);

export default crons;
