import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';

const HistoryPointSchema = z.object({
  label: z.string(),
  date: z.string(),
  avgScore: z.number(),
  count: z.number(),
});

const StatsResponseSchema = z
  .object({
    userId: z.string(),
    avgScore: z.number(),
    topScore: z.number(),
    assessmentCount: z.number(),
    percentile: z.number(),
    rank: z.number(),
    totalRankedDevelopers: z.number(),
    history: z.object({
      daily: z.array(HistoryPointSchema),
      weekly: z.array(HistoryPointSchema),
      monthly: z.array(HistoryPointSchema),
    }),
  })
  .openapi('ProfileStats');

export const getStatsRoute = createRoute({
  method: 'get',
  path: '/v1/profile/stats',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: { 'application/json': { schema: StatsResponseSchema } },
      description: 'Developer score stats and history',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
  },
  tags: ['Profile'],
});
