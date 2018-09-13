import os = require("os");
import path = require("path");
import * as log4js from "log4js";

const BACKUP_FILE_COUNT = 3;
const LOG_FILE_PATH =
  process.env.NVIM_CTRLB_LOG_FILE || path.join(os.homedir(), "ctrlb.log");

const level = process.env.NVIM_CTRLB_LOG_LEVEL || "info";

log4js.configure({
  appenders: {
    outputFile: {
      type: "file",
      filename: LOG_FILE_PATH,
      maxLogSize: 1024 * 1024,
      backups: BACKUP_FILE_COUNT,
      layout: {
        type: "pattern",
        pattern: `%d{ISO8601} %p (pid:${process.pid}) [%c] - %m`,
      },
    },
  },
  categories: {
    default: { appenders: ["outputFile"], level },
  },
});

export const getLogger = (name: string = "ctrlb"): log4js.Logger => {
  return log4js.getLogger(name);
};
