import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';

import type { Env } from './types.js';
import { registerRoutes } from './routes/index.js';

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

const app = new OpenAPIHono<Env>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          message: 'Validation failed',
          errors: result.error.issues,
        },
        400,
      );
    }
  },
});

app.use(
  '*',
  cors({
    origin: corsOrigins,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Bearer token authentication',
});

registerRoutes(app);

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Team 7 API',
    version: '1.0.0',
    description: 'Hono API with Zod OpenAPI and Scalar UI',
  },
});

app.get(
  '/ui',
  apiReference({
    url: '/doc',
    theme: 'saturn',
  }),
);

app.get('/', (c) => c.text('API running. See /ui for docs.'));

export default {
  fetch: app.fetch,
  port: 3001,
};
