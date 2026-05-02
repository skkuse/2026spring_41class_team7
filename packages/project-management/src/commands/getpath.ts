import prompts from "prompts";
import * as color from "../colors.js";
import { getChoices, loadSettings, onCancel } from "../helper.js";
import { logs } from "../logs.js";

export default async function getProjectPath(
  projectName?: string,
): Promise<void> {
  const settings = loadSettings();
  if (settings.projects.length === 0) {
    logs.error("No projects to get path :(");
    console.warn(
      `cd to a project directory and run ${color.boldYellow(
        "projects add",
      )} to add projects and get started`,
    );
    return;
  }

  let selectedProject:
    | { name: string; path: string; editor?: string }
    | undefined;

  if (!projectName) {
    const question = {
      name: "selectedProject",
      message: "Select project you want to cd to:",
      type: "autocomplete" as const,
      stdout: process.stderr,
      choices: getChoices(),
      onRender: () => {
        process.stderr.write("\x1Bc");
      },
    };

    const result = await prompts([question], { onCancel });
    selectedProject = result.selectedProject as typeof selectedProject;
    if (!selectedProject) {
      logs.error(
        `Project does not exist. Add it using ${color.yellow(
          "projects add [projectPath]",
        )} or cd to the project folder and type ${color.yellow("projects add")}`,
      );
      return;
    }
  } else {
    selectedProject = settings.projects.find(
      (project) => project.name.toLowerCase() === projectName.toLowerCase(),
    );
  }

  if (!selectedProject) {
    logs.projectDoesNotExist();
    return;
  }

  console.log(selectedProject.path);
}
