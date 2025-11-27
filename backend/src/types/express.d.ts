// src/types/express.d.ts
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

// Manual extension to ensure all properties are included
export interface AuthRequest {
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
