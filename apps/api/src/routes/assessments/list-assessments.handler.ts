import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { listAssessmentsRoute } from './list-assessments.route.js';

export const listAssessmentsHandler: RouteHandler<typeof listAssessmentsRoute, Env> = async (c) => {
  const userId = c.get('userId');

  const rows = await prisma.assessment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      repoUrl: true,
      repoOwner: true,
      repoName: true,
      assessmentType: true,  // prisma field — not renamed
      overallScore: true,
      model: true,
      generatedAt: true,
      createdAt: true,
    },
  });

  return c.json(
    {
      items: rows.map((r: { id: string; repoUrl: string; repoOwner: string; repoName: string; assessmentType: string; overallScore: number; model: string; generatedAt: Date; createdAt: Date }) => ({
        id: r.id,
        repoUrl: r.repoUrl,
        repoOwner: r.repoOwner,
        repoName: r.repoName,
        assessmentType: r.assessmentType,
        overallScore: r.overallScore,
        model: r.model,
        generatedAt: r.generatedAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })),
      total: rows.length,
    },
    200,
  );
};
