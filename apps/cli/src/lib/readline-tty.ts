import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

/**
 * Ink uses raw mode on stdin. Readline needs canonical mode and a clean handoff.
 */
export async function restoreStdinAfterInk(): Promise<void> {
  if (stdin.isTTY) {
    try {
      stdin.setRawMode(false);
    } catch {
      /* ignore */
    }
    try {
      stdin.resume();
    } catch {
      /* ignore */
    }
  }
  await new Promise((r) => setTimeout(r, 100));
}

export type CredentialsReadline = {
  rl: ReturnType<typeof createInterface>;
  /** Close readline and destroy /dev/tty streams so Node can exit. */
  dispose: () => void;
};

/**
 * Prefer /dev/tty so prompts are not mixed with Ink’s stdin buffer or listeners.
 * Falls back to process stdio on Windows or when /dev/tty is missing.
 */
export function createCredentialsReadline(): CredentialsReadline {
  if (process.platform !== "win32" && existsSync("/dev/tty")) {
    const input = createReadStream("/dev/tty", { flags: "r" });
    const output = createWriteStream("/dev/tty", { flags: "w" });
    const rl = createInterface({ input, output, terminal: true });
    return {
      rl,
      dispose() {
        rl.close();
        input.destroy();
        output.destroy();
      },
    };
  }
  const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
  });
  return {
    rl,
    dispose() {
      rl.close();
    },
  };
}
