import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edutrack_meetings',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  serviceName: 'meeting-service',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;
