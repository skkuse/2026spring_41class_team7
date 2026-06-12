import type { MiddlewareHandler } from 'hono';

import type { Env } from '../types.js';
import { prisma } from '../lib/prisma.js';

export const requireCompany: MiddlewareHandler<Env> = async (c, next) => {
  const userId = c.get('userId');
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { userType: true },
  });
  if (profile?.userType !== 'COMPANY') {
    return c.json({ message: 'Forbidden. Company account required.' }, 403);
  }
  await next();
};
