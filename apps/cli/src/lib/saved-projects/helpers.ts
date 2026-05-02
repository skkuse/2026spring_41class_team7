import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import prompts, { type PromptObject } from "prompts";
import * as color from "./colors.js";
import { loadSettings } from "./settings-store.js";
import type { SavedProject, SavedProjectsSettings } from "./types.js";

const execAsync = promisify(exec);

export const logger = {
  error: (message: string) =>
    console.log(color.boldRed(">>> ") + message),
  warn: (message: string) =>
    console.log(color.boldYellow(">>> ") + message),
  success: (message: string) =>
    console.log(color.boldGreen(">>> ") + message + " ✔"),
};

export function throwCreateIssueError(err: unknown): void {
  logger.error(
    "If this looks like a bug, report it with the log below.",
  );
  console.log(color.boldRed("Err:"));
  console.log(err);
}

export function isURL(str: string): boolean {
  const regex =
    /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return regex.test(str);
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

export const onCancel = (): boolean => {
  logger.error("See ya ('__') /");
  process.exit(0);
  return false;
};

function suggestFilter(input: string, choices: { title: string }[]) {
  return Promise.resolve(
    choices.filter((choice) =>
      choice.title.toLowerCase().includes(input.toLowerCase()),
    ),
  );
}

export type ProjectChoiceValue = {
  name: string;
  path: string;
  editor?: string;
};

export function getChoices(
  settings: SavedProjectsSettings,
  customFilter: (p: SavedProject) => boolean = () => true,
) {
  const projects = [...settings.projects];
  return projects.filter(customFilter).map((project) => {
    const { name, path: projectPath, editor } = project;
    let title = name;
    const value: ProjectChoiceValue = { name, path: projectPath };
    if (editor && editor !== settings.commandToOpen) {
      title += color.grey(
        ` (${color.boldGrey("editor:")} ${color.grey(editor + ")")}`,
      );
      value.editor = editor;
    }
    if (isURL(projectPath)) {
      title += color.boldGrey(" (URL)");
    }
    return {
      title,
      value,
      description: isURL(projectPath) ? projectPath : undefined,
    };
  });
}

export async function selectProject(
  projectName: string | undefined,
  message: string,
  customFilter: (p: SavedProject) => boolean = () => true,
): Promise<ProjectChoiceValue | undefined> {
  const settings = loadSettings();
  if (!projectName) {
    const questions: PromptObject[] = [
      {
        type: "autocomplete",
        message: `${message}: `,
        name: "selectedProject",
        choices: getChoices(settings, customFilter),
        limit: 40,
        suggest: suggestFilter,
      },
    ];
    const result = await prompts(questions, { onCancel });
    return result.selectedProject as ProjectChoiceValue | undefined;
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
      copyFolderSync(fromElement, toElement, gitignore, ignoreEmptyDirs, basePath);
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
