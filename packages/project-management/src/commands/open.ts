import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as color from "../colors.js";
import {
  isURL,
  loadSettings,
  openURL,
  selectProject,
} from "../helper.js";
import { throwCreateIssueError } from "../logger.js";
import { logs } from "../logs.js";

const execAsync = promisify(exec);

export default async function openProject(projectName?: string): Promise<void> {
  const settings = loadSettings();
  if (settings.projects.length === 0) {
    logs.noProjectsToOpen();
    return;
  }

  console.log(
    color.boldGrey(">>> Default editor: ") + color.grey(settings.commandToOpen),
  );
  const selectedProject = await selectProject(
    projectName,
    "Select project to open",
  );

  if (!selectedProject) {
    logs.projectDoesNotExist();
    return;
  }

  const commandToOpen =
    selectedProject.editor ?? settings.commandToOpen;
  try {
    let stderr: string | undefined;
    if (isURL(selectedProject.path)) {
      stderr = await openURL(selectedProject.path);
    } else {
      ({ stderr } = await execAsync(
        `${commandToOpen} "${selectedProject.path}"`,
      ));
    }

    if (stderr) {
      logs.error("Could not open project for some reason :(");
      throwCreateIssueError(stderr);
      return;
    }

    console.log(
      `${color.boldGreen(">>>")} Opening ${selectedProject.name} ${color.green("✔")}`,
    );
  } catch (err) {
    logs.error("Could not open project :(");
    console.warn(
      `Are you sure your editor uses command ${color.yellow(
        commandToOpen,
      )} to open directories from terminal?`,
    );
    console.warn(
      `If not, use ${color.yellow(
        "projects seteditor",
      )} to set Editor/IDE of your choice`,
    );
    throwCreateIssueError(err);
  }
}
