import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';

import { rateLimit } from './middlewares/rate-limit.js';
import { registerRoutes } from './routes/index.js';
import type { Env } from './types.js';

const app = new OpenAPIHono<Env>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ message: 'Validation failed', errors: result.error.issues }, 400);
    }
  },
});

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use('*', rateLimit({ windowMs: 60_000, max: 100 }));

registerRoutes(app);

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Example Hono Backend',
    version: '1.0.0',
    description: 'Example Node.js backend built with Hono, Zod, OpenAPI, rate limiting, and caching.',
  },
});

app.get('/ui', apiReference({ spec: { url: '/doc' }, theme: 'saturn' }));
app.get('/', (c) => c.text('Server running. See /ui for API docs.'));

const port = parseInt(process.env.PORT ?? '3002', 10);
serve({ fetch: app.fetch, port });
console.log(`Server running on http://localhost:${port}`);
