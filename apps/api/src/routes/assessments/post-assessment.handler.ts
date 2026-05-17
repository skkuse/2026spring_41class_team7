import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postAssessmentRoute } from './post-assessment.route.js';

function parseRepoSlug(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const { pathname } = new URL(repoUrl);
    const parts = pathname.replace(/^\//, '').split('/');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    }
  } catch {
    // fall through
  }
  return null;
}

export const postAssessmentHandler: RouteHandler<typeof postAssessmentRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const slug = parseRepoSlug(body.repoUrl);
  const repoOwner = slug?.owner ?? '';
  const repoName = slug?.repo ?? '';

  const record = await prisma.assessment.create({
    data: {
      userId,
      repoUrl: body.repoUrl,
      repoOwner,
      repoName,
      assessmentType: body.assessmentType,
      overallScore: body.overallScore,
      scores: body.scores,
      scorecard: body.scorecard,
      findings: body.findings,
      gapsAndRisks: body.gapsAndRisks,
      nextSteps: body.nextSteps,
      executiveSummary: body.executiveSummary,
      model: body.model,
      contextChars: body.contextChars,
      generatedAt: new Date(body.generatedAt),
    },
    select: { id: true },
  });

  const url = `https://jobclaw.fyi/${repoOwner}/${repoName}`;
  return c.json({ id: record.id, url }, 201);
};
