import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
        email?: string;
        currentRole?: string;
      };
      // Add all the standard Express request properties
      body: any;
      params: any;
      query: any;
      headers: any;
      method: string;
      url: string;
      ip: string;
      file?: any;
      files?: any;
    }

    interface Response {
      // Add standard response methods you use
      status(code: number): Response;
      json(body: any): Response;
      send(body: any): Response;
    }

    interface Application {
      // Add application methods you use
      use(middleware: any): Application;
      listen(port: number, callback?: () => void): any;
    }

    interface NextFunction {
      (err?: any): void;
    }
  }

  namespace Express.Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}

// Export the types
export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    roles: string[];
    email?: string;
    currentRole?: string;
  };
}

// Re-export Express types
export { Request, Response, NextFunction, Application, Router } from 'express';
