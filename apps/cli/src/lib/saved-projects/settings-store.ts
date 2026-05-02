import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { SavedProjectsSettings } from "./types.js";

const SETTINGS_DIR = path.join(os.homedir(), ".jobclaw");

export const SAVED_PROJECTS_FILE = path.join(
  SETTINGS_DIR,
  "jobclaw-projects.json",
);

const DEFAULT_SETTINGS: SavedProjectsSettings = {
  commandToOpen:
    process.platform === "darwin"
      ? 'open -a "/Applications/Visual Studio Code.app"'
      : "code",
  projects: [],
};

export function loadSettings(): SavedProjectsSettings {
  try {
    const raw = fs.readFileSync(SAVED_PROJECTS_FILE, "utf8");
    return JSON.parse(raw) as SavedProjectsSettings;
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? String((err as NodeJS.ErrnoException).code) : "";
    if (code === "ENOENT" || code === "MODULE_NOT_FOUND") {
      if (!fs.existsSync(SETTINGS_DIR)) {
        fs.mkdirSync(SETTINGS_DIR, { recursive: true });
      }
      fs.writeFileSync(
        SAVED_PROJECTS_FILE,
        JSON.stringify(DEFAULT_SETTINGS, null, 4),
        "utf8",
      );
      return { ...DEFAULT_SETTINGS, projects: [...DEFAULT_SETTINGS.projects] };
    }
    throw err;
  }
}

export function saveSettings(data: SavedProjectsSettings): void {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
  fs.writeFileSync(
    SAVED_PROJECTS_FILE,
    JSON.stringify(data, null, 2),
    "utf8",
  );
}
