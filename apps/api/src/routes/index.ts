import type { OpenAPIHono } from '@hono/zod-openapi';

import type { Env } from '../types.js';
import { postBootstrapHandler } from './bootstrap/post-bootstrap.handler.js';
import { postBootstrapRoute } from './bootstrap/post-bootstrap.route.js';
import { requireAuth } from '../middlewares/auth.js';
import { listDocumentsHandler } from './documents/list-documents.handler.js';
import { listDocumentsRoute } from './documents/list-documents.route.js';
import { getExampleHandler } from './example/get-example.handler.js';
import { getExampleRoute } from './example/get-example.route.js';
import { getHealthHandler } from './health/get-health.handler.js';
import { getHealthRoute } from './health/get-health.route.js';
import { listInvoicesHandler } from './invoices/list-invoices.handler.js';
import { listInvoicesRoute } from './invoices/list-invoices.route.js';
import { getMeHandler } from './profile/get-me.handler.js';
import { getMeRoute } from './profile/get-me.route.js';

export const registerRoutes = (app: OpenAPIHono<Env>) => {
  app.openapi(getExampleRoute, getExampleHandler);
  app.openapi(getHealthRoute, getHealthHandler);
  app.use('/v1/*', requireAuth);
  app.openapi(postBootstrapRoute, postBootstrapHandler);
  app.openapi(getMeRoute, getMeHandler);
  app.openapi(listDocumentsRoute, listDocumentsHandler);
  app.openapi(listInvoicesRoute, listInvoicesHandler);
};
