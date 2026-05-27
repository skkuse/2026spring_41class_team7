# Company User Type Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Company user type to Jobclaw so companies can log in, browse developers sorted by best assessment score, shortlist them, and contact opted-in developers via Resend email.

**Architecture:** Extend the existing `Profile` model with `userType` (nullable enum), `companyName`, `industry`, and `allowContact`. Add a `Shortlist` join table. New API routes under `/v1/talent` and `/v1/shortlist`. Post-login role-selection page routes new users to either the existing developer dashboard or a new company talent directory.

**Tech Stack:** Hono + zod-openapi (API), Prisma + PostgreSQL (DB), Next.js App Router (web), Supabase Auth, Resend (email), Vitest (tests), pnpm monorepo.

---

## File Map

**Create (API):**
- `apps/api/src/routes/profile/patch-me.request.schema.ts`
- `apps/api/src/routes/profile/patch-me.response.schema.ts`
- `apps/api/src/routes/profile/patch-me.route.ts`
- `apps/api/src/routes/profile/patch-me.handler.ts`
- `apps/api/src/middlewares/require-company.ts`
- `apps/api/src/lib/resend.ts`
- `apps/api/src/routes/talent/list-talent.response.schema.ts`
- `apps/api/src/routes/talent/list-talent.route.ts`
- `apps/api/src/routes/talent/list-talent.handler.ts`
- `apps/api/src/routes/talent/get-talent.response.schema.ts`
- `apps/api/src/routes/talent/get-talent.route.ts`
- `apps/api/src/routes/talent/get-talent.handler.ts`
- `apps/api/src/routes/talent/contact-talent.request.schema.ts`
- `apps/api/src/routes/talent/contact-talent.response.schema.ts`
- `apps/api/src/routes/talent/contact-talent.route.ts`
- `apps/api/src/routes/talent/contact-talent.handler.ts`
- `apps/api/src/routes/shortlist/list-shortlist.response.schema.ts`
- `apps/api/src/routes/shortlist/list-shortlist.route.ts`
- `apps/api/src/routes/shortlist/list-shortlist.handler.ts`
- `apps/api/src/routes/shortlist/post-shortlist.request.schema.ts`
- `apps/api/src/routes/shortlist/post-shortlist.route.ts`
- `apps/api/src/routes/shortlist/post-shortlist.handler.ts`
- `apps/api/src/routes/shortlist/delete-shortlist.route.ts`
- `apps/api/src/routes/shortlist/delete-shortlist.handler.ts`
- `apps/api/test/company-feature.test.ts`

**Modify (API):**
- `apps/api/prisma/schema.prisma`
- `apps/api/src/routes/profile/get-me.response.schema.ts`
- `apps/api/src/routes/profile/get-me.handler.ts`
- `apps/api/src/routes/bootstrap/post-bootstrap.handler.ts`
- `apps/api/src/routes/index.ts`
- `apps/api/package.json`

**Create (Web):**
- `apps/web/lib/profile-context.tsx`
- `apps/web/app/onboarding/role/page.tsx`
- `apps/web/app/home/layout.tsx`
- `apps/web/app/company/layout.tsx`
- `apps/web/app/company/talent/page.tsx`
- `apps/web/app/company/talent/[userId]/page.tsx`

**Modify (Web):**
- `apps/web/lib/api-context.tsx`
- `apps/web/app/providers.tsx`
- `apps/web/components/settings/settings-desktop.tsx`

---

## Task 1: Prisma Schema — UserType, extend Profile, add Shortlist

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Add enum and new fields to schema**

  Open `apps/api/prisma/schema.prisma`. Add the `UserType` enum and extend `Profile`. Add the `Shortlist` model. The full updated schema:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  enum UserType {
    DEVELOPER
    COMPANY
  }

  model Profile {
    id           String    @id @default(cuid())
    userId       String    @unique
    fullName     String
    email        String
    role         String
    location     String
    website      String?
    isPro        Boolean   @default(false)
    userType     UserType?
    companyName  String?
    industry     String?
    allowContact Boolean   @default(false)
    createdAt    DateTime  @default(now())
    updatedAt    DateTime  @updatedAt
    projects     Project[]
    invoices     Invoice[]
  }

  model Project {
    id        String     @id @default(cuid())
    profileId String
    profile   Profile    @relation(fields: [profileId], references: [id], onDelete: Cascade)
    name      String
    createdAt DateTime   @default(now())
    updatedAt DateTime   @updatedAt
    documents Document[]

    @@index([profileId, createdAt])
  }

  model Document {
    id        String         @id @default(cuid())
    projectId String
    project   Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
    name      String
    status    DocumentStatus
    sizeLabel String?
    tags      String[]
    createdAt DateTime       @default(now())
    updatedAt DateTime       @updatedAt

    @@index([projectId, createdAt])
  }

  model Invoice {
    id         String   @id @default(cuid())
    profileId  String
    profile    Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
    externalId String   @unique
    amountUsd  Decimal  @db.Decimal(10, 2)
    issuedAt   DateTime
    createdAt  DateTime @default(now())

    @@index([profileId, issuedAt])
  }

  enum DocumentStatus {
    ACTIVE
    DRAFT
    ARCHIVED
  }

  model Assessment {
    id               String   @id @default(cuid())
    userId           String
    repoUrl          String
    repoOwner        String
    repoName         String
    assessmentType   String
    overallScore     Int
    scores           Json
    scorecard        Json
    findings         String[]
    gapsAndRisks     String[]
    nextSteps        String[]
    executiveSummary String
    model            String
    contextChars     Int
    generatedAt      DateTime
    createdAt        DateTime @default(now())

    @@index([userId, createdAt])
  }

  model Shortlist {
    id            String   @id @default(cuid())
    companyUserId String
    devUserId     String
    createdAt     DateTime @default(now())

    @@unique([companyUserId, devUserId])
    @@index([companyUserId])
  }
  ```

- [ ] **Step 2: Run migration**

  ```bash
  cd apps/api && npx prisma migrate dev --name add_company_user_type
  ```

  Expected: migration created and applied, Prisma client regenerated. If `DATABASE_URL` is not set locally, run `npx prisma generate` only to regenerate the client without applying the migration (apply it to the remote DB via CI or manually).

- [ ] **Step 3: Commit**

  ```bash
  git add apps/api/prisma/
  git commit -m "feat(db): add UserType enum, extend Profile, add Shortlist model"
  ```

---

## Task 2: Update GET /v1/me to return new profile fields

**Files:**
- Modify: `apps/api/src/routes/profile/get-me.response.schema.ts`
- Modify: `apps/api/src/routes/profile/get-me.handler.ts`

- [ ] **Step 1: Update response schema**

  Replace the contents of `apps/api/src/routes/profile/get-me.response.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const meResponse200Schema = z.object({
    userId: z.string().openapi({ example: '5f5f17f7-42f9-4f43-9345-a123b4c5d6e7' }),
    fullName: z.string().openapi({ example: 'Hyungsuk Kang' }),
    email: z.string().email().openapi({ example: 'hkang@dev.system' }),
    role: z.string().openapi({ example: 'Lead Platform Engineer' }),
    location: z.string().openapi({ example: 'Seoul, KR' }),
    website: z.string().nullable().openapi({ example: 'https://jobclaw.app/hkang' }),
    isPro: z.boolean().openapi({ example: true }),
    userType: z.enum(['DEVELOPER', 'COMPANY']).nullable().openapi({ example: 'DEVELOPER' }),
    companyName: z.string().nullable().openapi({ example: 'Acme Corp' }),
    industry: z.string().nullable().openapi({ example: 'FinTech' }),
    allowContact: z.boolean().openapi({ example: false }),
  });

  export type ExampleResponse = {
    message: string;
  };

  export type HealthOkResponse = {
    status: 'ok';
    service: 'api';
  };

  export type HealthErrorResponse = {
    status: 'error';
    message: string;
  };
  ```

- [ ] **Step 2: Update handler to select new fields**

  Replace `apps/api/src/routes/profile/get-me.handler.ts`:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { getMeRoute } from './get-me.route.js';

  export const getMeHandler: RouteHandler<typeof getMeRoute, Env> = async (c) => {
    const userId = c.get('userId');

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        location: true,
        website: true,
        isPro: true,
        userType: true,
        companyName: true,
        industry: true,
        allowContact: true,
      },
    });

    if (!profile) {
      return c.json({ message: 'Profile not found.' }, 404);
    }

    return c.json(profile, 200);
  };
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add apps/api/src/routes/profile/get-me.response.schema.ts \
          apps/api/src/routes/profile/get-me.handler.ts
  git commit -m "feat(api): expose userType, companyName, allowContact in GET /v1/me"
  ```

