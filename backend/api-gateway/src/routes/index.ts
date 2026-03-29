import { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config/index.js';

function createProxy(target: string, pathRewrite?: Record<string, string>): any {
  const options: Options = {
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req: any) => {
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if (req.headers['x-request-id']) {
          proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
        }
      },
      error: (err, _req, res: any) => {
        console.error('Proxy error:', err.message);
        if (res.writeHead) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              error: 'Service unavailable',
            })
          );
        }
      },
    },
  };

  return createProxyMiddleware(options);
}

export function setupRoutes(app: any) {
  app.use(
    '/api/v1/auth',
    createProxy(config.services.auth, {
      '^/': '/api/v1/auth/',
    })
  );

  app.use(
    '/api/v1/users',
    createProxy(config.services.user, {
      '^/': '/api/v1/users/',
    })
  );

  app.use(
    '/api/v1/courses',
    createProxy(config.services.course, {
      '^/': '/api/v1/courses/',
    })
  );

  app.use(
    '/api/v1/assignments',
    createProxy(config.services.assignment, {
      '^/': '/api/v1/assignments/',
    })
  );

  app.use(
    '/api/v1/meetings',
    createProxy(config.services.meeting, {
      '^/': '/api/v1/meetings/',
    })
  );

  app.use(
    '/api/v1/recordings',
    createProxy(config.services.recording, {
      '^/': '/api/v1/recordings/',
    })
  );

  app.use(
    '/api/v1/chat',
    createProxy(config.services.aiChat, {
      '^/': '/api/v1/chat/',
    })
  );

  app.use(
    '/api/v1/notifications',
    createProxy(config.services.notification, {
      '^/': '/api/v1/notifications/',
    })
  );
}

export function setupHealthRoutes(app: any) {
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/v1/health', async (_req: Request, res: Response) => {
    const services = config.services;
    const checks: Record<string, string> = {};

    for (const [name, url] of Object.entries(services)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${url}/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeout);
        checks[name] = response.ok ? 'healthy' : 'unhealthy';
      } catch {
        checks[name] = 'unreachable';
      }
    }

    const allHealthy = Object.values(checks).every((status) => status === 'healthy');

    res.status(allHealthy ? 200 : 207).json({
      status: allHealthy ? 'ok' : 'degraded',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      services: checks,
    });
  });
}