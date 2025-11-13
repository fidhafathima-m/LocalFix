import { ILogger } from "../interfaces/utils/ILogger";
import Logger from "../utils/logger";

export class LoggerService implements ILogger {
  private _logger: typeof Logger;

  constructor() {
    this._logger = Logger;
  }

  error(message: string, meta?: any): void {
    this._logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this._logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this._logger.info(message, meta);
  }

  http(message: string, meta?: any): void {
    this._logger.http(message, meta);
  }

  debug(message: string, meta?: any): void {
    this._logger.debug(message, meta);
  }

  // Method to log with context (useful for tracking requests)
  logWithContext(level: string, message: string, context: any): void {
    const logData = {
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case "error":
        this.error(message, logData);
        break;
      case "warn":
        this.warn(message, logData);
        break;
      case "info":
        this.info(message, logData);
        break;
      case "http":
        this.http(message, logData);
        break;
      case "debug":
        this.debug(message, logData);
        break;
      default:
        this.info(message, logData);
    }
  }
}