---

## Task 3: PATCH /v1/profile/me — role selection + settings

**Files:**
- Create: `apps/api/src/routes/profile/patch-me.request.schema.ts`
- Create: `apps/api/src/routes/profile/patch-me.response.schema.ts`
- Create: `apps/api/src/routes/profile/patch-me.route.ts`
- Create: `apps/api/src/routes/profile/patch-me.handler.ts`

- [ ] **Step 1: Create request schema**

  Create `apps/api/src/routes/profile/patch-me.request.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const patchMeBodySchema = z.object({
    userType: z.enum(['DEVELOPER', 'COMPANY']).optional(),
    companyName: z.string().min(1).max(200).optional(),
    industry: z.string().max(100).optional(),
    allowContact: z.boolean().optional(),
  });
  ```

- [ ] **Step 2: Create response schema**

  Create `apps/api/src/routes/profile/patch-me.response.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const patchMeResponse200Schema = z.object({
    userType: z.enum(['DEVELOPER', 'COMPANY']).nullable(),
    companyName: z.string().nullable(),
    industry: z.string().nullable(),
    allowContact: z.boolean(),
    demoDataSeeded: z.boolean(),
  });
  ```

- [ ] **Step 3: Create route definition**

  Create `apps/api/src/routes/profile/patch-me.route.ts`:

  ```ts
  import { createRoute } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';
  import { patchMeBodySchema } from './patch-me.request.schema.js';
  import { patchMeResponse200Schema } from './patch-me.response.schema.js';

  export const patchMeRoute = createRoute({
    method: 'patch',
    path: '/v1/me',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: patchMeBodySchema } },
        required: true,
      },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: patchMeResponse200Schema } },
        description: 'Profile updated',
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
      404: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Profile not found',
      },
    },
    tags: ['Profile'],
  });
  ```

- [ ] **Step 4: Create handler (includes demo-data seeding on first DEVELOPER set)**

  Create `apps/api/src/routes/profile/patch-me.handler.ts`:

  ```ts
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
        ...(body.userType !== undefined && { userType: body.userType }),
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.allowContact !== undefined && { allowContact: body.allowContact }),
      },
      select: {
        userType: true,
        companyName: true,
        industry: true,
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
              externalId: `INV-${userId.slice(0, 8)}-010`,
              amountUsd: new Prisma.Decimal('12.00'),
              issuedAt: new Date('2023-10-24T00:00:00.000Z'),
            },
            {
              profileId: existing.id,
              externalId: `INV-${userId.slice(0, 8)}-009`,
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
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add apps/api/src/routes/profile/patch-me.request.schema.ts \
          apps/api/src/routes/profile/patch-me.response.schema.ts \
          apps/api/src/routes/profile/patch-me.route.ts \
          apps/api/src/routes/profile/patch-me.handler.ts
  git commit -m "feat(api): add PATCH /v1/me for role selection and allowContact toggle"
  ```

---

## Task 4: Strip demo seeding from bootstrap handler

**Files:**
- Modify: `apps/api/src/routes/bootstrap/post-bootstrap.handler.ts`

Demo data seeding now lives in `patch-me.handler.ts` (Task 3). Bootstrap only creates the bare profile.

