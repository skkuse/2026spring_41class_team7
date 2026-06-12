import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getPublicAssessmentRoute } from './get-public-assessment.route.js';

export const getPublicAssessmentHandler: RouteHandler<typeof getPublicAssessmentRoute, Env> = async (c) => {
  const { owner, repo } = c.req.valid('param');

  const row = await prisma.assessment.findFirst({
    where: { repoOwner: owner, repoName: repo },
    orderBy: { createdAt: 'desc' },
  });

  if (!row) {
    return c.json({ message: 'Assessment not found' }, 404);
  }

  return c.json(
    {
      id: row.id,
      repoUrl: row.repoUrl,
      repoOwner: row.repoOwner,
      repoName: row.repoName,
      assessmentType: row.assessmentType,
      overallScore: row.overallScore,
      scores: row.scores as Record<string, number>,
      scorecard: row.scorecard as Array<{
        criterion: string;
        score: number;
        status: 'Strong' | 'Partial' | 'Missing';
        confidence: 'High' | 'Medium' | 'Low';
        rationale: string;
      }>,
      findings: row.findings,
      gapsAndRisks: row.gapsAndRisks,
      nextSteps: row.nextSteps,
      executiveSummary: row.executiveSummary,
      model: row.model,
      contextChars: row.contextChars,
      generatedAt: row.generatedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    },
    200,
  );
};
