"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = exports.HttpStatusMessage = exports.HttpStatus = void 0;
var HttpStatus;
(function (HttpStatus) {
    // Success
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    // Redirection
    HttpStatus[HttpStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HttpStatus[HttpStatus["FOUND"] = 302] = "FOUND";
    HttpStatus[HttpStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    // Client Errors
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    // Server Errors
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HttpStatus[HttpStatus["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatus[HttpStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
var HttpStatusMessage;
(function (HttpStatusMessage) {
    HttpStatusMessage["OK"] = "OK";
    HttpStatusMessage["CREATED"] = "Created";
    HttpStatusMessage["ACCEPTED"] = "Accepted";
    HttpStatusMessage["NO_CONTENT"] = "No Content";
    HttpStatusMessage["BAD_REQUEST"] = "Bad Request";
    HttpStatusMessage["UNAUTHORIZED"] = "Unauthorized";
    HttpStatusMessage["FORBIDDEN"] = "Forbidden";
    HttpStatusMessage["NOT_FOUND"] = "Not Found";
    HttpStatusMessage["CONFLICT"] = "Conflict";
    HttpStatusMessage["UNPROCESSABLE_ENTITY"] = "Unprocessable Entity";
    HttpStatusMessage["INTERNAL_SERVER_ERROR"] = "Internal Server Error";
})(HttpStatusMessage || (exports.HttpStatusMessage = HttpStatusMessage = {}));
class ResponseHelper {
    static createResponse(success, message, statusCode, data) {
        return {
            success,
            message,
            statusCode,
            ...(data && { data }),
        };
    }
    static success(message = HttpStatusMessage.OK, data, statusCode = HttpStatus.OK) {
        return this.createResponse(true, message, statusCode, data);
    }
    static forbidden(message = HttpStatusMessage.FORBIDDEN, statusCode = HttpStatus.FORBIDDEN) {
        return this.createResponse(true, message, statusCode);
    }
    static unProcessableEntity(message = HttpStatusMessage.UNPROCESSABLE_ENTITY, data, statusCode = HttpStatus.UNPROCESSABLE_ENTITY) {
        return this.createResponse(true, message, statusCode, data);
    }
    static error(message = HttpStatusMessage.INTERNAL_SERVER_ERROR, statusCode = HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.createResponse(false, message, statusCode);
    }
    static badRequest(message = HttpStatusMessage.BAD_REQUEST) {
        return this.error(message, HttpStatus.BAD_REQUEST);
    }
    static unauthorized(message = HttpStatusMessage.UNAUTHORIZED) {
        return this.error(message, HttpStatus.UNAUTHORIZED);
    }
    static notFound(message = HttpStatusMessage.NOT_FOUND) {
        return this.error(message, HttpStatus.NOT_FOUND);
    }
    static conflict(message = HttpStatusMessage.CONFLICT) {
        return this.error(message, HttpStatus.CONFLICT);
    }
    static created(message = HttpStatusMessage.CREATED, data) {
        return this.createResponse(true, message, HttpStatus.CREATED, data);
    }
}
exports.ResponseHelper = ResponseHelper;
exports.default = HttpStatus;
