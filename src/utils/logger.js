import logger from "pino";
import dayjs from "dayjs";

const log = logger({
  transport: {
    target: "pino-pretty", // Enables pretty print
  },
  base: {
    pid: false, // Excludes the process ID from log output
  },
  timestamp: () => `,"time":"${dayjs().format()}"`, // Properly formats the timestamp
});

export default log;