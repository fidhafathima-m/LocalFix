"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define level based on environment
const getLogLevel = () => {
    const env = process.env.NODE_ENV || "development";
    return env === "development" ? "debug" : "warn";
};
// Define colors for each level
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};
// Add colors to winston
winston_1.default.addColors(colors);
// Define the format for logs
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    let log = `${timestamp} [${level}]: ${message}`;
    // Add stack trace for errors
    if (stack) {
        log += `\n${stack}`;
    }
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
// Define which transports to use
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), format),
    }),
    // Daily rotate file for errors
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join("logs", "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        level: "error",
        format: format,
    }),
    // Daily rotate file for all logs
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join("logs", "combined-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: format,
    }),
    // HTTP specific logs
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join("logs", "http-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        level: "http",
        format: format,
    }),
];
// Create the logger instance
const Logger = winston_1.default.createLogger({
    level: getLogLevel(),
    levels,
    format,
    transports,
    // Do not exit on handled exceptions
    exitOnError: false,
});
// Stream for Morgan (HTTP logging)
exports.stream = {
    write: (message) => {
        Logger.http(message.trim());
    },
};
exports.default = Logger;