- [ ] **Step 1: Remove seeding from bootstrap handler**

  Replace `apps/api/src/routes/bootstrap/post-bootstrap.handler.ts` with:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { postBootstrapRoute } from './post-bootstrap.route.js';

  export const postBootstrapHandler: RouteHandler<typeof postBootstrapRoute, Env> = async (c) => {
    const userId = c.get('userId');

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const profileCreated = !existingProfile;

    if (profileCreated) {
      await prisma.profile.create({
        data: {
          userId,
          fullName: '',
          email: '',
          role: '',
          location: '',
          isPro: false,
        },
      });
    }

    return c.json({ profileCreated, documentsCreated: 0, invoicesCreated: 0 }, 200);
  };
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/api/src/routes/bootstrap/post-bootstrap.handler.ts
  git commit -m "refactor(api): strip demo seeding from bootstrap (moved to PATCH /v1/me)"
  ```

---

## Task 5: requireCompany middleware

**Files:**
- Create: `apps/api/src/middlewares/require-company.ts`

- [ ] **Step 1: Create middleware**

  Create `apps/api/src/middlewares/require-company.ts`:

  ```ts
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/api/src/middlewares/require-company.ts
  git commit -m "feat(api): add requireCompany middleware"
  ```

---

## Task 6: GET /v1/talent (list) and GET /v1/talent/:userId (detail)

**Files:**
- Create: `apps/api/src/routes/talent/list-talent.response.schema.ts`
- Create: `apps/api/src/routes/talent/list-talent.route.ts`
- Create: `apps/api/src/routes/talent/list-talent.handler.ts`
- Create: `apps/api/src/routes/talent/get-talent.response.schema.ts`
- Create: `apps/api/src/routes/talent/get-talent.route.ts`
- Create: `apps/api/src/routes/talent/get-talent.handler.ts`

- [ ] **Step 1: Create list-talent response schema**

  Create `apps/api/src/routes/talent/list-talent.response.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const talentSummarySchema = z.object({
    userId: z.string(),
    fullName: z.string(),
    role: z.string(),
    location: z.string(),
    website: z.string().nullable(),
    allowContact: z.boolean(),
    bestScore: z.number().int(),
    assessmentCount: z.number().int(),
    isShortlisted: z.boolean(),
  });

  export const listTalentResponse200Schema = z.object({
    items: z.array(talentSummarySchema),
    total: z.number().int(),
  });
  ```

- [ ] **Step 2: Create list-talent route**

  Create `apps/api/src/routes/talent/list-talent.route.ts`:

  ```ts
  import { createRoute } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';
  import { listTalentResponse200Schema } from './list-talent.response.schema.js';

  export const listTalentRoute = createRoute({
    method: 'get',
    path: '/v1/talent',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        content: { 'application/json': { schema: listTalentResponse200Schema } },
        description: 'List of developers sorted by best assessment score',
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
    },
    tags: ['Talent'],
  });
  ```

- [ ] **Step 3: Create list-talent handler**

  Create `apps/api/src/routes/talent/list-talent.handler.ts`:

  ```ts
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
    bestScore: number;
    assessmentCount: bigint;
  };

  export const listTalentHandler: RouteHandler<typeof listTalentRoute, Env> = async (c) => {
    const companyUserId = c.get('userId');

    const rows = await prisma.$queryRaw<TalentRow[]>`
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
      JOIN "Assessment" a ON a."userId" = p."userId"
      WHERE p."userType" = 'DEVELOPER'::"UserType"
      GROUP BY p."userId", p."fullName", p.role, p.location, p.website, p."allowContact"
      ORDER BY "bestScore" DESC
    `;

    const shortlisted = await prisma.shortlist.findMany({
      where: { companyUserId },
      select: { devUserId: true },
    });
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
  ```

- [ ] **Step 4: Create get-talent response schema**

  Create `apps/api/src/routes/talent/get-talent.response.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  const assessmentSummarySchema = z.object({
    id: z.string(),
    repoUrl: z.string(),
    repoOwner: z.string(),
    repoName: z.string(),
    assessmentType: z.string(),
    overallScore: z.number().int(),
    model: z.string(),
    generatedAt: z.string(),
    createdAt: z.string(),
  });

  export const getTalentResponse200Schema = z.object({
    userId: z.string(),
    fullName: z.string(),
    role: z.string(),
    location: z.string(),
    website: z.string().nullable(),
    allowContact: z.boolean(),
    isShortlisted: z.boolean(),
    assessments: z.array(assessmentSummarySchema),
  });
  ```

- [ ] **Step 5: Create get-talent route**

  Create `apps/api/src/routes/talent/get-talent.route.ts`:

  ```ts
  import { createRoute, z } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';
  import { getTalentResponse200Schema } from './get-talent.response.schema.js';

  export const getTalentRoute = createRoute({
    method: 'get',
    path: '/v1/talent/:userId',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ userId: z.string() }),
    },
    responses: {
      200: {
        content: { 'application/json': { schema: getTalentResponse200Schema } },
        description: 'Developer profile with assessments',
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
      404: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Developer not found',
      },
    },
    tags: ['Talent'],
  });
  ```

- [ ] **Step 6: Create get-talent handler**

  Create `apps/api/src/routes/talent/get-talent.handler.ts`:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { getTalentRoute } from './get-talent.route.js';

  export const getTalentHandler: RouteHandler<typeof getTalentRoute, Env> = async (c) => {
    const companyUserId = c.get('userId');
    const { userId: devUserId } = c.req.valid('param');

    const profile = await prisma.profile.findUnique({
      where: { userId: devUserId, userType: 'DEVELOPER' },
      select: {
        userId: true,
        fullName: true,
        role: true,
        location: true,
        website: true,
        allowContact: true,
      },
    });

    if (!profile) {
      return c.json({ message: 'Developer not found.' }, 404);
    }

    const [assessments, shortlistEntry] = await Promise.all([
      prisma.assessment.findMany({
        where: { userId: devUserId },
        orderBy: { overallScore: 'desc' },
        select: {
          id: true,
          repoUrl: true,
          repoOwner: true,
          repoName: true,
          assessmentType: true,
          overallScore: true,
          model: true,
          generatedAt: true,
          createdAt: true,
        },
      }),
      prisma.shortlist.findUnique({
        where: { companyUserId_devUserId: { companyUserId, devUserId } },
        select: { id: true },
      }),
    ]);

    return c.json(
      {
        ...profile,
        isShortlisted: shortlistEntry !== null,
        assessments: assessments.map((a) => ({
          ...a,
          generatedAt: a.generatedAt.toISOString(),
          createdAt: a.createdAt.toISOString(),
        })),
      },
      200,
    );
  };
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add apps/api/src/routes/talent/
  git commit -m "feat(api): add GET /v1/talent list and detail endpoints"
  ```

---

## Task 7: Resend + POST /v1/talent/:userId/contact

**Files:**
- Modify: `apps/api/package.json`
- Create: `apps/api/src/lib/resend.ts`
- Create: `apps/api/src/routes/talent/contact-talent.request.schema.ts`
- Create: `apps/api/src/routes/talent/contact-talent.response.schema.ts`
- Create: `apps/api/src/routes/talent/contact-talent.route.ts`
- Create: `apps/api/src/routes/talent/contact-talent.handler.ts`

- [ ] **Step 1: Install resend**

  ```bash
  pnpm add resend --filter @jobclaw/api
  ```

  Expected: `resend` added to `apps/api/package.json` dependencies.

- [ ] **Step 2: Create resend client helper**

  Create `apps/api/src/lib/resend.ts`:

  ```ts
  import { Resend } from 'resend';

  export function getResendClient(): Resend | null {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
  }
  ```

