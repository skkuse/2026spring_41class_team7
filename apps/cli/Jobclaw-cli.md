# Jobclaw CLI

Jobclaw is a command-line tool that profiles your repository: dependency and skill signals, server-driven code evaluation, and optional public publishing on [jobclaw.fyi](https://jobclaw.fyi).

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
jobclaw scan
```

Or use `npx jobclaw <command>` from the repo root (uses the local workspace binary).

---

## `npx jobclaw init`

Sets up everything Jobclaw needs before `scan` or `publish`.

- **Legal** — Accept the **Terms of Service** and **Privacy Policy** in the TTY UI first.
- **OpenAI** — You **bring your own API key**. Init prints official OpenAI links (quickstart, authentication, API keys page, help article), then prompts you to **paste the key**. It is stored in **`~/.jobclaw/secrets.json`** (file mode `600`). You can also set **`OPENAI_API_KEY`** in the environment; env wins over the file.

**`~/.jobclaw/config.json`** records init flags (e.g. legal acceptance, publish count). Refusal at the legal step blocks setup; you can press Enter to skip pasting a key and add it later (doctor will show what is missing).

---

## `npx jobclaw scan`

Analyzes the current repository and produces structured results for publishing or review.

### Repository timeline

- Reads the local **`.git`** history (commit log) to infer **project start** and **end** dates (e.g. first and latest meaningful commits).

### Agent 1 — Dependencies, skills, and libraries

- Scans **package manager manifests** (non-exhaustive examples):
  - Node.js: `package.json`, lockfiles as needed
  - Rust: `Cargo.toml` / `Cargo.lock`
  - (Additional ecosystems can follow the same pattern.)
- Produces a **JSON** artifact:

```json
{
  "skills": [],
  "libraries": []
}
```

- **`libraries`** — Identified packages / crates / deps from those files.
- **`skills`** — Inferred skills and libraries *in use* (frameworks, major stacks, tooling) derived from those manifests and project context.

### Agent 2 — Server prompt and scoring

- Fetches an **evaluation prompt** from the **Jobclaw server** (criteria and rubric for this run).
- Feeds the **source tree** (or configured roots) together with that prompt to the agent.
- Returns **scores** aligned with the prompt and a **checklist** of criteria marked **done** / **not done**, expressed as **JSON** suitable for CLI output and for `publish`.

---

## `npx jobclaw publish`

- Takes the **results from `jobclaw scan`** (and any required metadata) and makes the project **public** on Jobclaw.
- After a successful publish, the CLI prints the public URL:

  **`https://jobclaw.fyi/{github-username}/{repo-name}`**

- **Usage limit** — After **5** successful publishes (per account or per billing identity—exact scope defined by the product), the CLI **prompts the user to subscribe** to continue publishing; further publishes are blocked until subscription is active.

---

## `npx jobclaw doctor`

- Inspects the local Jobclaw configuration created by **`init`**.
- Reports **what is missing or invalid** (e.g. missing OpenAI setup, unchecked legal acceptance) so you can fix issues before `scan` or `publish`.

---

## `jobclaw pm` / `jobclaw projects` (ProjectMan)

Jobclaw runs **ProjectMan** from this monorepo: **`packages/projectman/`** (vendored MIT sources, originally from [saurabhdaware/projectman](https://github.com/saurabhdaware/projectman)). The jobclaw package depends on it via `workspace:*`. ProjectMan bookmarking and opening favorite directories pairs well with `jobclaw scan` when you rotate through repos for AI evaluation.

**Project list file:** `~/.jobclaw/jobclaw-projects.json` (not upstream’s `~/.projectman/settings.json`). `jobclaw pm edit` opens this file.

**Examples** (same CLI surface as upstream `pm`):

```bash
cd /path/to/repo && jobclaw pm add
jobclaw pm open
cd "$(jobclaw pm getpath)"
```

- **Upstream reference:** [github.com/saurabhdaware/projectman](https://github.com/saurabhdaware/projectman) (compare when updating the vendored tree)

Aliases: `jobclaw pm`, `jobclaw projectman`, and `jobclaw projects` all invoke ProjectMan with the remaining arguments.

---

## Command summary

| Command              | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `init`               | OpenAI API key, terms & privacy acceptance                              |
| `scan`               | Git timeline + two agents (deps/skills JSON + server-eval checklist)   |
| `publish`            | Push scan results public; show jobclaw.fyi URL; 5-free-then-subscribe   |
| `doctor`             | Validate `init` configuration and surface gaps                          |
| `pm` / `projects`    | Run vendored ProjectMan in `packages/projectman` (workspace dependency) |
