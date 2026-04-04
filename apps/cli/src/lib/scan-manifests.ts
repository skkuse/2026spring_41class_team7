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

const SKILL_HINTS: [RegExp, string][] = [
  [/^(react|react-dom)$/i, "React"],
  [/^(next)$/i, "Next.js"],
  [/^(vue)$/i, "Vue"],
  [/^(svelte)$/i, "Svelte"],
  [/^(hono|express|fastify|koa)$/i, "HTTP APIs"],
  [/^(typescript|@types\/)/i, "TypeScript"],
  [/^(eslint|prettier|biome)/i, "Linting & formatting"],
  [/^(vitest|jest|mocha|playwright|cypress)/i, "Testing"],
  [/^(prisma|drizzle|typeorm|sequelize)/i, "Databases / ORM"],
  [/^(tailwindcss|@tailwindcss)/i, "Tailwind CSS"],
  [/^(turbo|nx|lerna)/i, "Monorepo tooling"],
];

function inferSkillsFromPackageNames(names: Iterable<string>): string[] {
  const skills = new Set<string>();
  for (const name of names) {
    const base = name.split("/")[0]?.replace(/^@[^/]+\//, "") ?? name;
    for (const [re, label] of SKILL_HINTS) {
      if (re.test(base)) skills.add(label);
    }
  }
  return [...skills].sort();
}

function collectDeps(obj: Record<string, unknown> | undefined): string[] {
  if (!obj || typeof obj !== "object") return [];
  return Object.keys(obj as Record<string, string>).sort();
}

async function parsePackageJson(filePath: string): Promise<{
  libraries: string[];
}> {
  const raw = await readFile(filePath, "utf8");
  const pkg = JSON.parse(raw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  const libraries = new Set<string>();
  for (const n of collectDeps(pkg.dependencies)) libraries.add(n);
  for (const n of collectDeps(pkg.devDependencies)) libraries.add(n);
  for (const n of collectDeps(pkg.peerDependencies)) libraries.add(n);
  return { libraries: [...libraries] };
}

async function parseCargoToml(filePath: string): Promise<{ libraries: string[] }> {
  const raw = await readFile(filePath, "utf8");
  const libraries = new Set<string>();
  let section = "";
  for (const line of raw.split("\n")) {
    const sec = line.match(/^\[([^\]]+)\]/);
    if (sec) {
      section = sec[1];
      continue;
    }
    if (!/dependencies/.test(section)) continue;
    const m = line.match(/^([A-Za-z0-9_-]+)\s*=/);
    if (m) libraries.add(m[1]);
  }
  return { libraries: [...libraries].sort() };
}

async function walk(
  dir: string,
  out: { packageJson: string[]; cargoToml: string[] },
  depth: number,
): Promise<void> {
  if (depth > 8) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".")) {
      if (ent.name !== ".") continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(full, out, depth + 1);
    } else if (ent.name === "package.json") {
      out.packageJson.push(full);
    } else if (ent.name === "Cargo.toml") {
      out.cargoToml.push(full);
    }
  }
}

export type Agent1Result = {
  skills: string[];
  libraries: string[];
  manifests: { packageJson: string[]; cargoToml: string[] };
};

export async function runAgent1ManifestScan(repoRoot: string): Promise<Agent1Result> {
  const manifests = { packageJson: [] as string[], cargoToml: [] as string[] };
  await walk(repoRoot, manifests, 0);

  const libraries = new Set<string>();
  for (const p of manifests.packageJson) {
    try {
      const { libraries: libs } = await parsePackageJson(p);
      libs.forEach((x) => libraries.add(x));
    } catch {
      /* ignore malformed */
    }
  }
  for (const p of manifests.cargoToml) {
    try {
      const { libraries: libs } = await parseCargoToml(p);
      libs.forEach((x) => libraries.add(x));
    } catch {
      /* ignore */
    }
  }

  const libsSorted = [...libraries].sort();
  return {
    skills: inferSkillsFromPackageNames(libsSorted),
    libraries: libsSorted,
    manifests,
  };
}
