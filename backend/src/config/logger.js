import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define log directories
const logDirectories = {
    combined: path.join(__dirname, "../logs/combinedLog"),
    error: path.join(__dirname, "../logs/errorLog"),
    app: path.join(__dirname, "../logs/appLog"),

};

// Ensure log directories exist
Object.values(logDirectories).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) =>
    `${timestamp} ${level.toUpperCase()}: ${message}${stack ? `\n${stack}` : ""}`,
);

// Logger instance
export const logger = winston.createLogger({
    level: "info", // Default log level
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        logFormat,
    ),
    transports: [
        // Console logging with color
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
        }),

        // Log all levels (info, warn, error, etc.) in `combined.log`
        new DailyRotateFile({
            filename: path.join(logDirectories.combined, "combined-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            level: "info",
        }),

        // Log only errors in `error.log`
        new DailyRotateFile({
            filename: path.join(logDirectories.error, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            level: "error",
        }),

        // Daily rotating log files for all logs
        new DailyRotateFile({
            filename: path.join(logDirectories.app, "app-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            level: "info",
        }),
    ],
});

