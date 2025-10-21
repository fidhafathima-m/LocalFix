export enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export enum HttpStatusMessage {
  OK = "OK",
  CREATED = "Created",
  ACCEPTED = "Accepted",
  NO_CONTENT = "No Content",
  BAD_REQUEST = "Bad Request",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "Not Found",
  CONFLICT = "Conflict",
  UNPROCESSABLE_ENTITY = "Unprocessable Entity",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
}

export class ResponseHelper {
  static createResponse<T>(
    success: boolean,
    message: string,
    statusCode: number,
    data?: T
  ): ApiResponse<T> {
    return {
      success,
      message,
      statusCode,
      ...(data && { data }),
    };
  }

  static success<T>(
    message: string = HttpStatusMessage.OK,
    data?: T,
    statusCode: number = HttpStatus.OK
  ): ApiResponse<T> {
    return this.createResponse(true, message, statusCode, data);
  }

  static forbidden<T>(
    message: string = HttpStatusMessage.FORBIDDEN,
    statusCode: number = HttpStatus.FORBIDDEN
  ): ApiResponse<T> {
    return this.createResponse(true, message, statusCode);
  }

  static unProcessableEntity<T>(
    message: string = HttpStatusMessage.UNPROCESSABLE_ENTITY,
    data?: T,
    statusCode: number = HttpStatus.UNPROCESSABLE_ENTITY
  ): ApiResponse<T> {
    return this.createResponse(true, message, statusCode, data);
  }

  static error(
    message: string = HttpStatusMessage.INTERNAL_SERVER_ERROR,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
  ): ApiResponse {
    return this.createResponse(false, message, statusCode);
  }

  static badRequest(
    message: string = HttpStatusMessage.BAD_REQUEST
  ): ApiResponse {
    return this.error(message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(
    message: string = HttpStatusMessage.UNAUTHORIZED
  ): ApiResponse {
    return this.error(message, HttpStatus.UNAUTHORIZED);
  }

  static notFound(message: string = HttpStatusMessage.NOT_FOUND): ApiResponse {
    return this.error(message, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string = HttpStatusMessage.CONFLICT): ApiResponse {
    return this.error(message, HttpStatus.CONFLICT);
  }

  static created<T>(
    message: string = HttpStatusMessage.CREATED,
    data?: T
  ): ApiResponse<T> {
    return this.createResponse(true, message, HttpStatus.CREATED, data);
  }
}

export default HttpStatus;
