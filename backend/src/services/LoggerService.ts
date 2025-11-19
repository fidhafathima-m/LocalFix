import { ILogger } from '../interfaces/utils/ILogger';
import Logger from '../utils/logger';

type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

export class LoggerService implements ILogger {
  private _logger: typeof Logger;

  constructor() {
    this._logger = Logger;
  }

  error(message: string, meta?: LogContext): void {
    this._logger.error(message, meta);
  }

  warn(message: string, meta?: LogContext): void {
    this._logger.warn(message, meta);
  }

  info(message: string, meta?: LogContext): void {
    this._logger.info(message, meta);
  }

  http(message: string, meta?: LogContext): void {
    this._logger.http(message, meta);
  }

  debug(message: string, meta?: LogContext): void {
    this._logger.debug(message, meta);
  }

  // Method to log with context (useful for tracking requests)
  logWithContext(level: LogLevel, message: string, context: LogContext): void {
    const logData: LogContext & { timestamp: string } = {
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
