import { exec, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import * as gitignoreParser from "gitignore-parser";
import prompts from "prompts";
import * as color from "./colors.js";
import {
  copyFolderSync,
  getChoices,
  isURL,
  logger,
  onCancel,
  openURL,
  selectProject,
  throwCreateIssueError,
} from "./helpers.js";
import {
  loadSettings,
  SAVED_PROJECTS_FILE,
  saveSettings,
} from "./settings-store.js";
import type { SavedProject } from "./types.js";

const execAsync = promisify(exec);

function logsNoProjectsToOpen(): void {
  logger.error("No projects to open :(");
  console.log(
    color.boldBlue(">>> ") +
      `cd to a project directory and run ${color.yellow(
        "jobclaw projects add",
      )} to add projects and get started`,
  );
}

function logsProjectDoesNotExist(): void {
  logger.error(
    `Project does not exist. Add it using ${color.yellow(
      "jobclaw projects add [projectPath]",
    )} or cd to the project folder and type ${color.yellow("jobclaw projects add")}`,
  );
}

export async function cmdOpen(projectName?: string): Promise<number> {
  const settings = loadSettings();
  if (settings.projects.length === 0) {
    logsNoProjectsToOpen();
    return 1;
  }

  console.log(
    color.boldGrey(">>> Default editor: ") +
      color.grey(settings.commandToOpen),
  );
  const selectedProject = await selectProject(
    projectName,
    "Select project to open",
  );

  if (!selectedProject) {
    logsProjectDoesNotExist();
    return 1;
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
      logger.error("Could not open project for some reason :(");
      throwCreateIssueError(stderr);
      return 1;
    }

    console.log(
      `${color.boldGreen(">>>")} Opening ${selectedProject.name} ${color.green("✔")}`,
    );
    return 0;
  } catch (err) {
    logger.error("Could not open project :(");
    console.warn(
      `Are you sure your editor uses command ${color.yellow(
        commandToOpen,
      )} to open directories from terminal?`,
    );
    console.warn(
      `If not, use ${color.yellow(
        "jobclaw projects seteditor",
      )} to set an editor of your choice`,
    );
    throwCreateIssueError(err);
    return 1;
  }
}

export async function cmdAdd(
  projectDirectory: string,
  urlFlag?: string | true,
): Promise<number> {
  const settings = loadSettings();
  const newProject: SavedProject = { name: "", path: "" };
  let name: string;

  if (urlFlag !== undefined) {
    if (projectDirectory !== ".") {
      console.warn(
        "Project's local directory value will be ignored when --url flag is on",
      );
    }

    let enteredUrl: string | undefined;
    if (urlFlag === true) {
      const r = await prompts(
        [
          {
            type: "text",
            message: "Project URL :",
            name: "enteredUrl",
            initial: "https://github.com/",
            validate: (u: string) => (isURL(u) ? true : "Not a valid URL"),
          },
        ],
        { onCancel },
      );
      enteredUrl = r.enteredUrl as string | undefined;
      name = enteredUrl!.split("/").pop()!;
      newProject.path = enteredUrl!;
    } else {
      if (!isURL(urlFlag)) {
        logger.error("Not a valid URL");
        console.warn(
          "A valid URL looks something like " +
            color.yellow("https://github.com/org/repo"),
        );
        return 1;
      }
      name = urlFlag.split("/").pop()!;
      newProject.path = urlFlag;
    }
  } else {
    newProject.path = path.resolve(projectDirectory);
    name = newProject.path.split(path.sep).pop()!;
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
    logger.error("Project with this name already exists");
    return 1;
  }

  settings.projects.push(newProject);
  saveSettings(settings);
  logger.success("Project Added");
  return 0;
}

export async function cmdRemove(projectName?: string): Promise<number> {
  const settings = loadSettings();
  const selectedProject = await selectProject(
    projectName,
    "Select project to remove",
  );

  if (!selectedProject) {
    logger.error("That project does not exist.");
    console.log(
      `Try ${color.yellow(
        "jobclaw projects remove",
      )} and select the project you want to remove`,
    );
    return 1;
  }

  const selectedProjectName = selectedProject.name;
  settings.projects = settings.projects.filter(
    (project) =>
      project.name.toLowerCase() !== selectedProjectName.toLowerCase(),
  );
  saveSettings(settings);
  logger.success("Project Removed");
  return 0;
}

export async function cmdEdit(): Promise<number> {
  let openSettingsCommand: string;
  if (process.platform === "win32") {
    openSettingsCommand = "Notepad ";
  } else if (process.platform === "linux") {
    openSettingsCommand = "xdg-open ";
  } else {
    openSettingsCommand = "open -t ";
  }

  try {
    const { stderr } = await execAsync(
      `${openSettingsCommand}"${SAVED_PROJECTS_FILE}"`,
    );
    if (stderr) {
      logger.error(
        "Error occurred while opening the file: " + SAVED_PROJECTS_FILE,
      );
      console.log(
        "You can follow the path above and manually edit jobclaw-projects.json",
      );
      throwCreateIssueError(stderr);
      return 1;
    }

    console.log(
      color.boldGreen(">>> ") +
        "Opening jobclaw-projects.json" +
        color.green(" ✔"),
    );
    return 0;
  } catch (err) {
    logger.error(
      "Error occurred while opening the file: " + SAVED_PROJECTS_FILE,
    );
    console.warn(
      "You can follow the path above and manually edit jobclaw-projects.json",
    );
    throwCreateIssueError(err);
    return 1;
  }
}

