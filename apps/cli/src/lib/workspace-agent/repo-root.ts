import path from "node:path";

/**
 * Repository root for CLI-style tools: optional directory argument, otherwise `cwd`.
 * Passing an empty or whitespace-only string behaves like “no argument” (returns resolved cwd).
 */
export function resolveRepoRoot(cwd: string, explicitDirectory?: string): string {
  const c = path.resolve(cwd);
  if (explicitDirectory == null || !String(explicitDirectory).trim()) {
    return c;
  }
  return path.resolve(c, String(explicitDirectory).trim());
}

export type ParsedAssessArgv = {
  repoRoot: string;
  model?: string;
  jsonOnly: boolean;
  help: boolean;
  outPath?: string;
};

/**
 * Parses argv after `jobclaw assess` (same rules as before refactor).
 * Positional directory wins last if multiple (unlikely).
 */
export function parseAssessCommandArgv(cwd: string, argv: string[]): ParsedAssessArgv {
  let repoRoot = path.resolve(cwd);
  let model: string | undefined;
  let jsonOnly = false;
  let help = false;
  let outPath: string | undefined;
  const rest = [...argv];
  while (rest.length > 0) {
    const a = rest.shift()!;
    if (a === "--model" && rest[0]) {
      model = rest.shift();
      continue;
    }
    if (a === "--out" && rest[0]) {
      outPath = path.resolve(cwd, rest.shift()!);
      continue;
    }
    if (a === "--json") {
      jsonOnly = true;
      continue;
    }
    if (a === "-h" || a === "--help") {
      help = true;
      continue;
    }
    if (a.startsWith("-")) {
      continue;
    }
    repoRoot = path.resolve(cwd, a);
  }
  return { repoRoot, model, jsonOnly, help, outPath };
}
