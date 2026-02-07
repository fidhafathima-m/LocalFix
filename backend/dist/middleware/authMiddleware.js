"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAllRoles = exports.requireRole = exports.user = exports.serviceProvider = exports.admin = exports.protectWithRefresh = exports.protect = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const UserSchema_1 = __importDefault(require("../models/UserSchema"));
const responseHelper_1 = require("../utils/responseHelper");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        const response = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
        return res.status(response.statusCode || 401).json(response);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Token is valid, proceed
        await setUserFromToken(decoded, req, res, next);
    }
    catch (error) {
        console.error('Token verification failed:', error);
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            // Instead of immediately rejecting, check if we can refresh
            const response = responseHelper_1.ResponseHelper.unauthorized('Token expired');
            return res.status(response.statusCode || 401).json({
                ...response,
                code: 'TOKEN_EXPIRED',
                expiredAt: error.expiredAt,
            });
        }
        // Handle other token errors
        const response = responseHelper_1.ResponseHelper.unauthorized('Invalid token');
        return res.status(response.statusCode || 401).json(response);
    }
};
exports.protect = protect;
// Helper function to set user from token
const setUserFromToken = async (decoded, req, res, next) => {
    const userId = decoded._id || decoded.id;
    if (!userId) {
        const response = responseHelper_1.ResponseHelper.unauthorized('Invalid token structure');
        return res.status(response.statusCode || 401).json(response);
    }
    const user = await UserSchema_1.default.findById(userId).select('-passwordHash');
    if (!user) {
        const response = responseHelper_1.ResponseHelper.notFound('User not found');
        return res.status(response.statusCode || 404).json(response);
    }
    // Check if user is active and not blocked
    if (user.isDeleted) {
        const response = responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
        return res.status(response.statusCode || 403).json(response);
    }
    if (user.status === 'Blocked') {
        const response = responseHelper_1.ResponseHelper.forbidden('Account has been blocked');
        return res.status(response.statusCode || 403).json(response);
    }
    if (user.status !== 'Active') {
        const response = responseHelper_1.ResponseHelper.forbidden('Account is not active');
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
const protectWithRefresh = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return responseHelper_1.ResponseHelper.unauthorized('Authentication required');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id || decoded.id;
        if (!userId) {
            return responseHelper_1.ResponseHelper.unauthorized('Invalid token structure');
        }
        const user = await UserSchema_1.default.findById(userId).select('-passwordHash');
        if (!user) {
            return responseHelper_1.ResponseHelper.notFound('User not found');
        }
        // Check if user is active and not blocked
        if (user.isDeleted) {
            return responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
        }
        if (user.status === 'Blocked') {
            return responseHelper_1.ResponseHelper.forbidden('Account has been blocked');
        }
        if (user.status !== 'Active') {
            return responseHelper_1.ResponseHelper.forbidden('Account is not active');
        }
        req.user = {
            id: user._id.toString(),
            roles: user.roles,
            email: user.email,
            currentRole: decoded.currentRole || user.roles[0],
        };
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            const response = responseHelper_1.ResponseHelper.unauthorized('Token expired');
            return res.status(response.statusCode).json({
                ...response,
                code: 'TOKEN_EXPIRED',
                expiredAt: error.expiredAt,
            });
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            const response = responseHelper_1.ResponseHelper.unauthorized('Invalid token');
            return res.status(response.statusCode).json({
                ...response,
                code: 'INVALID_TOKEN',
            });
        }
        return responseHelper_1.ResponseHelper.unauthorized('Authentication failed');
    }
};
exports.protectWithRefresh = protectWithRefresh;
const admin = (req, res, next) => {
    if (req.user && req.user.roles.includes('admin')) {
        next();
    }
    else {
        return responseHelper_1.ResponseHelper.forbidden('Access denied. Admin role required.');
    }
};
exports.admin = admin;
exports.serviceProvider = [
    exports.protect,
    (req, res, next) => {
        if (req.user && req.user.roles.includes('serviceProvider')) {
            next();
        }
        else {
            return responseHelper_1.ResponseHelper.forbidden('Access denied. Service Provider role required.');
        }
    },
];
const user = (req, res, next) => {
    if (req.user && req.user.roles.includes('user')) {
        next();
    }
    else {
        return responseHelper_1.ResponseHelper.forbidden('Access denied. User role required.');
    }
};
exports.user = user;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return responseHelper_1.ResponseHelper.unauthorized('Authentication required');
        }
        const hasRequiredRole = roles.some(role => req.user.roles.includes(role));
        if (hasRequiredRole) {
            next();
        }
        else {
            return responseHelper_1.ResponseHelper.forbidden(`Access denied. Required one of: ${roles.join(', ')}`);
        }
    };
};
exports.requireRole = requireRole;
const requireAllRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return responseHelper_1.ResponseHelper.unauthorized('Authentication required');
        }
        const hasAllRoles = roles.every(role => req.user.roles.includes(role));
        if (hasAllRoles) {
            next();
        }
        else {
            return responseHelper_1.ResponseHelper.forbidden(`Access denied. Required all roles: ${roles.join(', ')}`);
        }
    };
};
exports.requireAllRoles = requireAllRoles;
