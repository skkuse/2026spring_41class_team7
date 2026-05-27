import { z } from '@hono/zod-openapi';

const assessmentSummarySchema = z.object({
  id: z.string(),
  repoUrl: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  assessmentType: z.string(),
  overallScore: z.number().int(),
  model: z.string(),
  generatedAt: z.string(),
  createdAt: z.string(),
});

export const getTalentResponse200Schema = z.object({
  userId: z.string(),
  fullName: z.string(),
  role: z.string(),
  location: z.string(),
  website: z.string().nullable(),
  allowContact: z.boolean(),
  isShortlisted: z.boolean(),
  assessments: z.array(assessmentSummarySchema),
});
