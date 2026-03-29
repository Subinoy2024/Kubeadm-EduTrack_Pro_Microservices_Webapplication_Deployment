import crypto from 'crypto';
import { promisify } from 'util';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import winston from 'winston';
import pg from 'pg';
import { JWTPayload } from '../types/index.js';

const scrypt = promisify(crypto.scrypt);

// ─── Logger ────────────────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.label({ label: process.env.SERVICE_NAME || 'edutrack' }),
    winston.format.printf(({ timestamp, level, message, label, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      if (stack) {
        return `${timestamp} [${label}] ${level}: ${message}\n${stack}${metaStr}`;
      }
      return `${timestamp} [${label}] ${level}: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.label({ label: process.env.SERVICE_NAME || 'edutrack' }),
        winston.format.printf(({ timestamp, level, message, label, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          if (stack) {
            return `${timestamp} [${label}] ${level}: ${message}\n${stack}${metaStr}`;
          }
          return `${timestamp} [${label}] ${level}: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

// ─── Database Pool ─────────────────────────────────────────────────────────────

export function createDbPool(connectionString: string): pg.Pool {
  const pool = new pg.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err: Error) => {
    logger.error('Unexpected database pool error', { error: err.message });
  });

  pool.on('connect', () => {
    logger.debug('New database connection established');
  });

  return pool;
}

// ─── Password Hashing ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) {
    return false;
  }
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
}

// ─── JWT Tokens ────────────────────────────────────────────────────────────────

export function generateTokens(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: Secret,
  accessExpiresIn: SignOptions['expiresIn'] = '15m',
  refreshExpiresIn: SignOptions['expiresIn'] = '7d'
): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(payload, secret, {
    expiresIn: accessExpiresIn,
  });

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    secret,
    {
      expiresIn: refreshExpiresIn,
    }
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string, secret: string): JWTPayload {
  const decoded = jwt.verify(token, secret) as JWTPayload;
  return decoded;
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export function paginate(
  page: number = 1,
  limit: number = 20
): { offset: number; limit: number } {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  return {
    offset: (safePage - 1) * safeLimit,
    limit: safeLimit,
  };
}

// ─── Sanitize Output ───────────────────────────────────────────────────────────

export function sanitizeOutput<T extends Record<string, any>>(
  obj: T,
  excludeFields: string[]
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };
  for (const field of excludeFields) {
    delete sanitized[field];
  }
  return sanitized;
}
