import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { listTalentRoute } from './list-talent.route.js';

type TalentRow = {
  userId: string;
  fullName: string;
  role: string;
  location: string;
  website: string | null;
  allowContact: boolean;
  bestScore: number | null;
  assessmentCount: bigint;
};

export const listTalentHandler: RouteHandler<typeof listTalentRoute, Env> = async (c) => {
  const companyUserId = c.get('userId');

  const [rows, shortlisted] = await Promise.all([
    prisma.$queryRaw<TalentRow[]>`
      SELECT
        p."userId",
        p."fullName",
        p.role,
        p.location,
        p.website,
        p."allowContact",
        MAX(a."overallScore")::int AS "bestScore",
        COUNT(a.id) AS "assessmentCount"
      FROM "Profile" p
      LEFT JOIN "Assessment" a ON a."userId" = p."userId"
      WHERE p."userType" = 'DEVELOPER'::"UserType"
        AND p."allowContact" = true
      GROUP BY p."userId", p."fullName", p.role, p.location, p.website, p."allowContact"
      ORDER BY "bestScore" DESC NULLS LAST
    `,
    prisma.shortlist.findMany({
      where: { companyUserId },
      select: { devUserId: true },
    }),
  ]);
  const shortlistedSet = new Set(shortlisted.map((s) => s.devUserId));

  const items = rows.map((r) => ({
    userId: r.userId,
    fullName: r.fullName,
    role: r.role,
    location: r.location,
    website: r.website,
    allowContact: r.allowContact,
    bestScore: r.bestScore,
    assessmentCount: Number(r.assessmentCount),
    isShortlisted: shortlistedSet.has(r.userId),
  }));

  return c.json({ items, total: items.length }, 200);
};
