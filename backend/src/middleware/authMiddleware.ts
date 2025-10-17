import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema";
import { Types } from "mongoose";
import { ResponseHelper } from "../utils/responseHelper";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return ResponseHelper.unauthorized("Authentication required")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const userId = decoded._id || decoded.id;

    if (!userId) {
      return ResponseHelper.unauthorized("Invalid token structure")
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return ResponseHelper.notFound("User not found")
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return ResponseHelper.unauthorized("Invalid token")
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return ResponseHelper.forbidden("Access denied. Admin role required.")
  }
};

export const serviceProvider = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "serviceProvider") {
    next();
  } else {
    return ResponseHelper.forbidden("Access denied. Service Provider role required.")
  }
};

export const user = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    return ResponseHelper.forbidden("Access denied. User role required.")
  }
};

// Combined role middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role || "")) {
      next();
    } else {
      return ResponseHelper.forbidden(`Access denied. Required roles: ${roles.join(", ")}`)
    }
  };
};
