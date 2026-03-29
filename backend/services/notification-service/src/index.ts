import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import pg from 'pg';
import { config } from './config/index.js';
import { initializeDatabase } from './models/index.js';
import { createRoutes } from './routes/index.js';

// ─── Database Pool ──────────────────────────────────────────────────────────────

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error(`[${config.serviceName}] Unexpected database pool error:`, err.message);
});

// ─── Express App ────────────────────────────────────────────────────────────────

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('short'));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: config.serviceName,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API routes
const routes = createRoutes(pool);
app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${_req.method} ${_req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(`[${config.serviceName}] Unhandled error:`, err.message, err.stack);

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : err.message,
  });
});

// ─── Server Startup ─────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log(`[${config.serviceName}] Database connected successfully`);
    client.release();

    // Initialize database tables
    await initializeDatabase(pool);
    console.log(`[${config.serviceName}] Database tables initialized`);

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`[${config.serviceName}] Server running on port ${config.port}`);
      console.log(`[${config.serviceName}] Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`[${config.serviceName}] ${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        console.log(`[${config.serviceName}] HTTP server closed`);
        await pool.end();
        console.log(`[${config.serviceName}] Database pool closed`);
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error(`[${config.serviceName}] Forced shutdown after timeout`);
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`[${config.serviceName}] Failed to start:`, error);
    await pool.end();
    process.exit(1);
  }
}

start();

export default app;
