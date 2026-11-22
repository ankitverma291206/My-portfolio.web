import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import authHandler from './api/auth.js';
import adminHandler from './api/admin.js';
import analyticsHandler from './api/analytics.js';
import messagesHandler from './api/messages.js';

const apiHandlers = new Map([
  ['/api/auth', authHandler],
  ['/api/admin', adminHandler],
  ['/api/analytics', analyticsHandler],
  ['/api/messages', messagesHandler],
]);

function localApi() {
  return {
    name: 'portfolio-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost');
        const handler = apiHandlers.get(requestUrl.pathname);
        if (!handler) {
          if (requestUrl.pathname.startsWith('/api/')) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'API route not found.' }));
            return;
          }
          return next();
        }

        req.query = Object.fromEntries(requestUrl.searchParams);
        if (req.method === 'POST') {
          const limit = requestUrl.pathname === '/api/analytics' || requestUrl.pathname === '/api/admin' ? 1024 : requestUrl.pathname === '/api/auth' ? 2048 : 8192;
          const contentLength = Number(req.headers['content-length'] ?? 0);
          if (Number.isFinite(contentLength) && contentLength > limit) {
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Request is too large.' }));
            return;
          }
          if (String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
            const chunks = [];
            let total = 0;
            for await (const chunk of req) {
              total += chunk.length;
              if (total > limit) {
                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'Request is too large.' }));
                return;
              }
              chunks.push(chunk);
            }
            try {
              req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: 'Invalid JSON request.' }));
              return;
            }
          }
        }

        try {
          await handler(req, res);
        } catch {
          if (res.headersSent) return res.end();
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'The request could not be completed.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '');
  for (const key of ['DATABASE_URL', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET']) {
    if (!process.env[key] && localEnv[key]) process.env[key] = localEnv[key];
  }

  return {
    plugins: [react(), tailwindcss(), localApi()],
  };
});
