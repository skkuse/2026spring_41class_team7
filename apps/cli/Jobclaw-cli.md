# Jobclaw CLI

Jobclaw is a command-line tool that profiles your repository: dependency and skill signals, server-driven code evaluation, backend assessment, and optional public publishing on [jobclaw.fyi](https://jobclaw.fyi).

Install or run via npm (when published):

```bash
npx jobclaw <command>
```

In this monorepo, after `pnpm install` and `pnpm build` (or `pnpm --filter jobclaw build`):

```bash
pnpm jobclaw <command>
```

From the repo root, `jobclaw` is also on your PATH for this shell session if you run:

```bash
export PATH="$PWD/node_modules/.bin:$PATH"
jobclaw assess
```

Or use `npx jobclaw <command>` from the repo root (uses the local workspace binary).

---

## `npx jobclaw init`

Sets up everything Jobclaw needs before **`assess`** or **`publish`**.

- **Legal** — Accept the **Terms of Service** and **Privacy Policy** in the TTY UI first.
- **OpenAI** — You **bring your own API key**. Init prints official OpenAI links (quickstart, authentication, API keys page, help article), then prompts you to **paste the key**. It is stored in **`~/.jobclaw/secrets.json`** (file mode `600`). You can also set **`OPENAI_API_KEY`** in the environment; env wins over the file.

**`~/.jobclaw/config.json`** records init flags (e.g. legal acceptance, publish count). Refusal at the legal step blocks setup; you can press Enter to skip pasting a key and add it later (doctor will show what is missing).

---

## `npx jobclaw assess`

Runs the full pipeline for a repository (optional **`[path]`**; default is the current directory). Requires a **git** checkout (`.git`).

### Step 1 — Repository scan → `scan-result.json`

Written to **`<repo>/.jobclaw/scan-result.json`**.

- **Timeline** — Reads **`.git`** history for project date range.
- **Agent 1** — Scans package manifests (e.g. `package.json`, `Cargo.toml`) and infers **skills** / **libraries**.
- **Agent 2** — Fetches an **evaluation prompt** from **`JOBCLAW_API_URL`** (default `https://api.jobclaw.fyi/evaluation-prompt`) with a **fallback** if offline; bundles source excerpts and runs the **general** OpenAI evaluation (scores + checklist).

### Step 2 — Backend assessment → `assessments/*.json`

After the scan file is saved, runs the **Node.js backend** rubric (OpenAPI, Zod, rate limits, caching, Prisma) and writes **`<repo>/.jobclaw/assessments/<timestamp>.json`**.

- **Interactive (TTY):** omit **`--type`** to pick **node-backend** from a menu.
- **CI / scripts:** pass **`--type node-backend`** when stdin is not a TTY.
- Optional **`--out`** for Markdown or JSON reports.

---

## `npx jobclaw publish`

- Requires **both** artifacts under the project root:

  - **`scan-result.json`** (from step 1 of **`jobclaw assess`**)
  - Latest **`*.json`** under **`.jobclaw/assessments/`** (from step 2)

- The CLI does **not** upload payloads to this monorepo’s API (`apps/api` has no publish endpoint yet); it records a publish locally and prints the public URL pattern:

  **`https://jobclaw.fyi/{github-username}/{repo-name}`**

- **Usage limit** — After **5** successful publishes (shared with **`publish-scan`**), the CLI prompts for subscription to continue.

## `npx jobclaw publish-scan`

- Records a publish using **only** **`scan-result.json`** (same quota as **`publish`**). That file is produced at the **start** of **`jobclaw assess`** (repo scan step). Use **`publish-scan`** when you want the scan artifact published without an assessment record; use **`publish`** when you have **both** scan and assessment JSON.

---

## `npx jobclaw doctor`

- Inspects the local Jobclaw configuration created by **`init`**.
- Reports **what is missing or invalid** (e.g. missing OpenAI setup, unchecked legal acceptance) so you can fix issues before **`assess`** or **`publish`**.

---

## `jobclaw projects`

Bookmark and open local directories or URLs from the terminal; useful when rotating through repos alongside **`jobclaw assess`**.

**Project list file:** `~/.jobclaw/jobclaw-projects.json`. Run **`jobclaw projects edit`** to open that JSON in your default editor.

**Examples**:

```bash
cd /path/to/repo && jobclaw projects add
jobclaw projects open
cd "$(jobclaw projects getpath)"
```

---

## Command summary

| Command              | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `init`               | OpenAI API key, terms & privacy acceptance                              |
| `assess`             | Repo scan (`scan-result.json`) **then** backend assessment (`assessments/`) |
| `publish`            | Requires **scan + assessment** artifacts; local record + jobclaw.fyi URL |
| `publish-scan`       | **Scan-only** publish record (same quota as `publish`)                   |
| `doctor`             | Validate `init` configuration and surface gaps                          |
| `projects`           | Bookmark & open saved folders or URLs (`~/.jobclaw/jobclaw-projects.json`) |
