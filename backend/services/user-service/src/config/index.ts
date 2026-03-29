import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edutrack_users',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  serviceName: 'user-service',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;
