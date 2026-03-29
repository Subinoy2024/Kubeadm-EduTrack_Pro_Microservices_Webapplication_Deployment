import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import { config } from './config/index.js';
import { globalRateLimiter, requestId, requestLogger } from './middleware/index.js';
import { setupRoutes, setupHealthRoutes } from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(hpp());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Request processing
app.use(requestId);
app.use(requestLogger);
app.use(globalRateLimiter);
app.use(morgan('combined'));

// Health routes (before proxy)
setupHealthRoutes(app);

// Proxy routes to microservices
setupRoutes(app);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Gateway error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log('Service routes configured:');
  Object.entries(config.services).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;