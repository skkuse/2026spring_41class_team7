# Company User Type — Design Spec

**Date**: 2026-05-27  
**Status**: Approved

---

## Overview

Jobclaw currently serves only developers. This feature adds a second user type — **Company** — that can browse and shortlist developers based on their jobclaw assessment scores, and optionally contact them via email through the platform.

---

## Goals

1. After first login, every new user picks a role: **Developer** or **Company**.
2. Companies see a talent directory of developers sorted by their best assessment score (highest to lowest).
3. Companies can shortlist developers and, if the developer has opted in, send a contact email via Resend.
4. Developers gain an "Allow companies to contact me" toggle in Settings.

---

## Non-Goals (out of scope for this spec)

- Messaging threads / inbox between companies and developers
- Company subscription / billing
- Developer job application flow
- Search/filter beyond score sorting (e.g. by tech stack, location)

---

## Database Schema Changes

### Extend `Profile`

```prisma
enum UserType {
  DEVELOPER
  COMPANY
}

model Profile {
  // ... existing fields ...
  userType      UserType?  // null until role-selection step is completed
  companyName   String?    // populated for COMPANY users
  industry      String?    // populated for COMPANY users
  allowContact  Boolean    @default(false)  // DEVELOPER: opts in to contact emails
}
```

`userType` is nullable so existing profiles and the bootstrap step are not broken. Role-selection sets it to a non-null value.

### New `Shortlist` model

```prisma
model Shortlist {
  id            String   @id @default(cuid())
  companyUserId String   // userId of the company
  devUserId     String   // userId of the developer
  createdAt     DateTime @default(now())

  @@unique([companyUserId, devUserId])
  @@index([companyUserId])
}
```

---

## API Changes

All routes are under `/v1/*` and require auth.

### Existing route — update

| Method | Path | Change |
|--------|------|--------|
| `PATCH` | `/v1/profile/me` | New endpoint. Accepts `userType`, `companyName`, `industry`, `allowContact`. Used by role-selection step and developer settings. |

### New routes

| Method | Path | Auth restriction | Description |
|--------|------|-----------------|-------------|
| `GET` | `/v1/talent` | Any authenticated user | List developers who have ≥1 assessment, with their best `overallScore`. Sorted desc by best score. |
| `GET` | `/v1/talent/:userId` | Any authenticated user | Full developer profile + all their assessments (summary list). |
| `POST` | `/v1/talent/:userId/contact` | `userType === COMPANY` | Send contact email via Resend. Developer must have `allowContact = true`. Body: `{ message: string }`. |
| `GET` | `/v1/shortlist` | `userType === COMPANY` | Return company's shortlisted developers. |
| `POST` | `/v1/shortlist` | `userType === COMPANY` | Add a developer to shortlist. Body: `{ devUserId: string }`. |
| `DELETE` | `/v1/shortlist/:devUserId` | `userType === COMPANY` | Remove from shortlist. |

### `GET /v1/talent` query

Uses a raw SQL / Prisma query to compute `bestScore` per developer:

```sql
SELECT p.*, MAX(a."overallScore") AS "bestScore"
FROM "Profile" p
JOIN "Assessment" a ON a."userId" = p."userId"
WHERE p."userType" = 'DEVELOPER'
GROUP BY p.id
ORDER BY "bestScore" DESC
```

Response shape:
```json
{
  "items": [
    {
      "userId": "...",
      "fullName": "...",
      "role": "...",
      "location": "...",
      "website": "...",
      "bestScore": 92,
      "assessmentCount": 3,
      "isShortlisted": true
    }
  ],
  "total": 42
}
```

`isShortlisted` is `true` if the requesting company has this developer in their shortlist.

---

## Role-Selection Flow

### Sequence

1. User authenticates (existing Supabase social auth).
2. Frontend calls `POST /v1/bootstrap` — creates a bare Profile (no demo data seeded yet). The current bootstrap seeds demo documents/invoices; this seeding moves to the `PATCH /v1/profile/me` handler and only runs when `userType === DEVELOPER` is being set for the first time (i.e. `profile.userType` was null before the patch).
3. Frontend checks `profile.userType` from `GET /v1/profile/me`.
4. If `userType` is `null` → redirect to `/onboarding/role`.
5. `/onboarding/role` page: two cards — **"I'm a Developer"** / **"I'm a Company"**.
   - Developer → calls `PATCH /v1/profile/me` with `{ userType: "DEVELOPER" }` → redirect to `/home`.
   - Company → shows a second step: enter Company Name + Industry → calls `PATCH /v1/profile/me` with `{ userType: "COMPANY", companyName, industry }` → redirect to `/company/talent`.
