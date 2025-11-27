// src/types/express/index.d.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    email?: string;
    currentRole?: string;
  };
}
