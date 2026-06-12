# Jobclaw

**Resumes lie. Code doesn't.**

Hiring is broken. Candidates write skills they don't have. Companies make expensive bad hires. The root cause is that résumés are unverifiable — there's no way to know if someone can actually write code until they're already on the team.

Jobclaw fixes this from both sides:

- **For developers:** connect your GitHub and get a verified code portfolio with an objective assessment of your actual engineering skills. No more losing to candidates who write better bullet points.
- **For companies:** evaluate whether a candidate's real code fits your codebase — style, patterns, complexity, quality — before the first interview.

### Why open source?

What makes code "good" is not universal. A systems shop and a startup have different standards. A Python team and a Go team evaluate code differently. No single company can define the right evaluation metrics for every codebase.

That's why Jobclaw's evaluation engine is open source. We need developers — people who actually write and review code — to contribute the evaluators that measure what matters. If you've ever done a code review, you can write an evaluator.

---

## Install the CLI

**npm (recommended)**

```bash
npm install -g jobclaw
```

**pnpm**

```bash
pnpm add -g jobclaw
```

**curl (macOS / Linux)**

```bash
curl -fsSL https://raw.githubusercontent.com/hskang9/2026spring_41class_team7/main/scripts/install.sh | bash
```

Once installed, verify:

```bash
jobclaw doctor
```

---

## CLI Commands

| Command | Description |
|---|---|
| `jobclaw init` | Set up credentials and initialize config |
| `jobclaw login` | Authenticate with your Jobclaw account |
| `jobclaw logout` | Sign out |
| `jobclaw assess <path>` | Analyze a local codebase and generate an assessment |
| `jobclaw publish` | Publish your assessment to your public profile |
| `jobclaw doctor` | Check that your setup is healthy |

**Example: assess your backend**

```bash
jobclaw assess ./apps/api --type node-backend --out assessment.md
```

---

## What it does

- Scans your repository for code complexity, patterns, and engineering signals
- Scores whether your contributions reflect genuine skill or AI-generated output
- Generates a shareable technical profile recruiters and engineers can trust
- Gives junior developers actionable feedback to level up

---

## Monorepo structure

```
jobclaw/
├── apps/
│   ├── cli/        # jobclaw CLI (TypeScript + Ink)
│   ├── api/        # REST API (Hono + Prisma)
│   └── web/        # Marketing + dashboard (Next.js)
└── packages/
    ├── shared-types/          # Shared TypeScript types
    └── project-management/    # Internal project bookmark util
```

**Stack:** TypeScript · Next.js · Hono · Prisma · Supabase · pnpm workspaces · Turborepo

---

## Enterprise: Private Assessments for Hiring

Running a technical hiring process? Jobclaw offers **private assessments** — run the evaluation engine against a candidate's codebase before the interview, with results visible only to your team.

What you get:

- **Codebase-fit scoring** — measure how closely a candidate's coding style, patterns, and conventions align with your existing stack
- **Skill verification** — objective signal on the skills they claimed, not just what they wrote in a résumé
- **Actionable hiring reports** — shareable assessment output your engineering team can discuss before the offer
- **Custom evaluators** — work with us to build evaluators tuned to your specific codebase and engineering standards
- **Private by default** — assessments run in your environment and are never published to the candidate's public profile without your approval

This is how you stop making expensive bad hires.

**Contact us to get started:** [contact@digitalnative.vip](mailto:contact@digitalnative.vip)

---

## Contributing an Evaluator

An **evaluator** is a module that takes a codebase as input and returns a score + feedback on a specific dimension. Examples:

- Does this code follow consistent naming conventions?
- Is error handling thorough or shallow?
- Are abstractions at the right level, or is this over-engineered?
- Does the test coverage reflect real confidence or just line count?
- Would this code be readable to a new team member in 6 months?

Each evaluator is independent — you pick a dimension you care about, write the logic, and the platform runs it as part of the overall assessment.

### What a good evaluator looks like

A good evaluator:
- Measures something a senior engineer would actually care about in a code review
- Produces a score (0–100) and a human-readable explanation of why
- Is specific enough to be actionable ("your error handling only covers happy paths in 3 of 7 API routes") rather than vague ("error handling could be better")
- Works on real codebases, not toy examples

### How to contribute one

1. Open an issue describing the evaluation dimension you want to add
2. Fork the repo and implement the evaluator under `apps/api/src/evaluators/<your-name>.ts`
3. Add tests with at least two real-world examples (one that scores well, one that doesn't)
4. Open a PR — keep it focused on the single evaluator

The evaluation interface and existing evaluators are in `apps/api/src/evaluators/`. Read the existing ones before writing a new one.

---

## Contributing

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 10+ (`npm install -g pnpm`)
- [Git](https://git-scm.com)

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/2026spring_41class_team7.git
cd 2026spring_41class_team7
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# API
cp apps/api/.env.example apps/api/.env.local

# Edit both files and fill in your Supabase URL + anon key
```

### 4. Run in development

**Everything (web + API):**

```bash
pnpm dev
```

**CLI only (watch mode):**

```bash
pnpm --filter jobclaw dev
```

**Web only:**

```bash
pnpm --filter @jobclaw/web dev
```

**API only:**

```bash
pnpm --filter @jobclaw/api dev
```

### 5. Build

```bash
pnpm build
```

### 6. Typecheck + lint

```bash
pnpm typecheck
pnpm lint
```

---

## Development workflow

1. Create a branch: `git checkout -b feat/your-feature`
2. Make your changes and run `pnpm typecheck` to verify
3. Commit with a clear message: `git commit -m "feat: add X"`
4. Open a pull request against `main`

Keep PRs focused — one feature or fix per PR. If you're unsure about scope, open an issue first.

---

## Architecture notes

- **CLI** uses [Ink](https://github.com/vadimdemedes/ink) for the terminal UI and renders a terracotta gradient `JOBCLAW` logo on startup.
- **API** is a [Hono](https://hono.dev) server with [Prisma](https://prisma.io) for the database and Supabase for auth token verification.
- **Web** is a Next.js App Router app with Supabase SSR auth via `@supabase/ssr`. Social login (Google, LinkedIn) is handled through Supabase OAuth with a `/auth/callback` exchange route.
- Auth state is bridged from Supabase sessions to the API client and RevenueCat via `SupabaseAuthBridge`.

---

## License

MIT
