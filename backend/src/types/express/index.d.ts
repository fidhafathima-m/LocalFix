import { JwtPayload } from 'jsonwebtoken';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
  Application as ExpressApplication,
  Router as ExpressRouter,
} from 'express';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
        email?: string;
        currentRole?: string;
      };
      body: any;
      params: any;
      query: any;
      headers: any;
      method: string;
      url: string;
      ip: string;
      file?: Express.Multer.File;
      files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
    }

    interface Response {
      status(code: number): Response;
      json(body: any): Response;
      send(body: any): Response;
    }

    interface Application {
      use(middleware: any): Application;
      listen(port: number, callback?: () => void): any;
    }

    interface NextFunction {
      (err?: any): void;
    }
  }
}

// Export the custom AuthRequest type
export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    roles: string[];
    email?: string;
    currentRole?: string;
  };
}

// Re-export Express types
export {
  ExpressRequest as Request,
  ExpressResponse as Response,
  ExpressNextFunction as NextFunction,
  ExpressApplication as Application,
  ExpressRouter as Router,
};
