import { z } from '@hono/zod-openapi';

export const scorecardRowSchema = z.object({
  criterion: z.string(),
  score: z.number().int().min(0).max(10),
  status: z.enum(['Strong', 'Partial', 'Missing']),
  confidence: z.enum(['High', 'Medium', 'Low']),
  rationale: z.string(),
});

export const postAssessmentBodySchema = z.object({
  repoUrl: z.string().url().openapi({ example: 'https://github.com/user/repo' }),
  assessmentType: z.string().openapi({ example: 'node-backend' }),
  overallScore: z.number().int().min(0).max(100),
  scores: z.record(z.string(), z.number()),
  scorecard: z.array(scorecardRowSchema),
  findings: z.array(z.string()),
  gapsAndRisks: z.array(z.string()),
  nextSteps: z.array(z.string()),
  executiveSummary: z.string(),
  model: z.string().openapi({ example: 'gpt-4o-mini' }),
  contextChars: z.number().int().min(0),
  generatedAt: z.string().datetime(),
});
