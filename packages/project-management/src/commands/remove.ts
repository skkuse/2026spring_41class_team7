import * as color from "../colors.js";
import { loadSettings, selectProject, writeSettings } from "../helper.js";
import { logs } from "../logs.js";

export default async function removeProject(
  projectName?: string,
): Promise<void> {
  const settings = loadSettings();

  const selected = await selectProject(projectName, "Select project to remove");

  if (!selected) {
    logs.error("That project does not exist.");
    console.log(
      `Try ${color.yellow(
        "projects remove",
      )} and select the project you want to remove`,
    );
    return;
  }

  const selectedProjectName = selected.name;
  settings.projects = settings.projects.filter(
    (project) =>
      project.name.toLowerCase() !== selectedProjectName.toLowerCase(),
  );

  writeSettings(settings, "remove", "Project Removed");
}
