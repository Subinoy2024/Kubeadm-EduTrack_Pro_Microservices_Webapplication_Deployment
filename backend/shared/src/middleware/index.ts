import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { JWTPayload, ApiResponse, AppRole } from '../types/index.js';
import { logger, verifyToken } from '../utils/index.js';

// ─── Extend Express Request ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      requestId?: string;
    }
  }
}

// ─── Error Handler ─────────────────────────────────────────────────────────────

export function errorHandler(
  err: Error & { statusCode?: number; isOperational?: boolean },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    requestId: req.requestId,
    isOperational,
  });

  const response: ApiResponse = {
    success: false,
    error: statusCode === 500 && !isOperational
      ? 'Internal server error'
      : err.message,
  };

  res.status(statusCode).json(response);
}

// ─── Not Found Handler ─────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  };

  res.status(404).json(response);
}

// ─── Request Validation ────────────────────────────────────────────────────────

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => detail.message).join(', ');
      const response: ApiResponse = {
        success: false,
        error: `Validation error: ${details}`,
      };
      res.status(400).json(response);
      return;
    }

    req.body = value;
    next();
  };
}

// ─── Authentication ────────────────────────────────────────────────────────────

export function authenticate(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. No token provided.',
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token.',
      };
      res.status(401).json(response);
      return;
    }
  };
}

// ─── Authorization ─────────────────────────────────────────────────────────────

export function authorize(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Not authenticated.',
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Insufficient permissions.',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
}

// ─── Request ID ────────────────────────────────────────────────────────────────

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
