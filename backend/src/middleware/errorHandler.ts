import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';
import { GeneralMessages } from '../constants';

const logger = new LoggerService();

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const context = {
    operation: 'errorHandler',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };

  logger.error('Unhandled error occurred', {
    ...context,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    success: false,
    message: GeneralMessages.SERVER_ERROR,
    statusCode: 500,
  });
};
