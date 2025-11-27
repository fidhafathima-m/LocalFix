// src/types/express.d.ts
import { Request, Response, NextFunction, Application, Router } from 'express';

// Extend Express types globally
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

// Export AuthRequest that properly extends Request
export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    email?: string;
    currentRole?: string;
  };
}

// Re-export all Express types so they can be imported from this file
export { Request, Response, NextFunction, Application, Router };
