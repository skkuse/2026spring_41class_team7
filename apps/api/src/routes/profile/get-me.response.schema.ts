
import { z } from '@hono/zod-openapi';

export const meResponse200Schema = z.object({
  userId: z.string().openapi({ example: '5f5f17f7-42f9-4f43-9345-a123b4c5d6e7' }),
  fullName: z.string().openapi({ example: 'Hyungsuk Kang' }),
  email: z.string().email().openapi({ example: 'hkang@dev.system' }),
  role: z.string().openapi({ example: 'Lead Platform Engineer' }),
  location: z.string().openapi({ example: 'Seoul, KR' }),
  website: z.string().nullable().openapi({ example: 'https://jobclaw.app/hkang' }),
  isPro: z.boolean().openapi({ example: true }),
  userType: z.enum(['DEVELOPER', 'COMPANY']).nullable().openapi({ example: 'DEVELOPER' }),
  companyName: z.string().nullable().openapi({ example: 'Acme Corp' }),
  industry: z.string().nullable().openapi({ example: 'FinTech' }),
  allowContact: z.boolean().openapi({ example: false }),
});

export type ExampleResponse = {
  message: string;
};

export type HealthOkResponse = {
  status: 'ok';
  service: 'api';
};

export type HealthErrorResponse = {
  status: 'error';
  message: string;
};
