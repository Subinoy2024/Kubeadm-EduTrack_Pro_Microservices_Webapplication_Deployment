import { Router } from 'express';
import pg from 'pg';
import { authenticate, validateRequest } from '@edutrack/shared';
import { config } from '../config/index.js';
import {
  createAuthController,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../controllers/auth.controller.js';
import { loginRateLimiter, registerRateLimiter } from '../middleware/index.js';

export function createAuthRoutes(pool: pg.Pool): Router {
  const router = Router();
  const controller = createAuthController(pool);
  const auth = authenticate(config.jwtSecret);

  // Public routes
  router.post('/register', registerRateLimiter, validateRequest(registerSchema), controller.register);
  router.post('/login', loginRateLimiter, validateRequest(loginSchema), controller.login);
  router.post('/refresh-token', validateRequest(refreshTokenSchema), controller.refreshToken);

  // Authenticated routes
  router.post('/logout', auth, controller.logout);
  router.get('/me', auth, controller.getMe);
  router.put('/change-password', auth, validateRequest(changePasswordSchema), controller.changePassword);

  return router;
}
