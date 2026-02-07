"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const LoggerService_1 = require("../services/LoggerService");
const constants_1 = require("../constants");
const logger = new LoggerService_1.LoggerService();
const errorHandler = (error, req, res, next) => {
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
        message: constants_1.GeneralMessages.SERVER_ERROR,
        statusCode: 500,
    });
};
exports.errorHandler = errorHandler;
