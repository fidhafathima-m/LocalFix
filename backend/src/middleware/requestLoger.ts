import { Request, Response, NextFunction } from "express";
import { LoggerService } from "../services/LoggerService";

const logger = new LoggerService();

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log incoming request
  logger.http("Incoming request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined,
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.http("Request completed", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length"),
    });
  });

  next();
};
