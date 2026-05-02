# Node.js backend quality assessment (AI reviewer)

When this file is used by **`jobclaw assess`**, the CLI bundles text files under `{{ROOT}}` and sends them to the model with instructions to return **JSON scores** (see `apps/cli/src/lib/backend-assessment.ts`).  
You can still replace `{{ROOT}}` and paste the sections below into another AI tool for a manual review.

---

You are a senior backend engineer reviewing a **Node.js** codebase. Your task is to **assess the repository at `{{ROOT}}`** using the **file excerpts provided in the user message** (the CLI walks the tree with sensible caps). Produce an **evidence-based** judgment.

## Scoring rubric (0–10 per dimension)

Use integers **0–10** where **10** means “production-grade / clearly implemented with evidence in excerpts” and **0** means “not found or not verifiable from excerpts.”

| Dimension | What “high score” requires |
|-----------|---------------------------|
| **openapi** | OpenAPI/Swagger or `@hono/zod-openapi` (or equivalent) with operations, schemas, and preferably interactive docs (`/docs`, Scalar, etc.) visible in code excerpts. |
| **zodValidation** | Zod (or `@hono/zod-openapi`) validating **request** inputs at route boundaries; bonus if response shapes are also declared (not necessarily runtime-checked). |
| **rateLimiting** | Middleware or library limiting requests (per IP/user/route) appears in excerpts or dependencies used in code. |
| **caching** | HTTP cache headers, ETag, CDN hints, or app middleware/cache layer visible in excerpts. |
| **prismaModels** | `schema.prisma` (or similar) with clear models, relations, indexes; domain understandable from schema. |

## What to evaluate (detail)

### 1. OpenAPI documentation

- Look for `openapi.yaml/json`, `@hono/zod-openapi`, Scalar/Swagger UI, route definitions with `description`, `tags`, `responses`, `requestBody`.
- Cite **file paths** from excerpts only.

### 2. Zod schema validation

- Look for `zod`, `c.req.valid()`, `safeParse`, `*.schema.ts`, shared validators.

### 3. Middleware: rate limiting and caching

- Rate limiting: `express-rate-limit`, `@hono-rate-limiter`, Redis limiters, etc.
- Caching: `Cache-Control`, `ETag`, `lru-cache`, Redis cache middleware.

### 4. Clear model declaration (Prisma)

- `schema.prisma`: models, relations, indexes, enums, cascades.

## Required machine-readable output (when using the CLI)

The CLI’s system instructions ask for **JSON only** with:

- `scores.openapi`, `scores.zodValidation`, `scores.rateLimiting`, `scores.caching`, `scores.prismaModels` (each **0–10**)
- `overallScore` (**0–100**, same weight per criterion: average of the five scores × 10, rounded)
- `scorecard`: five rows (one per dimension above) with `criterion`, `score`, `status` (`Strong` / `Partial` / `Missing`), `confidence` (`High` / `Medium` / `Low`), `rationale`
- `executiveSummary`, `findings`, `gapsAndRisks`, `nextSteps`

## Human-readable sections (optional copy-paste workflow)

If you are **not** using `jobclaw assess`, you can still respond with:

1. **Executive summary** (5–8 sentences).
2. **Scorecard** — table: OpenAPI, Zod, Rate limit, Caching, Prisma; columns **Score (0–10)**, **Status**, **Confidence**.
3. **Findings** — bullets with **paths**.
4. **Gaps & risks** — prioritized.
5. **Concrete next steps** — 3–7 items.

If excerpts are insufficient to verify an item, score conservatively and set **confidence** to **Low** with rationale.

---

**CLI usage:** `jobclaw assess [path]` (default: current directory). Set **`OPENAI_API_KEY`** or run **`jobclaw init`**.

- **`--out report.md`** — writes a markdown report (scores, summary, tables).
- **`--out report.json`** — writes the raw model JSON.
- **`--json`** — prints raw JSON to stdout only (no markdown file unless `--out` is set).

From the monorepo root: **`pnpm assess:api`** builds the CLI and assesses `apps/api`, writing **`apps/api/assessments/latest.md`**.
