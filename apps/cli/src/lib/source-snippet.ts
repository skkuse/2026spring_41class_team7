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
  ".rs",
  ".toml",
  ".yml",
  ".yaml",
]);

const MAX_FILES = 40;
const MAX_CHARS_PER_FILE = 2_500;
const MAX_TOTAL_CHARS = 48_000;

function isTextFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return TEXT_EXT.has(ext);
}

async function walkFiles(dir: string, depth: number, acc: string[]): Promise<void> {
  if (depth > 6 || acc.length >= MAX_FILES) return;
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
      if (acc.length >= MAX_FILES) return;
    } else if (ent.isFile() && isTextFile(ent.name)) {
      acc.push(full);
    }
  }
}

/** Compact tree for the prompt: paths + truncated bodies. */
export async function bundleSourceContext(repoRoot: string): Promise<string> {
  const files: string[] = [];
  await walkFiles(repoRoot, 0, files);
  files.sort();
  const parts: string[] = [];
  let total = 0;
  for (const file of files) {
    if (total >= MAX_TOTAL_CHARS) break;
    const rel = path.relative(repoRoot, file) || file;
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
