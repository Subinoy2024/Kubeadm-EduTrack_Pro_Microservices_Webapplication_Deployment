import { Router } from 'express';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createNotificationController } from '../controllers/notification.controller.js';
import { config } from '../config/index.js';

// ─── Extend Express Request ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'admin' | 'teacher' | 'student';
        iat?: number;
        exp?: number;
      };
    }
  }
}

// ─── Authentication Middleware ───────────────────────────────────────────────────

function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
      role: 'admin' | 'teacher' | 'student';
      iat?: number;
      exp?: number;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

// ─── Authorization Middleware ────────────────────────────────────────────────────

function authorize(...roles: Array<'admin' | 'teacher' | 'student'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Access denied. Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
}

// ─── Route Factory ──────────────────────────────────────────────────────────────

export function createRoutes(pool: pg.Pool): Router {
  const router = Router();
  const controller = createNotificationController(pool);

  // Authenticated user routes
  router.get('/notifications', authenticate, controller.getNotifications);
  router.get('/notifications/unread-count', authenticate, controller.getUnreadCount);
  router.put('/notifications/:id/read', authenticate, controller.markAsRead);
  router.put('/notifications/read-all', authenticate, controller.markAllAsRead);

  // Admin/Internal routes
  router.post(
    '/notifications',
    authenticate,
    authorize('admin', 'teacher'),
    controller.createNotification
  );
  router.post(
    '/notifications/broadcast',
    authenticate,
    authorize('admin'),
    controller.broadcastNotification
  );

  // Internal email endpoint (service-to-service)
  router.post('/email/send', authenticate, authorize('admin', 'teacher'), controller.sendEmail);

  return router;
}
