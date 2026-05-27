import { OpenAPIHono } from '@hono/zod-openapi';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => {
  const prisma = {
    profile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    shortlist: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    assessment: {
      findMany: vi.fn(),
    },
    project: {
      create: vi.fn()
        .mockResolvedValueOnce({ id: 'proj-career' })
        .mockResolvedValueOnce({ id: 'proj-portfolio' })
        .mockResolvedValueOnce({ id: 'proj-payments' }),
    },
    document: {
      createMany: vi.fn().mockResolvedValue({ count: 3 }),
    },
    invoice: {
      createMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  };
  return { prisma };
});

vi.mock('../src/lib/resend.js', () => ({
  getResendClient: vi.fn(),
}));

const { prisma } = await import('../src/lib/prisma.js');
const { getResendClient } = await import('../src/lib/resend.js');
const { patchMeHandler } = await import('../src/routes/profile/patch-me.handler.js');
const { patchMeRoute } = await import('../src/routes/profile/patch-me.route.js');
const { listTalentHandler } = await import('../src/routes/talent/list-talent.handler.js');
const { listTalentRoute } = await import('../src/routes/talent/list-talent.route.js');
const { contactTalentHandler } = await import('../src/routes/talent/contact-talent.handler.js');
const { contactTalentRoute } = await import('../src/routes/talent/contact-talent.route.js');
const { postShortlistHandler } = await import('../src/routes/shortlist/post-shortlist.handler.js');
const { postShortlistRoute } = await import('../src/routes/shortlist/post-shortlist.route.js');

function makeApp<R extends Parameters<OpenAPIHono['openapi']>[0], H>(route: R, handler: H) {
  const app = new OpenAPIHono<{ Variables: { userId: string } }>();
  app.use('*', async (c, next) => {
    c.set('userId', 'test-user-id');
    await next();
  });
  // @ts-expect-error — test helper loosens types
  app.openapi(route, handler);
  return app;
}

// ---- PATCH /v1/me ----
describe('PATCH /v1/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('seeds demo data when DEVELOPER is set for the first time', async () => {
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: 'profile-1',
      userType: null,
    } as never);
    vi.mocked(prisma.profile.update).mockResolvedValue({
      userType: 'DEVELOPER',
      companyName: null,
      industry: null,
      allowContact: false,
    } as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => fn(prisma as never));

    const app = makeApp(patchMeRoute, patchMeHandler);
    const res = await app.request('/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType: 'DEVELOPER' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.demoDataSeeded).toBe(true);
  });

  it('does not seed demo data when DEVELOPER is set again', async () => {
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: 'profile-1',
      userType: 'DEVELOPER',
    } as never);
    vi.mocked(prisma.profile.update).mockResolvedValue({
      userType: 'DEVELOPER',
      companyName: null,
      industry: null,
      allowContact: false,
    } as never);

    const app = makeApp(patchMeRoute, patchMeHandler);
    const res = await app.request('/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType: 'DEVELOPER' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.demoDataSeeded).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

// ---- GET /v1/talent ----
describe('GET /v1/talent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns developers sorted by bestScore desc', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { userId: 'dev-1', fullName: 'Alice', role: 'SWE', location: 'Seoul', website: null, allowContact: true, bestScore: 95, assessmentCount: BigInt(2) },
      { userId: 'dev-2', fullName: 'Bob', role: 'SRE', location: 'Tokyo', website: null, allowContact: false, bestScore: 72, assessmentCount: BigInt(1) },
    ]);
    vi.mocked(prisma.shortlist.findMany).mockResolvedValue([]);

    const app = makeApp(listTalentRoute, listTalentHandler);
    const res = await app.request('/v1/talent');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(2);
    expect(json.items[0].bestScore).toBe(95);
    expect(json.items[1].bestScore).toBe(72);
    expect(json.items[0].assessmentCount).toBe(2);
  });

  it('marks isShortlisted correctly', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { userId: 'dev-1', fullName: 'Alice', role: 'SWE', location: 'Seoul', website: null, allowContact: true, bestScore: 90, assessmentCount: BigInt(1) },
    ]);
    vi.mocked(prisma.shortlist.findMany).mockResolvedValue([
      { devUserId: 'dev-1', companyUserId: 'test-user-id', id: 'sl-1', createdAt: new Date() },
    ]);

    const app = makeApp(listTalentRoute, listTalentHandler);
    const res = await app.request('/v1/talent');
    const json = await res.json();

    expect(json.items[0].isShortlisted).toBe(true);
  });
});

// ---- POST /v1/talent/:userId/contact ----
describe('POST /v1/talent/:userId/contact', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when developer has allowContact=false', async () => {
    vi.mocked(prisma.profile.findUnique)
      .mockResolvedValueOnce({ userType: 'COMPANY', companyName: 'Acme' } as never)
      .mockResolvedValueOnce({ email: 'dev@test.com', allowContact: false, userType: 'DEVELOPER' } as never);

    const app = makeApp(contactTalentRoute, contactTalentHandler);
    const res = await app.request('/v1/talent/dev-1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'We want to hire you for a great opportunity.' }),
    });

    expect(res.status).toBe(403);
  });

  it('returns 503 when RESEND_API_KEY is missing', async () => {
    vi.mocked(prisma.profile.findUnique)
      .mockResolvedValueOnce({ userType: 'COMPANY', companyName: 'Acme' } as never)
      .mockResolvedValueOnce({ email: 'dev@test.com', allowContact: true, userType: 'DEVELOPER' } as never);
    vi.mocked(getResendClient).mockReturnValue(null);

    const app = makeApp(contactTalentRoute, contactTalentHandler);
    const res = await app.request('/v1/talent/dev-1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'We want to hire you for a great opportunity.' }),
    });

    expect(res.status).toBe(503);
  });

  it('sends email when all conditions are met', async () => {
    vi.mocked(prisma.profile.findUnique)
      .mockResolvedValueOnce({ userType: 'COMPANY', companyName: 'Acme' } as never)
      .mockResolvedValueOnce({ email: 'dev@test.com', allowContact: true, userType: 'DEVELOPER' } as never);
    const mockSend = vi.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null });
    vi.mocked(getResendClient).mockReturnValue({ emails: { send: mockSend } } as never);

    const app = makeApp(contactTalentRoute, contactTalentHandler);
    const res = await app.request('/v1/talent/dev-1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'We want to hire you for a great opportunity.' }),
    });

    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'dev@test.com' }),
    );
  });
});

// ---- POST /v1/shortlist ----
describe('POST /v1/shortlist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upserts without error on duplicate', async () => {
    vi.mocked(prisma.shortlist.upsert).mockResolvedValue({
      id: 'sl-1', companyUserId: 'test-user-id', devUserId: 'dev-1', createdAt: new Date(),
    });

    const app = makeApp(postShortlistRoute, postShortlistHandler);
    const res = await app.request('/v1/shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ devUserId: 'dev-1' }),
    });

    expect(res.status).toBe(200);
    expect(prisma.shortlist.upsert).toHaveBeenCalledTimes(1);
  });
});
