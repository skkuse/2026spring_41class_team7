import prompts from "prompts";
import * as color from "../colors.js";
import {
  isURL,
  loadSettings,
  onCancel,
  selectProject,
  writeSettings,
} from "../helper.js";
import type { Project } from "../types.js";

const questions = [
  {
    type: "select" as const,
    message: "Select Project Open Command",
    name: "selectedEditor",
    choices: [
      { title: "code", value: "code" },
      { title: "cursor", value: "cursor" },
      { title: "subl", value: "subl" },
      { title: "atom", value: "atom" },
      { title: "vim", value: "vim" },
      { title: "Other", value: "other" },
    ],
  },
];

export default async function setEditor(
  command: string | undefined,
  cmdObj?: { forProject?: string | boolean },
): Promise<void> {
  const settings = loadSettings();
  const setEditorFilter = (project: Project) => !isURL(project.path);

  let commandToOpen: string;
  let selectedIndex = -1;

  if (cmdObj?.forProject) {
    const projectName =
      cmdObj.forProject === true ? undefined : cmdObj.forProject;
    const selectedProject = await selectProject(
      projectName,
      "Select project to set editor for",
      setEditorFilter,
    );
    if (!selectedProject) {
      return;
    }
    selectedIndex = settings.projects.findIndex(
      (project) =>
        project.name.toLowerCase() === selectedProject.name.toLowerCase(),
    );
  }

  if (!command) {
    const { selectedEditor } = await prompts(questions, { onCancel });
    if (selectedEditor === "other") {
      console.warn("Enter command that you use to open Editor from Terminal");
      console.log(
        `E.g With VSCode Installed, you can type ${color.yellow(
          "code <directory>",
        )} in terminal to open directory`,
      );
      console.log(
        `In this case, the command would be ${color.yellow("code")}\n`,
      );
      const r = await prompts(
        [
          {
            type: "text",
            message: "Enter command :",
            name: "command",
            validate: (val: string) => val !== "",
          },
        ],
        { onCancel },
      );
      commandToOpen = r.command as string;
    } else {
      commandToOpen = selectedEditor as string;
    }
  } else {
    commandToOpen = command;
  }

  if (selectedIndex < 0) {
    settings.commandToOpen = commandToOpen;
  } else {
    settings.projects[selectedIndex]!.editor = commandToOpen;
  }

  writeSettings(
    settings,
    "seteditor",
    `Text Editor Selected ${
      selectedIndex < 0 ? "" : `for ${settings.projects[selectedIndex]!.name}`
    }`,
  );
}
