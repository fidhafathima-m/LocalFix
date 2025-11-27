import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
        email?: string;
        currentRole?: string;
      };
    }
  }
}

// Complete AuthRequest with all properties
export interface AuthRequest extends Request {
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
  file?: any;
  files?: any;
  [key: string]: any;
}
export { Response, NextFunction, Router } from 'express';
export * from 'express';