- [ ] **Step 3: Create contact request schema**

  Create `apps/api/src/routes/talent/contact-talent.request.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const contactTalentBodySchema = z.object({
    message: z.string().min(10).max(2000),
  });
  ```

- [ ] **Step 4: Create contact response schema**

  Create `apps/api/src/routes/talent/contact-talent.response.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const contactTalentResponse200Schema = z.object({
    sent: z.boolean(),
  });
  ```

- [ ] **Step 5: Create contact route**

  Create `apps/api/src/routes/talent/contact-talent.route.ts`:

  ```ts
  import { createRoute, z } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';
  import { contactTalentBodySchema } from './contact-talent.request.schema.js';
  import { contactTalentResponse200Schema } from './contact-talent.response.schema.js';

  export const contactTalentRoute = createRoute({
    method: 'post',
    path: '/v1/talent/:userId/contact',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ userId: z.string() }),
      body: {
        content: { 'application/json': { schema: contactTalentBodySchema } },
        required: true,
      },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: contactTalentResponse200Schema } },
        description: 'Email sent',
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
      403: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Forbidden',
      },
      503: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Email service unavailable',
      },
    },
    tags: ['Talent'],
  });
  ```

- [ ] **Step 6: Create contact handler**

  Create `apps/api/src/routes/talent/contact-talent.handler.ts`:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { getResendClient } from '../../lib/resend.js';
  import { contactTalentRoute } from './contact-talent.route.js';

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

    await resend.emails.send({
      from: 'Jobclaw <noreply@jobclaw.fyi>',
      to: devProfile.email,
      subject: `[Jobclaw] ${companyName} is interested in your work`,
      html: `
        <p>Hi,</p>
        <p><strong>${companyName}</strong> found your Jobclaw profile and wants to connect.</p>
        <blockquote style="border-left:3px solid #ccc;padding-left:1em;color:#555">${message}</blockquote>
        <p>You can manage contact preferences in your <a href="https://jobclaw.fyi/settings">Jobclaw settings</a>.</p>
      `,
    });

    return c.json({ sent: true }, 200);
  };
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add apps/api/src/lib/resend.ts apps/api/src/routes/talent/contact-talent.* apps/api/package.json
  git commit -m "feat(api): add POST /v1/talent/:userId/contact with Resend email"
  ```

---

## Task 8: Shortlist endpoints (GET, POST, DELETE /v1/shortlist)

**Files:**
- Create: `apps/api/src/routes/shortlist/list-shortlist.response.schema.ts`
- Create: `apps/api/src/routes/shortlist/list-shortlist.route.ts`
- Create: `apps/api/src/routes/shortlist/list-shortlist.handler.ts`
- Create: `apps/api/src/routes/shortlist/post-shortlist.request.schema.ts`
- Create: `apps/api/src/routes/shortlist/post-shortlist.route.ts`
- Create: `apps/api/src/routes/shortlist/post-shortlist.handler.ts`
- Create: `apps/api/src/routes/shortlist/delete-shortlist.route.ts`
- Create: `apps/api/src/routes/shortlist/delete-shortlist.handler.ts`

- [ ] **Step 1: Create list-shortlist files**

  Create `apps/api/src/routes/shortlist/list-shortlist.response.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const shortlistItemSchema = z.object({
    devUserId: z.string(),
    fullName: z.string(),
    role: z.string(),
    location: z.string(),
    website: z.string().nullable(),
    bestScore: z.number().int().nullable(),
    shortlistedAt: z.string(),
  });

  export const listShortlistResponse200Schema = z.object({
    items: z.array(shortlistItemSchema),
    total: z.number().int(),
  });
  ```

  Create `apps/api/src/routes/shortlist/list-shortlist.route.ts`:

  ```ts
  import { createRoute } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';
  import { listShortlistResponse200Schema } from './list-shortlist.response.schema.js';

  export const listShortlistRoute = createRoute({
    method: 'get',
    path: '/v1/shortlist',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        content: { 'application/json': { schema: listShortlistResponse200Schema } },
        description: "Company's shortlisted developers",
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
      403: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Forbidden',
      },
    },
    tags: ['Shortlist'],
  });
  ```

  Create `apps/api/src/routes/shortlist/list-shortlist.handler.ts`:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { requireCompany } from '../../middlewares/require-company.js';
  import { listShortlistRoute } from './list-shortlist.route.js';

  export const listShortlistHandler: RouteHandler<typeof listShortlistRoute, Env> = async (c) => {
    // requireCompany middleware runs before this handler (registered in index.ts)
    const companyUserId = c.get('userId');

    const entries = await prisma.shortlist.findMany({
      where: { companyUserId },
      orderBy: { createdAt: 'desc' },
    });

    if (entries.length === 0) {
      return c.json({ items: [], total: 0 }, 200);
    }

    const devUserIds = entries.map((e) => e.devUserId);

    const profiles = await prisma.profile.findMany({
      where: { userId: { in: devUserIds } },
      select: { userId: true, fullName: true, role: true, location: true, website: true },
    });

    type ScoreRow = { userId: string; bestScore: number };
    const scores = await prisma.$queryRaw<ScoreRow[]>`
      SELECT "userId", MAX("overallScore")::int AS "bestScore"
      FROM "Assessment"
      WHERE "userId" = ANY(${devUserIds})
      GROUP BY "userId"
    `;

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

  export { requireCompany };
  ```

