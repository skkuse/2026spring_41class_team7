import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { listShortlistRoute } from './list-shortlist.route.js';

export const listShortlistHandler: RouteHandler<typeof listShortlistRoute, Env> = async (c) => {
  const companyUserId = c.get('userId');

  const entries = await prisma.shortlist.findMany({
    where: { companyUserId },
    orderBy: { createdAt: 'desc' },
  });

  if (entries.length === 0) {
    return c.json({ items: [], total: 0 }, 200);
  }

  const devUserIds = entries.map((e) => e.devUserId);

  const [profiles, scores] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: { in: devUserIds } },
      select: { userId: true, fullName: true, role: true, location: true, website: true },
    }),
    prisma.$queryRaw<Array<{ userId: string; bestScore: number }>>`
      SELECT "userId", MAX("overallScore")::int AS "bestScore"
      FROM "Assessment"
      WHERE "userId" = ANY(${devUserIds})
      GROUP BY "userId"
    `,
  ]);

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));
  const scoreMap = new Map(scores.map((s) => [s.userId, s.bestScore]));
  const entryMap = new Map(entries.map((e) => [e.devUserId, e]));

  const items = devUserIds.map((id) => {
    const p = profileMap.get(id);
    const entry = entryMap.get(id)!;
    return {
      devUserId: id,
      fullName: p?.fullName ?? '',
      role: p?.role ?? '',
      location: p?.location ?? '',
      website: p?.website ?? null,
      bestScore: scoreMap.get(id) ?? null,
      shortlistedAt: entry.createdAt.toISOString(),
    };
  });

  return c.json({ items, total: items.length }, 200);
};
