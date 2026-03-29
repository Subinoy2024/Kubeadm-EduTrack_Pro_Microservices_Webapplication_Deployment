import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { config } from './config/index.js';
import { createTables } from './models/index.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(hpp());
app.use(cors());

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: config.serviceName,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/courses', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found.',
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[${config.serviceName}] Unhandled error:`, err);
  res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
});

const start = async () => {
  try {
    await createTables();
    app.listen(config.port, () => {
      console.log(`[${config.serviceName}] Running on port ${config.port}`);
    });
  } catch (error) {
    console.error(`[${config.serviceName}] Failed to start:`, error);
    process.exit(1);
  }
};

start();

export default app;
