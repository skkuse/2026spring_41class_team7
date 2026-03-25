import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { ResumeParseRequestSchema, ResumeParseResponseSchema } from '../ai-extract.schema.js';

export const postResumeParseRoute = createRoute({
  method: 'post',
  path: '/v1/resume/parse',
  summary: 'Parse resume PDF/DOCX into structured profile JSON (OpenAI)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ResumeParseRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Structured resume profile',
      content: { 'application/json': { schema: ResumeParseResponseSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    413: {
      description: 'Payload too large',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    415: {
      description: 'Unsupported type or extraction failed',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    422: {
      description: 'Unprocessable document',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    502: {
      description: 'Upstream or model error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    503: {
      description: 'OpenAI not configured',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
  tags: ['AI'],
});
