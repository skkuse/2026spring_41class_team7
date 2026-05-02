import { spawn } from "node:child_process";
import { createRequire } from "node:module";

function resolveProjectmanBin(): string | null {
  try {
    const require = createRequire(import.meta.url);
    return require.resolve("projectman/bin/index.js");
  } catch {
    return null;
  }
}

/**
 * Runs in-repo ProjectMan (`packages/projectman`): `pm add`, `pm open`, `getpath`, etc.
 * Settings and behavior match upstream; sources live under `packages/projectman/`.
 */
export async function runProjectman(args: string[]): Promise<number> {
  const scriptPath = resolveProjectmanBin();
  if (!scriptPath) {
    console.error(
      "projectman workspace package not linked. From the repo root run: pnpm install",
    );
    return 1;
  }
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: "inherit",
      shell: false,
    });
    child.on("error", (err) => {
      console.error(err.message);
      resolve(1);
    });
    child.on("close", (code, signal) => {
      if (signal) resolve(1);
      else resolve(code ?? 1);
    });
  });
}
