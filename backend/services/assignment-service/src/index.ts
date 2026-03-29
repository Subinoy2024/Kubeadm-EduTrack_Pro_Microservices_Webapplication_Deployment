import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { config } from './config/index.js';
import { initializeDatabase } from './models/index.js';
import routes from './routes/index.js';

const app = express();

// ── Security & parsing middleware ────────────
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ─────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// ── Health check ────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ──────────────────────────────
app.use('/api/v1/assignments', routes);

// ── 404 handler ─────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ────────────────────────────
const start = async () => {
  try {
    await initializeDatabase();
    app.listen(config.port, () => {
      console.log(`[${config.serviceName}] Running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error(`[${config.serviceName}] Failed to start:`, err);
    process.exit(1);
  }
};

start();

export default app;
