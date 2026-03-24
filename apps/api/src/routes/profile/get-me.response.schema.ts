
import { z } from '@hono/zod-openapi';

export const meResponse200Schema = z.object({
  userId: z.string().openapi({ example: '5f5f17f7-42f9-4f43-9345-a123b4c5d6e7' }),
  fullName: z.string().openapi({ example: 'Hyungsuk Kang' }),
  email: z.string().email().openapi({ example: 'hkang@dev.system' }),
  role: z.string().openapi({ example: 'Lead Platform Engineer' }),
  location: z.string().openapi({ example: 'Seoul, KR' }),
  website: z.string().nullable().openapi({ example: 'https://signal.cv/hkang' }),
  isPro: z.boolean().openapi({ example: true }),
});
