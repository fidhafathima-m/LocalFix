import { Request, Response, NextFunction } from 'express';
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import User from '../models/UserSchema';
import { Types } from 'mongoose';
import { ResponseHelper } from '../utils/responseHelper';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    email?: string;
    currentRole?: string;
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
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const response = ResponseHelper.unauthorized('Authentication required');
    return res.status(response.statusCode || 401).json(response);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Token is valid, proceed
    await setUserFromToken(decoded, req, res, next);
  } catch (error) {
    console.error('Token verification failed:', error);

    if (error instanceof TokenExpiredError) {
      // Instead of immediately rejecting, check if we can refresh
      const response = ResponseHelper.unauthorized('Token expired');
      return res.status(response.statusCode || 401).json({
        ...response,
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    // Handle other token errors
    const response = ResponseHelper.unauthorized('Invalid token');
    return res.status(response.statusCode || 401).json(response);
  }
};

// Helper function to set user from token
const setUserFromToken = async (
  decoded: JwtPayload,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = decoded._id || decoded.id;

  if (!userId) {
    const response = ResponseHelper.unauthorized('Invalid token structure');
    return res.status(response.statusCode || 401).json(response);
  }

  const user = await User.findById(userId).select('-passwordHash');

  if (!user) {
    const response = ResponseHelper.notFound('User not found');
    return res.status(response.statusCode || 404).json(response);
  }

  // Check if user is active and not blocked
  if (user.isDeleted) {
    const response = ResponseHelper.forbidden('Account has been deleted');
    return res.status(response.statusCode || 403).json(response);
  }

  if (user.status === 'Blocked') {
    const response = ResponseHelper.forbidden('Account has been blocked');
    return res.status(response.statusCode || 403).json(response);
  }

  if (user.status !== 'Active') {
    const response = ResponseHelper.forbidden('Account is not active');
    return res.status(response.statusCode || 403).json(response);
  }

  req.user = {
    id: user._id.toString(),
    roles: user.roles,
    email: user.email,
    currentRole: decoded.currentRole || user.roles[0],
  };

  next();
};

export const protectWithRefresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ResponseHelper.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const userId = decoded._id || decoded.id;

    if (!userId) {
      return ResponseHelper.unauthorized('Invalid token structure');
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return ResponseHelper.notFound('User not found');
    }

    // Check if user is active and not blocked
    if (user.isDeleted) {
      return ResponseHelper.forbidden('Account has been deleted');
    }

    if (user.status === 'Blocked') {
      return ResponseHelper.forbidden('Account has been blocked');
    }

    if (user.status !== 'Active') {
      return ResponseHelper.forbidden('Account is not active');
    }

    req.user = {
      id: user._id.toString(),
      roles: user.roles,
      email: user.email,
      currentRole: decoded.currentRole || user.roles[0],
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);

    if (error instanceof TokenExpiredError) {
      const response = ResponseHelper.unauthorized('Token expired');
      return res.status(response.statusCode).json({
        ...response,
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    if (error instanceof JsonWebTokenError) {
      const response = ResponseHelper.unauthorized('Invalid token');
      return res.status(response.statusCode).json({
        ...response,
        code: 'INVALID_TOKEN',
      });
    }

    return ResponseHelper.unauthorized('Authentication failed');
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.roles.includes('admin')) {
    next();
  } else {
    return ResponseHelper.forbidden('Access denied. Admin role required.');
  }
};

export const serviceProvider = [
  protect,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.roles.includes('serviceProvider')) {
      next();
    } else {
      return ResponseHelper.forbidden(
        'Access denied. Service Provider role required.'
      );
    }
  },
];

export const user = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.roles.includes('user')) {
    next();
  } else {
    return ResponseHelper.forbidden('Access denied. User role required.');
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseHelper.unauthorized('Authentication required');
    }

    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));

    if (hasRequiredRole) {
      next();
    } else {
      return ResponseHelper.forbidden(
        `Access denied. Required one of: ${roles.join(', ')}`
      );
    }
  };
};

export const requireAllRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseHelper.unauthorized('Authentication required');
    }

    const hasAllRoles = roles.every(role => req.user!.roles.includes(role));

    if (hasAllRoles) {
      next();
    } else {
      return ResponseHelper.forbidden(
        `Access denied. Required all roles: ${roles.join(', ')}`
      );
    }
  };
};
