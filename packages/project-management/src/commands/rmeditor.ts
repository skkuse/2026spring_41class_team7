import * as color from "../colors.js";
import { loadSettings, selectProject, writeSettings } from "../helper.js";
import { logs } from "../logs.js";

export default async function rmEditor(
  projectName: string | undefined,
  cmdObj?: { all?: boolean },
): Promise<void> {
  const settings = loadSettings();

  let newSettings: typeof settings;
  if (cmdObj?.all) {
    newSettings = {
      ...settings,
      projects: settings.projects.map((project) => {
        const copy = { ...project };
        if (copy.editor) delete copy.editor;
        return copy;
      }),
    };
  } else {
    console.log(
      color.boldGrey(">>> Default editor: ") +
        color.grey(settings.commandToOpen),
    );
    const selectedProject = await selectProject(
      projectName,
      "Select project to remove editor from",
    );
    if (!selectedProject) {
      logs.error("That project does not exist.");
      console.log(
        `Try ${color.yellow(
          "projects rmeditor",
        )} and select the project you want to remove the editor from`,
      );
      return;
    }

    const selectedIndex = settings.projects.findIndex(
      (project) =>
        selectedProject.name.toLowerCase() === project.name.toLowerCase(),
    );
    delete settings.projects[selectedIndex]!.editor;
    newSettings = { ...settings };
  }

  writeSettings(newSettings, "rmeditor", "TextEditor Removed");
}
