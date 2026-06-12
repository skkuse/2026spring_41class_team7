import { z } from '@hono/zod-openapi';

export const portfolioHighlightSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const portfolioSectionSchema = z.object({
  assessmentId: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  overallScore: z.number(),
  headline: z.string(),
  summary: z.string(),
  role: z.string(),
  duration: z.string(),
  techStack: z.array(z.string()),
  highlights: z.array(portfolioHighlightSchema),
  impact: z.string(),
});

export const postPortfolioGenerateResponse200Schema = z
  .object({
    sections: z.array(portfolioSectionSchema),
  })
  .openapi('PortfolioGenerateResponse');

export type PortfolioSection = z.infer<typeof portfolioSectionSchema>;
