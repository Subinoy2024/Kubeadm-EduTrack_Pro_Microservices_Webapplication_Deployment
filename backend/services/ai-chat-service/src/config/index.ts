import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3007', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edutrack',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  aiProvider: process.env.AI_PROVIDER || 'built-in',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  serviceName: 'ai-chat-service',
};
