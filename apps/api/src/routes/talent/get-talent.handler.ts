import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getTalentRoute } from './get-talent.route.js';

export const getTalentHandler: RouteHandler<typeof getTalentRoute, Env> = async (c) => {
  const companyUserId = c.get('userId');
  const { userId: devUserId } = c.req.valid('param');

  const profile = await prisma.profile.findUnique({
    where: { userId: devUserId, userType: 'DEVELOPER' },
    select: {
      userId: true,
      fullName: true,
      role: true,
      location: true,
      website: true,
      allowContact: true,
    },
  });

  if (!profile) {
    return c.json({ message: 'Developer not found.' }, 404);
  }

  const [evaluationRows, shortlistEntry] = await Promise.all([
    prisma.assessment.findMany({
      where: { userId: devUserId },
      orderBy: { overallScore: 'desc' },
      select: {
        id: true,
        repoUrl: true,
        repoOwner: true,
        repoName: true,
        assessmentType: true,
        overallScore: true,
        model: true,
        generatedAt: true,
        createdAt: true,
      },
    }),
    prisma.shortlist.findUnique({
      where: { companyUserId_devUserId: { companyUserId, devUserId } },
      select: { id: true },
    }),
  ]);

  return c.json(
    {
      ...profile,
      isShortlisted: shortlistEntry !== null,
      assessments: evaluationRows.map((a) => ({
        id: a.id,
        repoUrl: a.repoUrl,
        repoOwner: a.repoOwner,
        repoName: a.repoName,
        assessmentType: a.assessmentType,
        overallScore: a.overallScore,
        model: a.model,
        generatedAt: a.generatedAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
      })),
    },
    200,
  );
};
