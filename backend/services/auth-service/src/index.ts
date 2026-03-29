import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import {
  logger,
  createDbPool,
  requestId,
  errorHandler,
  notFoundHandler,
} from '@edutrack/shared';
import { config } from './config/index.js';
import { createAuthRoutes } from './routes/index.js';
import {
  createUsersTable,
  createProfilesTable,
  createUserRolesTable,
  createRefreshTokensTable,
} from './models/index.js';

// ─── Initialize Database ───────────────────────────────────────────────────────

const pool = createDbPool(config.dbUrl!);

async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(createUsersTable);
    await client.query(createProfilesTable);
    await client.query(createUserRolesTable);
    await client.query(createRefreshTokensTable);
    logger.info('Database tables initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize database tables', { error: (err as Error).message });
    throw err;
  } finally {
    client.release();
  }
}

// ─── Create Express App ────────────────────────────────────────────────────────

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
}));
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Request ID
app.use(requestId);

// ─── Health Check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/v1/auth', createAuthRoutes(pool));

// ─── Error Handling ────────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  try {
    await initializeDatabase();

    const server = app.listen(config.port, () => {
      logger.info(`${config.serviceName} running on port ${config.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await pool.end();
          logger.info('Database pool closed');
        } catch (err) {
          logger.error('Error closing database pool', { error: (err as Error).message });
        }

        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