- [ ] **Step 2: Create post-shortlist files**

  Create `apps/api/src/routes/shortlist/post-shortlist.request.schema.ts`:

  ```ts
  import { z } from '@hono/zod-openapi';

  export const postShortlistBodySchema = z.object({
    devUserId: z.string(),
  });
  ```

  Create `apps/api/src/routes/shortlist/post-shortlist.route.ts`:

  ```ts
  import { createRoute } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';
  import { postShortlistBodySchema } from './post-shortlist.request.schema.js';

  export const postShortlistRoute = createRoute({
    method: 'post',
    path: '/v1/shortlist',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: postShortlistBodySchema } },
        required: true,
      },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: postShortlistBodySchema } },
        description: 'Developer added to shortlist',
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
      403: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Forbidden',
      },
    },
    tags: ['Shortlist'],
  });
  ```

  Create `apps/api/src/routes/shortlist/post-shortlist.handler.ts`:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { postShortlistRoute } from './post-shortlist.route.js';

  export const postShortlistHandler: RouteHandler<typeof postShortlistRoute, Env> = async (c) => {
    const companyUserId = c.get('userId');
    const { devUserId } = c.req.valid('json');

    await prisma.shortlist.upsert({
      where: { companyUserId_devUserId: { companyUserId, devUserId } },
      create: { companyUserId, devUserId },
      update: {},
    });

    return c.json({ devUserId }, 200);
  };
  ```

- [ ] **Step 3: Create delete-shortlist files**

  Create `apps/api/src/routes/shortlist/delete-shortlist.route.ts`:

  ```ts
  import { createRoute, z } from '@hono/zod-openapi';

  import { errorResponseSchema } from '../common/error.response.schema.js';

  export const deleteShortlistRoute = createRoute({
    method: 'delete',
    path: '/v1/shortlist/:devUserId',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ devUserId: z.string() }),
    },
    responses: {
      200: {
        content: { 'application/json': { schema: z.object({ removed: z.boolean() }) } },
        description: 'Developer removed from shortlist',
      },
      401: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Unauthorized',
      },
      403: {
        content: { 'application/json': { schema: errorResponseSchema } },
        description: 'Forbidden',
      },
    },
    tags: ['Shortlist'],
  });
  ```

  Create `apps/api/src/routes/shortlist/delete-shortlist.handler.ts`:

  ```ts
  import type { RouteHandler } from '@hono/zod-openapi';

  import type { Env } from '../../types.js';
  import { prisma } from '../../lib/prisma.js';
  import { deleteShortlistRoute } from './delete-shortlist.route.js';

  export const deleteShortlistHandler: RouteHandler<typeof deleteShortlistRoute, Env> = async (c) => {
    const companyUserId = c.get('userId');
    const { devUserId } = c.req.valid('param');

    await prisma.shortlist
      .delete({ where: { companyUserId_devUserId: { companyUserId, devUserId } } })
      .catch(() => {
        /* already deleted — ignore */
      });

    return c.json({ removed: true }, 200);
  };
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/api/src/routes/shortlist/
  git commit -m "feat(api): add GET/POST/DELETE /v1/shortlist endpoints"
  ```

---

## Task 9: Register all new routes in index.ts

**Files:**
- Modify: `apps/api/src/routes/index.ts`

- [ ] **Step 1: Replace index.ts with all routes registered**

  Replace `apps/api/src/routes/index.ts`:

  ```ts
  import type { OpenAPIHono } from '@hono/zod-openapi';

  import type { Env } from '../types.js';
  import { postBootstrapHandler } from './bootstrap/post-bootstrap.handler.js';
  import { postBootstrapRoute } from './bootstrap/post-bootstrap.route.js';
  import { requireAuth } from '../middlewares/auth.js';
  import { requireCompany } from '../middlewares/require-company.js';
  import { listDocumentsHandler } from './documents/list-documents.handler.js';
  import { listDocumentsRoute } from './documents/list-documents.route.js';
  import { getExampleHandler } from './example/get-example.handler.js';
  import { getExampleRoute } from './example/get-example.route.js';
  import { getHealthHandler } from './health/get-health.handler.js';
  import { getHealthRoute } from './health/get-health.route.js';
  import { listInvoicesHandler } from './invoices/list-invoices.handler.js';
  import { listInvoicesRoute } from './invoices/list-invoices.route.js';
  import { getMeHandler } from './profile/get-me.handler.js';
  import { getMeRoute } from './profile/get-me.route.js';
  import { patchMeHandler } from './profile/patch-me.handler.js';
  import { patchMeRoute } from './profile/patch-me.route.js';
  import { postProjectGithubHandler } from './ai-extract/post-project-github.handler.js';
  import { postProjectGithubRoute } from './ai-extract/post-project-github.route.js';
  import { postResumeParseHandler } from './ai-extract/post-resume-parse.handler.js';
  import { postResumeParseRoute } from './ai-extract/post-resume-parse.route.js';
  import { postAssessmentHandler } from './assessments/post-assessment.handler.js';
  import { postAssessmentRoute } from './assessments/post-assessment.route.js';
  import { listAssessmentsHandler } from './assessments/list-assessments.handler.js';
  import { listAssessmentsRoute } from './assessments/list-assessments.route.js';
  import { getAssessmentHandler } from './assessments/get-assessment.handler.js';
  import { getAssessmentRoute } from './assessments/get-assessment.route.js';
  import { postPortfolioGenerateHandler } from './portfolio/post-generate.handler.js';
  import { postPortfolioGenerateRoute } from './portfolio/post-generate.route.js';
  import { listTalentHandler } from './talent/list-talent.handler.js';
  import { listTalentRoute } from './talent/list-talent.route.js';
  import { getTalentHandler } from './talent/get-talent.handler.js';
  import { getTalentRoute } from './talent/get-talent.route.js';
  import { contactTalentHandler } from './talent/contact-talent.handler.js';
  import { contactTalentRoute } from './talent/contact-talent.route.js';
  import { listShortlistHandler } from './shortlist/list-shortlist.handler.js';
  import { listShortlistRoute } from './shortlist/list-shortlist.route.js';
  import { postShortlistHandler } from './shortlist/post-shortlist.handler.js';
  import { postShortlistRoute } from './shortlist/post-shortlist.route.js';
  import { deleteShortlistHandler } from './shortlist/delete-shortlist.handler.js';
  import { deleteShortlistRoute } from './shortlist/delete-shortlist.route.js';

  export const registerRoutes = (app: OpenAPIHono<Env>) => {
    app.openapi(getExampleRoute, getExampleHandler);
    app.openapi(getHealthRoute, getHealthHandler);

    app.use('/v1/*', requireAuth);

    // Profile
    app.openapi(postBootstrapRoute, postBootstrapHandler);
    app.openapi(getMeRoute, getMeHandler);
    app.openapi(patchMeRoute, patchMeHandler);

    // Developer routes
    app.openapi(listDocumentsRoute, listDocumentsHandler);
    app.openapi(listInvoicesRoute, listInvoicesHandler);
    app.openapi(postResumeParseRoute, postResumeParseHandler);
    app.openapi(postProjectGithubRoute, postProjectGithubHandler);
    app.openapi(postAssessmentRoute, postAssessmentHandler);
    app.openapi(listAssessmentsRoute, listAssessmentsHandler);
    app.openapi(getAssessmentRoute, getAssessmentHandler);
    app.openapi(postPortfolioGenerateRoute, postPortfolioGenerateHandler);

    // Talent directory (any authenticated user)
    app.openapi(listTalentRoute, listTalentHandler);
    app.openapi(getTalentRoute, getTalentHandler);

    // Contact (company only — handler enforces)
    app.openapi(contactTalentRoute, contactTalentHandler);

    // Shortlist (company only)
    app.use('/v1/shortlist*', requireCompany);
    app.openapi(listShortlistRoute, listShortlistHandler);
    app.openapi(postShortlistRoute, postShortlistHandler);
    app.openapi(deleteShortlistRoute, deleteShortlistHandler);
  };
  ```

- [ ] **Step 2: Build to verify no TS errors**

  ```bash
  cd apps/api && pnpm build 2>&1 | tail -20
  ```

  Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/api/src/routes/index.ts
  git commit -m "feat(api): register all company-feature routes"
  ```