const editorQuestions = [
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

export async function cmdSetEditor(
  command: string | undefined,
  forProject?: string | true,
): Promise<number> {
  const settings = loadSettings();
  const setEditorFilter = (project: SavedProject) => !isURL(project.path);

  let commandToOpen: string;
  let selectedIndex = -1;

  if (forProject !== undefined) {
    const projectName =
      forProject === true ? undefined : forProject;
    const selectedProject = await selectProject(
      projectName,
      "Select project to set editor for",
      setEditorFilter,
    );
    if (!selectedProject) {
      logsProjectDoesNotExist();
      return 1;
    }
    selectedIndex = settings.projects.findIndex(
      (project) =>
        project.name.toLowerCase() === selectedProject.name.toLowerCase(),
    );
  }

  if (!command) {
    const { selectedEditor } = await prompts(editorQuestions, { onCancel });
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
      const { command: cmd } = await prompts(
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
      commandToOpen = cmd as string;
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

  saveSettings(settings);
  logger.success(
    `Text Editor Selected ${
      selectedIndex < 0 ? "" : `for ${settings.projects[selectedIndex]!.name}`
    }`,
  );
  return 0;
}

export async function cmdRmEditor(
  projectName: string | undefined,
  all: boolean,
): Promise<number> {
  const settings = loadSettings();

  let newSettings: typeof settings;
  if (all) {
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
      logger.error("That project does not exist.");
      console.log(
        `Try ${color.yellow(
          "jobclaw projects rmeditor",
        )} and select the project you want to remove the editor from`,
      );
      return 1;
    }

    const selectedIndex = settings.projects.findIndex(
      (project) =>
        selectedProject.name.toLowerCase() === project.name.toLowerCase(),
    );
    delete settings.projects[selectedIndex]!.editor;
    newSettings = { ...settings };
  }

  saveSettings(newSettings);
  logger.success("TextEditor Removed");
  return 0;
}

export async function cmdGetPath(projectName?: string): Promise<number> {
  const settings = loadSettings();
  if (settings.projects.length === 0) {
    logger.error("No projects to get path :(");
    console.warn(
      `cd to a project directory and run ${color.boldYellow(
        "jobclaw projects add",
      )} to add projects and get started`,
    );
    return 1;
  }

  let selectedProject: SavedProject | undefined;
  if (!projectName) {
    const question = {
      name: "selectedProject",
      message: "Select project you want to cd to:",
      type: "autocomplete" as const,
      stdout: process.stderr,
      choices: getChoices(settings),
      onRender: () => {
        process.stderr.write("\x1Bc");
      },
    };

    const result = await prompts([question], { onCancel });
    selectedProject = result.selectedProject as SavedProject | undefined;
    if (!selectedProject) {
      logger.error(
        `Project does not exist. Add it using ${color.yellow(
          "jobclaw projects add [projectPath]",
        )} or cd to the project folder and type ${color.yellow("jobclaw projects add")}`,
      );
      return 1;
    }
  } else {
    selectedProject = settings.projects.find(
      (project) => project.name.toLowerCase() === projectName.toLowerCase(),
    );
  }

  if (!selectedProject) {
    logsProjectDoesNotExist();
    return 1;
  }

  console.log(selectedProject.path);
  return 0;
}

function spawnExitCode(
  cmd: string,
  args: string[],
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (signal) resolve(1);
      else resolve(code ?? 1);
    });
  });
}

export async function cmdCreate(projectName?: string): Promise<number> {
  const settings = loadSettings();
  if (settings.projects.length === 0) {
    logger.error("No projects to use as a template :(");
    console.warn(
      `cd to a project directory and run ${color.boldYellow(
        "jobclaw projects add",
      )} to add projects and get started`,
    );
    return 1;
  }

  const selectedTemplate = await selectProject(
    undefined,
    "Select starting template",
  );

  if (!selectedTemplate) {
    logsProjectDoesNotExist();
    return 1;
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
    if (!selectedTemplate.path.includes("github.com")) {
      console.error(
        "Currently only github.com URLs can be used to scaffold project",
      );
      return 1;
    }

    const code = await spawnExitCode("git", [
      "clone",
      selectedTemplate.path,
      newProjectDirectory,
    ]);
    if (code === 0) {
      console.log("");
      logger.success(
        `${newProjectDirectoryName} is successfully scaffolded from ${selectedTemplate.path}`,
      );
      return 0;
    }
    console.log("");
    logger.error(
      "Could not scaffold project. Git clone exited with an error. Check output above",
    );
    return 1;
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
  return 0;
}
