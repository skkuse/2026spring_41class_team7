import { z } from '@hono/zod-openapi';

const HighlightSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const SectionSchema = z.object({
  assessmentId: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  overallScore: z.number(),
  headline: z.string(),
  summary: z.string(),
  role: z.string(),
  duration: z.string(),
  techStack: z.array(z.string()),
  highlights: z.array(HighlightSchema),
  impact: z.string(),
  assessmentType: z.string().optional(),
});

export const getDocumentResponse200Schema = z
  .object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']),
    sections: z.array(SectionSchema),
    createdAt: z.string(),
    authorName: z.string().optional(),
    authorRole: z.string().optional(),
  })
  .openapi('GetDocumentResponse');