---

## Task 10: Tests

**Files:**
- Create: `apps/api/test/company-feature.test.ts`

- [ ] **Step 1: Write tests**

  Create `apps/api/test/company-feature.test.ts`:

  ```ts
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
      const mockSend = vi.fn().mockResolvedValue({ id: 'email-123' });
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
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd apps/api && pnpm vitest run test/company-feature.test.ts
  ```

  Expected: all tests pass (or adjust mocks to match exact Prisma call signatures if any fail).

- [ ] **Step 3: Commit**

  ```bash
  git add apps/api/test/company-feature.test.ts
  git commit -m "test(api): add company feature tests (patch-me, talent, contact, shortlist)"
  ```

---

## Task 11: Web — extend ApiContext and add ProfileContext

**Files:**
- Modify: `apps/web/lib/api-context.tsx`
- Create: `apps/web/lib/profile-context.tsx`
- Modify: `apps/web/app/providers.tsx`

- [ ] **Step 1: Add patch and delete methods to ApiContext**

  In `apps/web/lib/api-context.tsx`, update the `HttpMethod` type and the `ApiClient` type, and add `patch` and `delete` to the value:

  ```ts
  'use client';

  import { createElement, createContext, useCallback, useContext, useMemo, useState } from 'react';

  const STORAGE_KEY = 'team7_api_bearer';

  type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

  type ApiClient = {
    get: <T>(path: string) => Promise<T>;
    post: <T>(path: string, body?: unknown) => Promise<T>;
    patch: <T>(path: string, body?: unknown) => Promise<T>;
    delete: <T>(path: string) => Promise<T>;
    setAuthToken: (token: string | null) => void;
    authToken: string | null;
  };

  const ApiContext = createContext<ApiClient | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

  async function request<T>(method: HttpMethod, path: string, token: string | null, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message = json?.message ?? `Request failed (${response.status})`;
      throw new Error(message);
    }

    return json as T;
  }

  function readStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  export function ApiProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [authToken, setAuthTokenState] = useState<string | null>(() => readStoredToken());

    const setAuthToken = useCallback((token: string | null) => {
      setAuthTokenState(token);
      if (typeof window === 'undefined') return;
      try {
        if (token) sessionStorage.setItem(STORAGE_KEY, token);
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore quota / private mode */
      }
    }, []);

    const value = useMemo<ApiClient>(
      () => ({
        authToken,
        setAuthToken,
        get: <T,>(path: string) => request<T>('GET', path, authToken),
        post: <T,>(path: string, body?: unknown) => request<T>('POST', path, authToken, body),
        patch: <T,>(path: string, body?: unknown) => request<T>('PATCH', path, authToken, body),
        delete: <T,>(path: string) => request<T>('DELETE', path, authToken),
      }),
      [authToken, setAuthToken],
    );

    return createElement(ApiContext.Provider, { value }, children) as React.JSX.Element;
  }

  export function useApi() {
    const context = useContext(ApiContext);
    if (!context) throw new Error('useApi must be used inside ApiProvider.');
    return context;
  }
  ```

- [ ] **Step 2: Create ProfileContext**

  Create `apps/web/lib/profile-context.tsx`:

  ```tsx
  'use client';

  import { createContext, useContext, useEffect, useState } from 'react';

  import { useApi } from './api-context';

  export type UserType = 'DEVELOPER' | 'COMPANY';

  type Profile = {
    userId: string;
    fullName: string;
    email: string;
    role: string;
    location: string;
    website: string | null;
    isPro: boolean;
    userType: UserType | null;
    companyName: string | null;
    industry: string | null;
    allowContact: boolean;
  };

  type ProfileContextValue = {
    profile: Profile | null;
    isLoading: boolean;
    refetch: () => void;
  };

  const ProfileContext = createContext<ProfileContextValue | null>(null);

  export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { authToken, get } = useApi();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => {
      if (!authToken) {
        setProfile(null);
        return;
      }
      setIsLoading(true);
      get<Profile>('/v1/me')
        .then(setProfile)
        .catch(() => setProfile(null))
        .finally(() => setIsLoading(false));
    }, [authToken, version, get]);

    return (
      <ProfileContext.Provider value={{ profile, isLoading, refetch: () => setVersion((v) => v + 1) }}>
        {children}
      </ProfileContext.Provider>
    );
  }

  export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) throw new Error('useProfile must be used inside ProfileProvider.');
    return context;
  }
  ```

- [ ] **Step 3: Add ProfileProvider to AppProviders**

  Replace `apps/web/app/providers.tsx`:

  ```tsx
  'use client';

  import { DashboardChrome } from '../components/home/dashboard-chrome';
  import { ApiProvider } from '../lib/api-context';
  import { BillingProvider } from '../lib/billing-context';
  import { ProfileProvider } from '../lib/profile-context';
  import { SupabaseAuthBridge } from '../lib/supabase-auth-bridge';

  export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
      <ApiProvider>
        <BillingProvider>
          <SupabaseAuthBridge>
            <ProfileProvider>
              <DashboardChrome>{children}</DashboardChrome>
            </ProfileProvider>
          </SupabaseAuthBridge>
        </BillingProvider>
      </ApiProvider>
    );
  }
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/lib/api-context.tsx apps/web/lib/profile-context.tsx apps/web/app/providers.tsx
  git commit -m "feat(web): add patch/delete to ApiContext, add ProfileContext with userType"
  ```

---

## Task 12: Web — /onboarding/role page

**Files:**
- Create: `apps/web/app/onboarding/role/page.tsx`

