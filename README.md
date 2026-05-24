# Jobclaw

**Prove you're a real developer — not just a vibe coder.**

Jobclaw analyzes your code and generates an AI-powered assessment that measures actual engineering skill. Connect your GitHub, run the CLI, and publish a verifiable technical profile that goes beyond a résumé.

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
