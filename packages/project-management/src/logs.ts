import * as color from "./colors.js";
import { throwCreateIssueError } from "./logger.js";

const error = (message: string) => {
  console.error(color.boldRed(">>>"), message);
};

const warn = (message: string) => {
  console.warn(color.boldYellow(">>>"), message);
};

const info = (message: string) => {
  console.log(color.boldBlue(">>>"), message);
};

const noProjectsToOpen = () => {
  error("No projects to open :(");
  info(
    `cd to a project directory and run ${color.yellow(
      "projects add",
    )} to add projects and get started`,
  );
};

const projectDoesNotExist = () => {
  error(
    `Project does not exist. Add it using ${color.yellow(
      "projects add [projectPath]",
    )} or cd to the project folder and type ${color.yellow("projects add")}`,
  );
};

const unknownError = (stderr: unknown) => {
  error("Something went wrong :(");
  throwCreateIssueError(stderr);
};

export const logs = {
  noProjectsToOpen,
  projectDoesNotExist,
  unknownError,
  error,
  warn,
};
