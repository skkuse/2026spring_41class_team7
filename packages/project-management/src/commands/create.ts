import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as gitignoreParser from "gitignore-parser";
import prompts from "prompts";
import * as color from "../colors.js";
import {
  copyFolderSync,
  isURL,
  loadSettings,
  onCancel,
  selectProject,
} from "../helper.js";
import { logger } from "../logger.js";
import { logs } from "../logs.js";

function spawnExitCode(cmd: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (signal) resolve(1);
      else resolve(code ?? 1);
    });
  });
}

export default async function createProject(
  projectName?: string,
): Promise<void> {
  const settings = loadSettings();
  if (settings.projects.length === 0) {
    logs.error("No template projects saved :(");
    console.warn(
      `cd to a project directory and run ${color.boldYellow(
        "projects add",
      )} to add projects and get started`,
    );
    return;
  }

  const selectedTemplate = await selectProject(
    undefined,
    "Select starting template",
  );

  if (!selectedTemplate) {
    logs.error(
      `Project does not exist. Add it using ${color.yellow(
        "projects add [projectPath]",
      )} or cd to the project folder and type ${color.yellow("projects add")}`,
    );
    return;
  }

  let name = projectName;
  if (!name) {
    const r = await prompts(
      [
        {
          type: "text",
          message: "Project Name:",
          name: "projectName",
          initial: "",
          validate: (val: string) => !!val,
        },
      ],
      { onCancel },
    );
    name = r.projectName as string;
  }

  const newProjectDirectoryName = name!.toLowerCase().replace(/ /g, "-");
  const newProjectDirectory = path.join(process.cwd(), newProjectDirectoryName);

  if (isURL(selectedTemplate.path)) {
    const code = await spawnExitCode("git", [
      "clone",
      selectedTemplate.path,
      newProjectDirectory,
    ]);
    if (code === 0) {
      console.log("");
      logger.success(
        `${newProjectDirectoryName} scaffolded from ${selectedTemplate.path}`,
      );
      return;
    }
    console.log("");
    logger.error(
      "Clone failed. Check the output above.",
    );
    return;
  }

  let gitignoreContent = ".git/\n";
  const gitignorePath = path.join(selectedTemplate.path, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  }

  const gitignore = gitignoreParser.compile(gitignoreContent);
  copyFolderSync(
    selectedTemplate.path,
    newProjectDirectory,
    gitignore,
    true,
    selectedTemplate.path,
  );
}
