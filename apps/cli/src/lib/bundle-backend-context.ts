import { readFile } from "node:fs/promises";
import path from "node:path";
import { readdir } from "node:fs/promises";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "target",
  ".turbo",
  ".jobclaw",
  "coverage",
]);

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".prisma",
  ".yml",
  ".yaml",
]);

/** Prefer backend-relevant paths so the model sees routes & schema before misc files. */
function pathPriority(rel: string): number {
  let s = 0;
  const lower = rel.toLowerCase();
  if (lower.endsWith("schema.prisma")) s += 120;
  if (lower.endsWith(".prisma")) s += 80;
  if (lower.endsWith("package.json")) s += 45;
  if (lower.includes("/routes/") || lower.includes("\\routes\\")) s += 35;
  if (lower.includes("openapi") || lower.includes("swagger")) s += 30;
  if (lower.includes("schema") && lower.endsWith(".ts")) s += 25;
  if (lower.includes("middleware")) s += 22;
  if (lower.includes("/src/") || lower.includes("\\src\\")) s += 10;
  if (lower.includes("prisma")) s += 15;
  return s;
}

const MAX_FILES = 90;
const MAX_CHARS_PER_FILE = 6_000;
const MAX_TOTAL_CHARS = 110_000;

function isTextFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return TEXT_EXT.has(ext);
}

async function walkFiles(dir: string, depth: number, acc: string[]): Promise<void> {
  if (depth > 8) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".") && ent.name !== ".") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walkFiles(full, depth + 1, acc);
    } else if (ent.isFile() && isTextFile(ent.name)) {
      acc.push(full);
    }
  }
}

function sortByPriority(repoRoot: string, files: string[]): string[] {
  return [...files].sort((a, b) => {
    const ra = path.relative(repoRoot, a) || a;
    const rb = path.relative(repoRoot, b) || b;
    const pa = pathPriority(ra);
    const pb = pathPriority(rb);
    if (pb !== pa) return pb - pa;
    return ra.localeCompare(rb);
  });
}

/**
 * Bundles text sources under repoRoot for LLM assessment (OpenAPI, Zod, middleware, Prisma).
 * Higher-priority paths are included first; total size is capped.
 */
export async function bundleBackendAssessmentContext(repoRoot: string): Promise<string> {
  const resolved = path.resolve(repoRoot);
  const raw: string[] = [];
  await walkFiles(resolved, 0, raw);
  const files = sortByPriority(resolved, raw).slice(0, MAX_FILES);

  const parts: string[] = [];
  let total = 0;
  for (const file of files) {
    if (total >= MAX_TOTAL_CHARS) break;
    const rel = path.relative(resolved, file) || file;
    let body: string;
    try {
      body = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const slice = body.slice(0, MAX_CHARS_PER_FILE);
    const chunk = `--- ${rel} ---\n${slice}${body.length > MAX_CHARS_PER_FILE ? "\n…(truncated)\n" : ""}`;
    if (total + chunk.length > MAX_TOTAL_CHARS) break;
    parts.push(chunk);
    total += chunk.length;
  }
  return parts.join("\n\n");
}