6. Middleware prevents access to role-protected routes (e.g. `/company/*`) if `userType !== COMPANY`.

### Middleware guard (Next.js `middleware.ts`)

- `/onboarding/role` — accessible only if logged in and `userType` is null.
- `/company/*` — requires `userType === COMPANY`. Redirect to `/home` otherwise.
- `/home`, `/documents`, `/projects`, `/profile` — requires `userType === DEVELOPER`. Redirect to `/company/talent` otherwise.

The `userType` is stored in a short-lived cookie or read from the API at bootstrap time and surfaced via the existing `ApiContext`.

---

## Web Pages

### `/onboarding/role` (new)

- Full-screen centered layout, matching the existing onboarding visual style.
- Two large cards: Developer card (bolt icon + "Build your technical identity") and Company card (building icon + "Hire based on verified code quality").
- Selecting Company reveals an inline form: Company Name (required) + Industry (optional).
- Submit calls `PATCH /v1/profile/me`, then navigates to the appropriate dashboard.

### `/company/talent` (new — Company dashboard)

- Header: company name + sign-out button.
- Talent directory table/grid: avatar, name, role, location, best score badge, shortlist button.
- Default sort: best score descending. No other sort options in MVP.
- Shortlist button is a toggle (bookmark icon); fires `POST` or `DELETE /v1/shortlist` optimistically.
- Clicking a row navigates to `/company/talent/[userId]`.

### `/company/talent/[userId]` (new — Developer detail)

- Developer name, role, location, website.
- Assessment list: repo name, type, overall score, date — sorted by score desc.
- "Contact" button — enabled only if developer has `allowContact = true`. Clicking opens a modal with a message textarea; on submit calls `POST /v1/talent/:userId/contact`.
- If `allowContact = false`, show a muted "Not accepting contact" label instead.

### `/settings` — Developer additions

- New toggle: "Allow companies to contact me via Jobclaw" — calls `PATCH /v1/profile/me` with `{ allowContact: true/false }`.

---

## Email (Resend)

When `POST /v1/talent/:userId/contact` is called:

1. API verifies caller is a company (`userType === COMPANY`).
2. API verifies developer has `allowContact === true`.
3. Fetches developer's email from their Profile.
4. Sends email via Resend to the developer's address.
5. Email subject: `[Jobclaw] {companyName} is interested in your work`
6. Email body: company name, company's message, link to their own jobclaw profile.
7. Returns `{ sent: true }` on success.

Resend API key is already expected as an env var (`RESEND_API_KEY`). If not set, the endpoint returns a 503.

---

## Data Access & Privacy

- Developer profiles are readable by any authenticated user (developer or company) via `GET /v1/talent/:userId`.
- Developer email is **never** exposed in API responses — only used server-side for Resend.
- `allowContact` defaults to `false` — developers must explicitly opt in.
- Companies cannot view other companies' shortlists.

---

## Error Cases

| Scenario | Behavior |
|----------|----------|
| Company contacts developer with `allowContact=false` | 403 — "Developer has not enabled contact" |
| Company contacts developer, `RESEND_API_KEY` missing | 503 — "Email service unavailable" |
| Non-company tries to access `/company/*` | 302 redirect to `/home` |
| Developer tries to access `/company/talent` | 302 redirect to `/home` |
| Duplicate shortlist entry | 409 (upsert-safe: ignore duplicate, return 200) |

---

## Testing

- Unit: `GET /v1/talent` returns correct `bestScore` per developer, ordered correctly.
- Unit: `POST /v1/talent/:userId/contact` — blocks when `allowContact=false`, calls Resend mock when `true`.
- Unit: `POST /v1/shortlist` — duplicate returns 200 without error.
- Integration: role-selection → bootstrap → `PATCH /v1/profile/me` → correct dashboard redirect.
- UI smoke: company sees talent directory, can shortlist, can open developer detail.
