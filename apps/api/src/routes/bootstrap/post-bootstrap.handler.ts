
import { Prisma } from '@prisma/client';
import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postBootstrapRoute } from './post-bootstrap.route.js';

export const postBootstrapHandler: RouteHandler<typeof postBootstrapRoute, Env> = async (c) => {
  const userId = c.get('userId');

  const result = await prisma.$transaction(async (tx) => {
    const existingProfile = await tx.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const profile =
      existingProfile ??
      (await tx.profile.create({
        data: {
          userId,
          fullName: 'Hyungsuk Kang',
          email: 'hkang@dev.system',
          role: 'Lead Platform Engineer',
          location: 'Seoul, KR',
          website: 'https://jobscript.app/hkang',
          isPro: true,
        },
        select: { id: true },
      }));

    const existingDocumentCount = await tx.document.count({
      where: { project: { profileId: profile.id } },
    });
    const existingInvoiceCount = await tx.invoice.count({ where: { profileId: profile.id } });

    let documentsCreated = 0;
    if (existingDocumentCount === 0) {
      const career = await tx.project.create({
        data: { profileId: profile.id, name: 'Career & positioning' },
        select: { id: true },
      });
      const portfolio = await tx.project.create({
        data: { profileId: profile.id, name: 'Portfolio platform' },
        select: { id: true },
      });
      const payments = await tx.project.create({
        data: { profileId: profile.id, name: 'Payments integration' },
        select: { id: true },
      });

      const docs = await tx.document.createMany({
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
      documentsCreated = docs.count;
    }

    let invoicesCreated = 0;
    if (existingInvoiceCount === 0) {
      const invoices = await tx.invoice.createMany({
        data: [
          {
            profileId: profile.id,
            externalId: `INV-${userId.slice(0, 8)}-010`,
            amountUsd: new Prisma.Decimal('12.00'),
            issuedAt: new Date('2023-10-24T00:00:00.000Z'),
          },
          {
            profileId: profile.id,
            externalId: `INV-${userId.slice(0, 8)}-009`,
            amountUsd: new Prisma.Decimal('12.00'),
            issuedAt: new Date('2023-09-24T00:00:00.000Z'),
          },
        ],
      });
      invoicesCreated = invoices.count;
    }

    return {
      profileCreated: !existingProfile,
      documentsCreated,
      invoicesCreated,
    };
  });

  return c.json(result, 200);
};