- [ ] **Step 1: Create the role selection page**

  Create `apps/web/app/onboarding/role/page.tsx`:

  ```tsx
  'use client';

  import { Icon } from '@iconify/react';
  import { useRouter } from 'next/navigation';
  import { useEffect, useState } from 'react';

  import { useApi } from '../../../lib/api-context';
  import { useProfile } from '../../../lib/profile-context';

  export default function RoleSelectionPage() {
    const router = useRouter();
    const { patch } = useApi();
    const { profile, isLoading, refetch } = useProfile();
    const [selected, setSelected] = useState<'DEVELOPER' | 'COMPANY' | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Redirect if role already set
    useEffect(() => {
      if (!isLoading && profile?.userType === 'DEVELOPER') router.replace('/home');
      if (!isLoading && profile?.userType === 'COMPANY') router.replace('/company/talent');
    }, [isLoading, profile, router]);

    async function handleSubmit() {
      if (!selected) return;
      if (selected === 'COMPANY' && !companyName.trim()) return;
      setSubmitting(true);
      try {
        await patch('/v1/me', {
          userType: selected,
          ...(selected === 'COMPANY' && { companyName: companyName.trim(), industry: industry.trim() || undefined }),
        });
        refetch();
        if (selected === 'DEVELOPER') router.push('/home');
        else router.push('/company/talent');
      } finally {
        setSubmitting(false);
      }
    }

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
        </div>
      );
    }

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-background" />
          <div className="absolute top-0 left-0 size-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/15 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-10 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_30px_rgba(217,119,87,0.4)] mx-auto">
              <Icon icon="solar:bolt-bold" className="text-3xl text-primary-foreground" />
            </div>
            <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight">Who are you?</h1>
            <p className="text-muted-foreground">Choose your role to get started.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <button
              type="button"
              onClick={() => setSelected('DEVELOPER')}
              className={`rounded-xl border-2 p-6 text-left transition-all ${
                selected === 'DEVELOPER'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Icon icon="solar:code-bold" className="mb-3 text-3xl text-primary" />
              <div className="font-semibold">I&apos;m a Developer</div>
              <div className="mt-1 text-sm text-muted-foreground">Build your technical identity with AI assessments</div>
            </button>

            <button
              type="button"
              onClick={() => setSelected('COMPANY')}
              className={`rounded-xl border-2 p-6 text-left transition-all ${
                selected === 'COMPANY'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Icon icon="solar:buildings-bold" className="mb-3 text-3xl text-primary" />
              <div className="font-semibold">I&apos;m a Company</div>
              <div className="mt-1 text-sm text-muted-foreground">Hire developers based on verified code quality</div>
            </button>
          </div>

          {selected === 'COMPANY' && (
            <div className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name *"
                className="w-full rounded border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Industry (optional)"
                className="w-full rounded border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || submitting || (selected === 'COMPANY' && !companyName.trim())}
            className="w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {submitting ? 'Setting up…' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/app/onboarding/
  git commit -m "feat(web): add /onboarding/role page for developer vs company selection"
  ```

---

## Task 13: Web — route guards (home layout + company layout)

**Files:**
- Create: `apps/web/app/home/layout.tsx`
- Create: `apps/web/app/company/layout.tsx`

- [ ] **Step 1: Create home layout (developer guard)**

  Create `apps/web/app/home/layout.tsx`:

  ```tsx
  'use client';

  import { useRouter } from 'next/navigation';
  import { useEffect } from 'react';

  import { useProfile } from '../../lib/profile-context';

  export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { profile, isLoading } = useProfile();

    useEffect(() => {
      if (isLoading) return;
      if (!profile) return; // not logged in — let Supabase middleware handle
      if (profile.userType === null) router.replace('/onboarding/role');
      else if (profile.userType === 'COMPANY') router.replace('/company/talent');
    }, [isLoading, profile, router]);

    return <>{children}</>;
  }
  ```

- [ ] **Step 2: Create company layout (company guard)**

  Create `apps/web/app/company/layout.tsx`:

  ```tsx
  'use client';

  import { useRouter } from 'next/navigation';
  import { useEffect } from 'react';

  import { useProfile } from '../../lib/profile-context';

  export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { profile, isLoading } = useProfile();

    useEffect(() => {
      if (isLoading) return;
      if (!profile) return;
      if (profile.userType === null) router.replace('/onboarding/role');
      else if (profile.userType === 'DEVELOPER') router.replace('/home');
    }, [isLoading, profile, router]);

    return <>{children}</>;
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/app/home/layout.tsx apps/web/app/company/layout.tsx
  git commit -m "feat(web): add route guards for developer/home and company layouts"
  ```

---

## Task 14: Web — /company/talent page (talent directory)

**Files:**
- Create: `apps/web/app/company/talent/page.tsx`

- [ ] **Step 1: Create the talent directory page**

  Create `apps/web/app/company/talent/page.tsx`:

  ```tsx
  'use client';

  import { Icon } from '@iconify/react';
  import Link from 'next/link';
  import { useEffect, useState } from 'react';

  import { useApi } from '../../../lib/api-context';
  import { useProfile } from '../../../lib/profile-context';

  type TalentItem = {
    userId: string;
    fullName: string;
    role: string;
    location: string;
    website: string | null;
    allowContact: boolean;
    bestScore: number;
    assessmentCount: number;
    isShortlisted: boolean;
  };

  export default function TalentDirectoryPage() {
    const { get, post, delete: del } = useApi();
    const { profile } = useProfile();
    const [items, setItems] = useState<TalentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      get<{ items: TalentItem[]; total: number }>('/v1/talent')
        .then((data) => setItems(data.items))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, [get]);

    async function toggleShortlist(item: TalentItem) {
      if (item.isShortlisted) {
        await del(`/v1/shortlist/${item.userId}`).catch(() => null);
      } else {
        await post('/v1/shortlist', { devUserId: item.userId }).catch(() => null);
      }
      setItems((prev) =>
        prev.map((i) => (i.userId === item.userId ? { ...i, isShortlisted: !i.isShortlisted } : i)),
      );
    }

    function scoreColor(score: number) {
      if (score >= 80) return 'text-green-400';
      if (score >= 60) return 'text-yellow-400';
      return 'text-red-400';
    }

    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="solar:bolt-bold" className="text-2xl text-primary" />
            <span className="font-heading text-xl font-black tracking-tighter">
              Job<span className="text-primary">claw</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.companyName}</span>
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">Settings</Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Talent Directory</h1>
            <p className="mt-1 text-muted-foreground">
              Developers sorted by their highest assessment score.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              No developers with assessments yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Developer</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-center font-semibold">Best Score</th>
                    <th className="px-4 py-3 text-center font-semibold">Assessments</th>
                    <th className="px-4 py-3 text-center font-semibold">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.userId}
                      className={`border-b border-border last:border-0 transition-colors hover:bg-secondary/20 ${idx % 2 === 0 ? '' : 'bg-secondary/10'}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/company/talent/${item.userId}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {item.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.location}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono font-bold text-lg ${scoreColor(item.bestScore)}`}>
                          {item.bestScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{item.assessmentCount}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleShortlist(item)}
                          className="transition-colors hover:text-primary"
                          title={item.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          <Icon
                            icon={item.isShortlisted ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}
                            className={`text-xl ${item.isShortlisted ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/app/company/talent/page.tsx
  git commit -m "feat(web): add /company/talent directory page"
  ```

---

## Task 15: Web — /company/talent/[userId] developer detail page

**Files:**
- Create: `apps/web/app/company/talent/[userId]/page.tsx`

- [ ] **Step 1: Create the developer detail page**

  Create `apps/web/app/company/talent/[userId]/page.tsx`:

  ```tsx
  'use client';

  import { Icon } from '@iconify/react';
  import Link from 'next/link';
  import { use, useEffect, useState } from 'react';

  import { useApi } from '../../../../lib/api-context';

  type Assessment = {
    id: string;
    repoUrl: string;
    repoOwner: string;
    repoName: string;
    assessmentType: string;
    overallScore: number;
    model: string;
    generatedAt: string;
    createdAt: string;
  };

  type DeveloperDetail = {
    userId: string;
    fullName: string;
    role: string;
    location: string;
    website: string | null;
    allowContact: boolean;
    isShortlisted: boolean;
    assessments: Assessment[];
  };

  export default function DeveloperDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const { get, post } = useApi();
    const [dev, setDev] = useState<DeveloperDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [contactOpen, setContactOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
      get<DeveloperDetail>(`/v1/talent/${userId}`)
        .then(setDev)
        .catch(() => setDev(null))
        .finally(() => setLoading(false));
    }, [userId, get]);

    async function sendContact() {
      if (!message.trim()) return;
      setSending(true);
      try {
        await post(`/v1/talent/${userId}/contact`, { message: message.trim() });
        setSent(true);
        setContactOpen(false);
        setMessage('');
      } finally {
        setSending(false);
      }
    }

    function scoreColor(score: number) {
      if (score >= 80) return 'text-green-400';
      if (score >= 60) return 'text-yellow-400';
      return 'text-red-400';
    }

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
        </div>
      );
    }

    if (!dev) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
          <p className="text-muted-foreground">Developer not found.</p>
          <Link href="/company/talent" className="mt-4 text-primary hover:underline">← Back to directory</Link>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border px-6 py-4">
          <Link href="/company/talent" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
            <Icon icon="solar:arrow-left-linear" />
            Back to directory
          </Link>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{dev.fullName}</h1>
              <p className="mt-1 text-muted-foreground">{dev.role} · {dev.location}</p>
              {dev.website && (
                <a href={dev.website} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-primary hover:underline">
                  {dev.website}
                </a>
              )}
            </div>
            <div>
              {dev.allowContact ? (
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  disabled={sent}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {sent ? 'Message Sent ✓' : 'Contact'}
                </button>
              ) : (
                <span className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground">
                  Not accepting contact
                </span>
              )}
            </div>
          </div>

          <h2 className="mb-4 text-xl font-semibold">Assessments</h2>
          {dev.assessments.length === 0 ? (
            <p className="text-muted-foreground">No assessments yet.</p>
          ) : (
            <div className="space-y-3">
              {dev.assessments.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.repoOwner}/{a.repoName}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {a.assessmentType} · {new Date(a.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`font-mono text-2xl font-bold ${scoreColor(a.overallScore)}`}>
                    {a.overallScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Contact Modal */}
        {contactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-xl font-bold">Contact {dev.fullName}</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you're reaching out..."
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendContact}
                  disabled={message.trim().length < 10 || sending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/app/company/talent/
  git commit -m "feat(web): add /company/talent/[userId] developer detail page with contact modal"
  ```

---

## Task 16: Web — Developer Settings allowContact toggle

**Files:**
- Modify: `apps/web/components/settings/settings-desktop.tsx`

- [ ] **Step 1: Add allowContact to SettingsFormProps**

  First, read `apps/web/components/settings/settings-types.ts` (or wherever `SettingsFormProps` is defined) and add `allowContact: boolean` to the form shape. Then update `settings-desktop.tsx`:

  In `settings-desktop.tsx`, add the toggle section before the Danger Zone block:

  ```tsx
  // Add after the Save Changes button:
  <div className="mt-10 rounded-xl border border-border bg-card p-6">
    <h3 className="mb-1 font-semibold">Contact Preferences</h3>
    <p className="mb-4 text-sm text-muted-foreground">
      Allow companies on Jobclaw to send you messages via email.
    </p>
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        role="switch"
        aria-checked={form.allowContact}
        onClick={() => update('allowContact', !form.allowContact)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          form.allowContact ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            form.allowContact ? 'translate-x-5' : ''
          }`}
        />
      </div>
      <span className="text-sm">Allow companies to contact me via Jobclaw</span>
    </label>
  </div>
  ```

  Then find the settings page component that manages form state (likely `apps/web/app/settings/page.tsx` or a responsive wrapper) and wire it to call `patch('/v1/me', { allowContact })` on save.

  In the settings page that holds `onSave`, add the `allowContact` field to the form state and include it in the PATCH call:

  ```ts
  // In the save handler, alongside other profile fields:
  await patch('/v1/me', { allowContact: form.allowContact });
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/components/settings/
  git commit -m "feat(web): add allowContact toggle to developer settings"
  ```

---

## Self-Review Checklist

After completing all tasks, verify:

- [ ] `pnpm build` passes with no TypeScript errors across the monorepo
- [ ] `cd apps/api && pnpm vitest run` — all tests pass
- [ ] New user login flow: bootstrap → `/onboarding/role` → pick Developer → `/home` (with demo data)
- [ ] New user login flow: bootstrap → `/onboarding/role` → pick Company → `/company/talent`
- [ ] Existing users with `userType === null` are redirected to `/onboarding/role`
- [ ] Company user visits `/home` → redirected to `/company/talent`
- [ ] Developer visits `/company/talent` → redirected to `/home`
- [ ] `GET /v1/talent` returns developers ordered by `bestScore` desc
- [ ] Company can shortlist/un-shortlist a developer (optimistic toggle)
- [ ] Contact button disabled when `allowContact=false`; modal appears when `true`
- [ ] Developer `allowContact` toggle in settings persists via PATCH /v1/me
