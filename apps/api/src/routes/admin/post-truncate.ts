import type { Context } from 'hono';
import { prisma } from '../../lib/prisma.js';

const TRUNCATE_SECRET = 'jc-truncate-7f3k9p2026';

export async function postTruncateHandler(c: Context) {
  if (c.req.header('x-admin-secret') !== TRUNCATE_SECRET) {
    return c.json({ message: 'Forbidden' }, 403);
  }
  await prisma.$executeRawUnsafe(
    `TRUNCATE "Document", "Invoice", "Project", "Assessment", "Shortlist", "Profile" RESTART IDENTITY CASCADE;`,
  );
  const counts = {
    profiles: await prisma.profile.count(),
    projects: await prisma.project.count(),
    documents: await prisma.document.count(),
    assessments: await prisma.assessment.count(),
    invoices: await prisma.invoice.count(),
    shortlists: await prisma.shortlist.count(),
  };
  return c.json({ truncated: true, counts });
}
