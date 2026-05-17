# CLI Auth Flow Design

**Date:** 2026-05-18  
**Scope:** `apps/cli` — GitHub OAuth login/logout via Supabase PKCE browser-redirect flow  
**Out of scope:** Web UI auth, account deletion (web UI only — see note below)

---

## Overview

Users run `jobclaw login` to authenticate with their GitHub account via the existing Supabase project. The session token is stored locally and used by future commands (e.g., `jobclaw publish`) to authenticate requests to the Jobclaw API.

---

## Auth Flow

1. `jobclaw login` generates a PKCE `code_verifier` (random 32 bytes, base64url) and `code_challenge` (SHA-256 of verifier, base64url)
2. CLI finds a free local port and starts an HTTP server at `http://localhost:PORT/callback`
3. CLI opens browser to:
   ```
   https://<SUPABASE_URL>/auth/v1/authorize
     ?provider=github
     &code_challenge=<challenge>
     &code_challenge_method=S256
     &redirect_to=http://localhost:PORT/callback
   ```
4. User completes GitHub OAuth in browser
5. Supabase redirects to `localhost:PORT/callback?code=xxx`
6. CLI exchanges `code` + `code_verifier` via `POST /auth/v1/token?grant_type=pkce`
7. Session saved to `~/.jobclaw/secrets.json`
8. Server shuts down; CLI prints `Logged in as @githubUsername`

**Fallback:** If `open` fails (SSH/headless), print the URL for manual copy-paste.  
**Timeout:** Server closes after 5 minutes with an error message.  
**Already logged in:** Show current user and prompt to re-authenticate or skip.

---

## Components

| File | Purpose |
|---|---|
| `src/lib/pkce.ts` | `generatePKCE()` → `{ verifier, challenge }` using Node `crypto` |
| `src/lib/supabase-config.ts` | `SUPABASE_URL` and `SUPABASE_ANON_KEY` constants (baked in at build) |
| `src/lib/browser-auth.ts` | Local HTTP server, browser open, code exchange via Supabase REST |
| `src/lib/auth-store.ts` | `saveSession()`, `getSession()` (with auto-refresh), `clearSession()` |
| `src/commands/login.tsx` | Ink UI: spinner while waiting, success/error states |
| `src/commands/logout.tsx` | Clears session, prints confirmation |

**CLI dispatcher** (`src/cli.tsx`): adds `login` and `logout` cases.  
**Doctor command** (`src/commands/doctor.tsx`): extended with auth status check.  
**No new npm dependencies** — uses Node built-ins (`crypto`, `http`).

---

## Session Storage

`~/.jobclaw/secrets.json` extended with a `supabaseSession` field:

```json
{
  "openaiApiKey": "sk-...",
  "supabaseSession": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "expiresAt": 1748000000,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "githubUsername": "hskang9"
    }
  }
}
```

`getSession()` auto-refreshes via `POST /auth/v1/token?grant_type=refresh_token` if `expiresAt` is within 60 seconds. Returns `null` if not logged in or refresh fails.

---

## Commands

```
jobclaw login    # GitHub OAuth via browser; stores session
jobclaw logout   # Clears supabaseSession from secrets
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Port already in use | Retry up to 5 times with different ports |
| Browser fails to open | Print URL for manual copy-paste |
| OAuth denied / error param in callback | Show error, exit 1 |
| Timeout (5 min, no callback) | Close server, print timeout message, exit 1 |
| Token exchange fails | Show HTTP error from Supabase, exit 1 |
| Already logged in | Show `Already logged in as @user. Re-authenticate? [y/N]` |

---

## Account Deletion (Web UI — Out of Scope for CLI)

Per GDPR and similar regulations, users must be able to request deletion of their account and all associated data. This must be implemented as a dedicated section in the Jobclaw web UI (e.g., Settings → Danger Zone → Delete Account). The web UI should call a protected API endpoint that:
1. Deletes the user's Supabase Auth account
2. Deletes all associated data (assessments, profile, etc.) from the database

This is a separate work item and is not part of this CLI auth spec.
