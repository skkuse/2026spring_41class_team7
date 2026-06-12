import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getPublicDocumentRoute } from './get-public-document.route.js';

export const getPublicDocumentHandler: RouteHandler<typeof getPublicDocumentRoute, Env> = async (c) => {
  const { id } = c.req.valid('param');

  const doc = await prisma.document.findFirst({
    where: { id, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      status: true,
      content: true,
      createdAt: true,
      project: {
        select: {
          profile: { select: { fullName: true, role: true } },
        },
      },
    },
  });
  if (!doc) return c.json({ message: 'Document not found.' }, 404);

  type StoredSection = {
    assessmentId?: string;
    evaluationId?: string;
    repoOwner: string;
    repoName: string;
    overallScore: number;
    headline: string;
    summary: string;
    role: string;
    duration: string;
    techStack: string[];
    highlights: Array<{ title: string; description: string }>;
    impact: string;
  };
  const rawSections = (doc.content as StoredSection[]) ?? [];

  // Batch-fetch assessment types for all sections
  const sectionAssessmentIds = rawSections
    .map((s) => s.assessmentId ?? s.evaluationId ?? '')
    .filter(Boolean);

  const assessments =
    sectionAssessmentIds.length > 0
      ? await prisma.assessment.findMany({
          where: { id: { in: sectionAssessmentIds } },
          select: { id: true, assessmentType: true },
        })
      : [];

  const typeMap = Object.fromEntries(
    assessments.map((a: { id: string; assessmentType: string }) => [a.id, a.assessmentType]),
  );

  const sections = rawSections.map((s) => {
    const sectionId = s.assessmentId ?? s.evaluationId ?? '';
    const { evaluationId: _drop, ...rest } = s;
    return {
      ...rest,
      assessmentId: sectionId,
      assessmentType: typeMap[sectionId] ?? undefined,
    };
  });

  return c.json(
    {
      id: doc.id,
      name: doc.name,
      status: doc.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
      sections,
      createdAt: doc.createdAt.toISOString(),
      authorName: doc.project.profile.fullName || undefined,
      authorRole: doc.project.profile.role || undefined,
    },
    200,
  );
};
