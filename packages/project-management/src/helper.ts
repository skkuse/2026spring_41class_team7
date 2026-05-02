import { exec } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { Command } from "commander";
import didYouMean from "didyoumean";
import type { PromptObject } from "prompts";
import prompts from "prompts";
import * as color from "./colors.js";
import { logger, throwCreateIssueError } from "./logger.js";
import type { Project, ProjectChoice, Settings } from "./types.js";

const execAsync = promisify(exec);

const DEFAULT_SETTINGS: Settings = {
  commandToOpen:
    process.platform === "darwin"
      ? 'open -a "/Applications/Visual Studio Code.app"'
      : "code",
  projects: [],
};

const SETTINGS_DIR_PATH = path.join(os.homedir(), ".jobclaw");
export const SETTINGS_PATH = path.join(SETTINGS_DIR_PATH, "jobclaw-projects.json");

export function loadSettings(): Settings {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as Settings;
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as NodeJS.ErrnoException).code)
        : "";
    if (code === "ENOENT" || code === "MODULE_NOT_FOUND") {
      if (!fs.existsSync(SETTINGS_DIR_PATH)) {
        fs.mkdirSync(SETTINGS_DIR_PATH, { recursive: true });
      }
      fs.writeFileSync(
        SETTINGS_PATH,
        JSON.stringify(DEFAULT_SETTINGS, null, 4),
        "utf8",
      );
      return {
        commandToOpen: DEFAULT_SETTINGS.commandToOpen,
        projects: [...DEFAULT_SETTINGS.projects],
      };
    }
    throw err;
  }
}

export function writeSettings(
  data: Settings,
  command = "<command>",
  successMessage = "Settings updated :D",
): void {
  try {
    if (!fs.existsSync(SETTINGS_DIR_PATH)) {
      fs.mkdirSync(SETTINGS_DIR_PATH, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), "utf8");
    logger.success(successMessage);
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as NodeJS.ErrnoException).code)
        : "";
    if (code === "EACCES") {
      const errCmd =
        process.platform === "win32"
          ? "an admin"
          : `a super user ${color.boldYellow(`sudo projects ${command}`)}`;
      logger.error(`Access Denied! please try again as ${errCmd}`);
      return;
    }
    throwCreateIssueError(err);
  }
}

export async function openURL(url: string): Promise<string | undefined> {
  let stderr: string | undefined;
  switch (process.platform) {
    case "darwin":
      ({ stderr } = await execAsync(`open ${url}`));
      break;
    case "win32":
      ({ stderr } = await execAsync(`start ${url}`));
      break;
    default:
      ({ stderr } = await execAsync(`xdg-open ${url}`));
  }
  if (stderr) console.log(stderr);
  return stderr;
}

export function isURL(str: string): boolean {
  const regex =
    /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return regex.test(str);
}

function suggestFilter<T extends { title: string }>(
  input: string,
  choices: T[],
) {
  return Promise.resolve(
    choices.filter((choice) =>
      choice.title.toLowerCase().includes(input.toLowerCase()),
    ),
  );
}

export function suggestCommands(cmd: string, program: Command): void {
  const names = program.commands.map((c) => c.name());
  const suggestion = didYouMean(cmd, names);
  if (suggestion) {
    console.log();
    console.log(`Did you mean ${suggestion}?`);
  }
}

export const onCancel = (): boolean => {
  logger.error("See ya ('__') /");
  process.exit(0);
  return false;
};

type ChoiceRow = {
  title: string;
  value: ProjectChoice;
  description?: string;
};

export function getChoices(
  customFilter: (p: Project) => boolean = () => true,
): ChoiceRow[] {
  const settings = loadSettings();
  const projects = [...settings.projects];
  return projects.filter(customFilter).map((project) => {
    const { name, path: projectPath, editor } = project;
    let title = name;
    const value: ProjectChoice = { name, path: projectPath };
    if (editor && editor !== settings.commandToOpen) {
      title += color.grey(
        ` (${color.boldGrey("editor:")} ${color.grey(editor + ")")}`,
      );
      value.editor = editor;
    }
    if (isURL(projectPath)) {
      title += color.boldGrey(" (URL)");
    }
    const row: ChoiceRow = {
      title,
      value,
    };
    if (isURL(projectPath)) {
      row.description = projectPath;
    }
    return row;
  });
}

export async function selectProject(
  projectName: string | undefined,
  message: string,
  customFilter: (p: Project) => boolean = () => true,
): Promise<ProjectChoice | undefined> {
  const settings = loadSettings();
  if (!projectName) {
    const questions: PromptObject[] = [
      {
        type: "autocomplete",
        message: `${message}: `,
        name: "selectedProject",
        choices: getChoices(customFilter),
        limit: 40,
        suggest: suggestFilter,
      },
    ];
    const result = await prompts(questions, { onCancel });
    return result.selectedProject as ProjectChoice | undefined;
  }
  return settings.projects.find(
    (project) => project.name.toLowerCase() === projectName.toLowerCase(),
  );
}

export function createPathIfAbsent(pathToCreate: string): void {
  pathToCreate.split(path.sep).reduce((prevPath, folder) => {
    const currentPath = path.join(prevPath, folder, path.sep);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }, "");
}

function isGitIgnored(
  filePath: string,
  basePath: string,
  gitignore: { denies: (p: string) => boolean },
): boolean {
  return gitignore.denies(path.relative(basePath, filePath));
}

export function copyFolderSync(
  from: string,
  to: string,
  gitignore: { denies: (p: string) => boolean },
  ignoreEmptyDirs = true,
  basePath: string,
): void {
  if (isGitIgnored(from, basePath, gitignore)) {
    return;
  }
  const fromDirectories = fs.readdirSync(from);
  createPathIfAbsent(to);
  for (const element of fromDirectories) {
    const fromElement = path.join(from, element);
    const toElement = path.join(to, element);
    if (fs.lstatSync(fromElement).isFile()) {
      if (!isGitIgnored(fromElement, basePath, gitignore)) {
        fs.copyFileSync(fromElement, toElement);
      }
    } else {
      copyFolderSync(
        fromElement,
        toElement,
        gitignore,
        ignoreEmptyDirs,
        basePath,
      );
      if (fs.existsSync(toElement) && ignoreEmptyDirs) {
        try {
          fs.rmdirSync(toElement);
        } catch (err: unknown) {
          const code =
            err && typeof err === "object" && "code" in err
              ? String((err as NodeJS.ErrnoException).code)
              : "";
          if (code !== "ENOTEMPTY") throw err;
        }
      }
    }
  }
}
