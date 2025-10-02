// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/user/user.model";

export interface AuthRequest extends Request {
  user?: { 
    id: string; 
    role?: string;
    email?: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  console.log("🔐 Auth Middleware - Headers:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("🔐 No token provided");
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    console.log("🔐 Token decoded:", decoded);

    const userId = decoded._id || decoded.id;
    
    if (!userId) {
      console.log("🔐 No user ID found in token");
      return res.status(401).json({ message: "Invalid token structure" });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log("🔐 User not found for ID:", userId);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { 
      id: (user._id as string).toString(),
      role: user.role,
      email: user.email
    };
    
    console.log("🔐 Auth successful for user:", req.user.id);
    next();
  } catch (error) {
    console.error("🔐 Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};