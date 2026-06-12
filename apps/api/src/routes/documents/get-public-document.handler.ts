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

  const rawSections = (doc.content as Record<string, unknown>[]) ?? [];

  // Batch-fetch assessment types for all sections that have an assessmentId
  const assessmentIds = rawSections
    .map((s) => s.assessmentId as string)
    .filter(Boolean);

  const assessments =
    assessmentIds.length > 0
      ? await prisma.assessment.findMany({
          where: { id: { in: assessmentIds } },
          select: { id: true, assessmentType: true },
        })
      : [];

  const typeMap = Object.fromEntries(
    assessments.map((a: { id: string; assessmentType: string }) => [a.id, a.assessmentType]),
  );

  const sections = rawSections.map((s) => ({
    ...s,
    assessmentType: typeMap[s.assessmentId as string] ?? undefined,
  }));

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
