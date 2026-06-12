import { z } from '@hono/zod-openapi';

const PortfolioHighlightSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const PortfolioSectionSchema = z.object({
  assessmentId: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  overallScore: z.number(),
  headline: z.string(),
  summary: z.string(),
  role: z.string(),
  duration: z.string(),
  techStack: z.array(z.string()),
  highlights: z.array(PortfolioHighlightSchema),
  impact: z.string(),
});

export const postPortfolioSaveRequestSchema = z
  .object({
    sections: z.array(PortfolioSectionSchema).min(1),
    title: z.string().optional(),
  })
  .openapi('PortfolioSaveRequest');
