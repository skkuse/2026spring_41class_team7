import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getResendClient } from '../../lib/resend.js';
import { contactTalentRoute } from './contact-talent.route.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const contactTalentHandler: RouteHandler<typeof contactTalentRoute, Env> = async (c) => {
  const companyUserId = c.get('userId');
  const { userId: devUserId } = c.req.valid('param');
  const { message } = c.req.valid('json');

  const [companyProfile, devProfile] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: companyUserId },
      select: { userType: true, companyName: true },
    }),
    prisma.profile.findUnique({
      where: { userId: devUserId },
      select: { email: true, allowContact: true, userType: true },
    }),
  ]);

  if (companyProfile?.userType !== 'COMPANY') {
    return c.json({ message: 'Forbidden. Company account required.' }, 403);
  }

  if (!devProfile || devProfile.userType !== 'DEVELOPER') {
    return c.json({ message: 'Developer not found.' }, 403);
  }

  if (!devProfile.allowContact) {
    return c.json({ message: 'Developer has not enabled contact.' }, 403);
  }

  const resend = getResendClient();
  if (!resend) {
    return c.json({ message: 'Email service unavailable.' }, 503);
  }

  const companyName = companyProfile.companyName ?? 'A company';
  const safeCompanyName = escapeHtml(companyName);
  const safeMessage = escapeHtml(message);

  const { error: sendError } = await resend.emails.send({
    from: 'Jobclaw <noreply@jobclaw.fyi>',
    to: devProfile.email,
    subject: `[Jobclaw] ${safeCompanyName} is interested in your work`,
    html: `
      <p>Hi,</p>
      <p><strong>${safeCompanyName}</strong> found your Jobclaw profile and wants to connect.</p>
      <blockquote style="border-left:3px solid #ccc;padding-left:1em;color:#555">${safeMessage}</blockquote>
      <p>You can manage contact preferences in your <a href="https://jobclaw.fyi/settings">Jobclaw settings</a>.</p>
    `,
  });
  if (sendError) {
    return c.json({ message: 'Email service unavailable.' }, 503);
  }

  return c.json({ sent: true }, 200);
};
