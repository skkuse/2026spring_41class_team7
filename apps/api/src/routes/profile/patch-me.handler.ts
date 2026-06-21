import { Prisma } from '@prisma/client';
import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { patchMeRoute } from './patch-me.route.js';

export const patchMeHandler: RouteHandler<typeof patchMeRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const existing = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true, userType: true },
  });

  if (!existing) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  const isFirstDevSet =
    body.userType === 'DEVELOPER' && existing.userType === null;

  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      ...(body.fullName !== undefined && { fullName: body.fullName }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.website !== undefined && { website: body.website }),
      ...(body.userType !== undefined && { userType: body.userType }),
      ...(body.activeCompanyId !== undefined && { activeCompanyId: body.activeCompanyId }),
      ...(body.userType === 'DEVELOPER' && { activeCompanyId: null }),
      ...(body.allowContact !== undefined && { allowContact: body.allowContact }),
    },
    select: {
      fullName: true,
      role: true,
      location: true,
      website: true,
      userType: true,
      activeCompanyId: true,
      allowContact: true,
    },
  });

  let demoDataSeeded = false;
  if (isFirstDevSet) {
    await prisma.$transaction(async (tx) => {
      const career = await tx.project.create({
        data: { profileId: existing.id, name: 'Career & positioning' },
        select: { id: true },
      });
      const portfolio = await tx.project.create({
        data: { profileId: existing.id, name: 'Portfolio platform' },
        select: { id: true },
      });
      const payments = await tx.project.create({
        data: { profileId: existing.id, name: 'Payments integration' },
        select: { id: true },
      });

      await tx.document.createMany({
        data: [
          {
            projectId: career.id,
            name: 'H_KANG_RESUME_V2',
            status: 'ACTIVE',
            sizeLabel: '2.4MB',
            tags: ['Systems', 'Rust'],
          },
          {
            projectId: portfolio.id,
            name: 'BACKEND_LEAD_SITE',
            status: 'DRAFT',
            sizeLabel: 'Draft',
            tags: ['Portfolio', 'Next.js'],
          },
          {
            projectId: payments.id,
            name: 'STRIPE_OFFER_DOC',
            status: 'ACTIVE',
            sizeLabel: '1.1MB',
            tags: ['Fintech', 'Go'],
          },
        ],
      });

      await tx.invoice.createMany({
        data: [
          {
            profileId: existing.id,
            externalId: `INV-${existing.id}-010`,
            amountUsd: new Prisma.Decimal('12.00'),
            issuedAt: new Date('2023-10-24T00:00:00.000Z'),
          },
          {
            profileId: existing.id,
            externalId: `INV-${existing.id}-009`,
            amountUsd: new Prisma.Decimal('12.00'),
            issuedAt: new Date('2023-09-24T00:00:00.000Z'),
          },
        ],
      });
    });
    demoDataSeeded = true;
  }

  return c.json({ ...updated, demoDataSeeded }, 200);
};
