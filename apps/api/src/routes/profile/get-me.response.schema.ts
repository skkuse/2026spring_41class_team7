import { z } from '@hono/zod-openapi';

const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const meResponse200Schema = z.object({
  userId: z.string().openapi({ example: '5f5f17f7-42f9-4f43-9345-a123b4c5d6e7' }),
  fullName: z.string().openapi({ example: 'Hyungsuk Kang' }),
  email: z.string().email().openapi({ example: 'hkang@dev.system' }),
  role: z.string().openapi({ example: 'Lead Platform Engineer' }),
  location: z.string().openapi({ example: 'Seoul, KR' }),
  website: z.string().nullable().openapi({ example: 'https://jobclaw.app/hkang' }),
  isPro: z.boolean().openapi({ example: true }),
  userType: z.enum(['DEVELOPER', 'COMPANY']).nullable().openapi({ example: 'DEVELOPER' }),
  activeCompanyId: z.string().nullable().openapi({ example: null }),
  activeCompany: companySchema.nullable().openapi({ example: null }),
  companies: z.array(companySchema).openapi({ example: [] }),
  allowContact: z.boolean().openapi({ example: false }),
  avatarUrl: z.string().nullable().optional().openapi({ example: 'https://avatars.githubusercontent.com/u/1234' }),
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
