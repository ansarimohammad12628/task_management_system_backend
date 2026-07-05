const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} : ${message}`;
    })
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: path.join(__dirname, "../../logs/app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d",
    }),
    new transports.Console(),
  ],
});

module.exports = logger;