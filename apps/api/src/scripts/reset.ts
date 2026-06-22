import { prisma } from '../lib/prisma.js';

await prisma.$transaction([
  prisma.shortlist.deleteMany(),
  prisma.assessment.deleteMany(),
  prisma.invoice.deleteMany(),
  prisma.document.deleteMany(),
  prisma.project.deleteMany(),
  prisma.profile.deleteMany(),
]);
console.log('Database reset complete (auth untouched).');
await prisma.$disconnect();
