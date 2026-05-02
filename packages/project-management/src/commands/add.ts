import path from "node:path";
import prompts from "prompts";
import * as color from "../colors.js";
import {
  isURL,
  loadSettings,
  onCancel,
  writeSettings,
} from "../helper.js";
import { logs } from "../logs.js";
import type { Project } from "../types.js";

type UrlOption = string | true | undefined;

export default async function addProject(
  projectDirectory = ".",
  cmdObj?: { url?: UrlOption },
): Promise<void> {
  const settings = loadSettings();
  const newProject = {} as Project;
  let name: string;

  if (cmdObj?.url) {
    if (projectDirectory !== ".") {
      console.warn(
        "Project's local directory value will be ignored when --url flag is on",
      );
    }

    if (cmdObj.url === true) {
      const r = await prompts(
        [
          {
            type: "text",
            message: "Project URL :",
            name: "enteredUrl",
            initial: "https://",
            validate: (url: string) => (isURL(url) ? true : "Not a valid URL"),
          },
        ],
        { onCancel },
      );
      const enteredUrl = r.enteredUrl as string;
      name = enteredUrl.split("/").filter(Boolean).pop() ?? "project";
      newProject.path = enteredUrl;
    } else {
      if (!isURL(cmdObj.url)) {
        logs.error("Not a valid URL");
        console.warn(
          "Use an absolute URL such as " +
            color.yellow("https://example.com/org/repo"),
        );
        return;
      }
      name =
        cmdObj.url.split("/").filter(Boolean).pop() ?? "project";
      newProject.path = cmdObj.url;
    }
  } else {
    newProject.path = path.resolve(projectDirectory);
    name = newProject.path.split(path.sep).pop() ?? "project";
  }

  const r2 = await prompts(
    [
      {
        type: "text",
        message: "Project Name :",
        name: "finalName",
        initial: name,
      },
    ],
    { onCancel },
  );
  newProject.name = r2.finalName as string;

  if (
    settings.projects.some(
      (project) =>
        project.name.toLowerCase() === newProject.name.toLowerCase(),
    )
  ) {
    logs.error("Project with this name already exists");
    return;
  }

  settings.projects.push(newProject);
  writeSettings(settings, "add", "Project Added");
}
