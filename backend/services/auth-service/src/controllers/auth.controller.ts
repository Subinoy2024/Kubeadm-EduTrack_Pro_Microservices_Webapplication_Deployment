import type { Request, Response, NextFunction } from 'express';
import type { SignOptions } from 'jsonwebtoken';
import pg from 'pg';
import Joi from 'joi';
import {
  ApiResponse,
  JWTPayload,
  logger,
  hashPassword,
  verifyPassword,
  generateTokens,
  sanitizeOutput,
} from '@edutrack/shared';
import { config } from '../config/index.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  createProfile,
  createUserRole,
  createRefreshToken,
  findRefreshTokenByToken,
  deleteRefreshTokenByToken,
  deleteAllRefreshTokensForUser,
  updateUserPassword,
} from '../models/index.js';

// ─── Validation Schemas ────────────────────────────────────────────────────────

export const registerSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  firstName: Joi.string().min(1).max(100).required().trim(),
  lastName: Joi.string().min(1).max(100).required().trim(),
  phone: Joi.string().max(20).optional().allow('').trim(),
  role: Joi.string().valid('teacher', 'student').default('student'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

// ─── Helper: compute refresh token expiry as Date ──────────────────────────────

function computeRefreshExpiry(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * (multipliers[unit] || multipliers['d']));
}

// ─── Controller Factory ────────────────────────────────────────────────────────

export function createAuthController(pool: pg.Pool) {
  // ── Register ───────────────────────────────────────────────────────────────

  async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const client = await pool.connect();

    try {
      const { email, password, firstName, lastName, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await client.query(findUserByEmail, [email]);
      if (existingUser.rows.length > 0) {
        const response: ApiResponse = {
          success: false,
          error: 'An account with this email already exists.',
        };
        res.status(409).json(response);
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Begin transaction
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(createUser, [email, passwordHash]);
      const user = userResult.rows[0];

      // Create profile
      await client.query(createProfile, [user.id, firstName, lastName, phone || null]);

      // Create user role
      await client.query(createUserRole, [user.id, role]);

      // Generate tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        role,
      };
      const tokens = generateTokens(
        tokenPayload,
        config.jwtSecret,
        config.jwtExpiresIn as SignOptions['expiresIn'],
        config.refreshTokenExpiresIn as SignOptions['expiresIn']
      );
      // const tokens = generateTokens(
      //   tokenPayload,
      //   config.jwtSecret,
      //   config.jwtExpiresIn,
      //   config.refreshTokenExpiresIn
      // );

      // Store refresh token
      const refreshExpiry = computeRefreshExpiry(config.refreshTokenExpiresIn);
      await client.query(createRefreshToken, [user.id, tokens.refreshToken, refreshExpiry]);

      await client.query('COMMIT');

      logger.info('User registered successfully', { userId: user.id, email });

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName,
            lastName,
            role,
            isActive: user.is_active,
            createdAt: user.created_at,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Registration successful.',
      };

      res.status(201).json(response);
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await pool.query(findUserByEmail, [email]);
      if (result.rows.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid email or password.',
        };
        res.status(401).json(response);
        return;
      }

      const user = result.rows[0];

      // Check if account is active
      if (!user.is_active) {
        const response: ApiResponse = {
          success: false,
          error: 'Account is deactivated. Please contact support.',
        };
        res.status(403).json(response);
        return;
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid email or password.',
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokens(
        tokenPayload,
        config.jwtSecret,
        config.jwtExpiresIn as SignOptions['expiresIn'],
        config.refreshTokenExpiresIn as SignOptions['expiresIn']
      );
      // const tokens = generateTokens(
      //   tokenPayload,
      //   config.jwtSecret,
      //   config.jwtExpiresIn,
      //   config.refreshTokenExpiresIn
      // );

      // Store refresh token
      const refreshExpiry = computeRefreshExpiry(config.refreshTokenExpiresIn);
      await pool.query(createRefreshToken, [user.id, tokens.refreshToken, refreshExpiry]);

      logger.info('User logged in successfully', { userId: user.id, email });

      const response: ApiResponse = {
        success: true,
        data: {
          user: sanitizeOutput(user, ['password_hash']),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Login successful.',
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // ── Refresh Token ────────────────────────────────────────────────────────────

  async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken: token } = req.body;

      // Find the refresh token in DB
      const result = await pool.query(findRefreshTokenByToken, [token]);
      if (result.rows.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired refresh token.',
        };
        res.status(401).json(response);
        return;
      }

      const storedToken = result.rows[0];

      // Check expiry
      if (new Date(storedToken.expires_at) < new Date()) {
        await pool.query(deleteRefreshTokenByToken, [token]);
        const response: ApiResponse = {
          success: false,
          error: 'Refresh token has expired.',
        };
        res.status(401).json(response);
        return;
      }

      // Check if user is still active
      if (!storedToken.is_active) {
        const response: ApiResponse = {
          success: false,
          error: 'Account is deactivated.',
        };
        res.status(403).json(response);
        return;
      }

      // Revoke old refresh token (token rotation)
      await pool.query(deleteRefreshTokenByToken, [token]);

      // Generate new tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: storedToken.user_id,
        email: storedToken.email,
        role: storedToken.role,
      };
      const tokens = generateTokens(
        tokenPayload,
        config.jwtSecret,
        config.jwtExpiresIn as SignOptions['expiresIn'],
        config.refreshTokenExpiresIn as SignOptions['expiresIn']
      );
      // const tokens = generateTokens(
      //   tokenPayload,
      //   config.jwtSecret,
      //   config.jwtExpiresIn,
      //   config.refreshTokenExpiresIn
      // );

      // Store new refresh token
      const refreshExpiry = computeRefreshExpiry(config.refreshTokenExpiresIn);
      await pool.query(createRefreshToken, [storedToken.user_id, tokens.refreshToken, refreshExpiry]);

      logger.info('Token refreshed successfully', { userId: storedToken.user_id });

      const response: ApiResponse = {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Token refreshed successfully.',
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────────────

  async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken: token } = req.body;

      if (token) {
        // Revoke specific refresh token
        await pool.query(deleteRefreshTokenByToken, [token]);
      } else {
        // Revoke all refresh tokens for this user
        await pool.query(deleteAllRefreshTokensForUser, [req.user!.userId]);
      }

      logger.info('User logged out', { userId: req.user!.userId });

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully.',
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // ── Get Me ───────────────────────────────────────────────────────────────────

  async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pool.query(findUserById, [req.user!.userId]);

      if (result.rows.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found.',
        };
        res.status(404).json(response);
        return;
      }

      const user = result.rows[0];

      const response: ApiResponse = {
        success: true,
        data: {
          user: sanitizeOutput(user, ['password_hash']),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // ── Change Password ──────────────────────────────────────────────────────────

  async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      // Get current user with password hash
      const result = await pool.query(
        'SELECT id, email, password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found.',
        };
        res.status(404).json(response);
        return;
      }

      const user = result.rows[0];

      // Verify old password
      const isValid = await verifyPassword(oldPassword, user.password_hash);
      if (!isValid) {
        const response: ApiResponse = {
          success: false,
          error: 'Current password is incorrect.',
        };
        res.status(401).json(response);
        return;
      }

      // Hash new password and update
      const newHash = await hashPassword(newPassword);
      await pool.query(updateUserPassword, [userId, newHash]);

      // Revoke all refresh tokens to force re-login on other devices
      await pool.query(deleteAllRefreshTokensForUser, [userId]);

      logger.info('Password changed successfully', { userId });

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully. Please log in again on all devices.',
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  return {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    changePassword,
  };
}
