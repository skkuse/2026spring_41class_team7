import { z } from '@hono/zod-openapi';

export const assessmentSummarySchema = z.object({
  id: z.string(),
  repoUrl: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  assessmentType: z.string(),
  overallScore: z.number(),
  model: z.string(),
  generatedAt: z.string(),
  createdAt: z.string(),
});

export const listAssessmentsResponse200Schema = z.object({
  items: z.array(assessmentSummarySchema),
  total: z.number().int(),
});
