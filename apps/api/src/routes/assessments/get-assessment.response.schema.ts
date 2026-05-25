import { z } from '@hono/zod-openapi';

import { scorecardRowSchema } from './post-assessment.request.schema.js';

export const getAssessmentResponse200Schema = z.object({
  id: z.string(),
  repoUrl: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  assessmentType: z.string(),
  overallScore: z.number(),
  scores: z.record(z.string(), z.number()),
  scorecard: z.array(scorecardRowSchema),
  findings: z.array(z.string()),
  gapsAndRisks: z.array(z.string()),
  nextSteps: z.array(z.string()),
  executiveSummary: z.string(),
  model: z.string(),
  contextChars: z.number(),
  generatedAt: z.string(),
  createdAt: z.string(),
});
