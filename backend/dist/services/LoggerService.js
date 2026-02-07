"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class LoggerService {
    constructor() {
        this._logger = logger_1.default;
    }
    error(message, meta) {
        this._logger.error(message, meta);
    }
    warn(message, meta) {
        this._logger.warn(message, meta);
    }
    info(message, meta) {
        this._logger.info(message, meta);
    }
    http(message, meta) {
        this._logger.http(message, meta);
    }
    debug(message, meta) {
        this._logger.debug(message, meta);
    }
    // Method to log with context (useful for tracking requests)
    logWithContext(level, message, context) {
        const logData = {
            message,
            context,
            timestamp: new Date().toISOString(),
        };
        switch (level) {
            case 'error':
                this.error(message, logData);
                break;
            case 'warn':
                this.warn(message, logData);
                break;
            case 'info':
                this.info(message, logData);
                break;
            case 'http':
                this.http(message, logData);
                break;
            case 'debug':
                this.debug(message, logData);
                break;
            default:
                this.info(message, logData);
        }
    }
}
exports.LoggerService = LoggerService;
