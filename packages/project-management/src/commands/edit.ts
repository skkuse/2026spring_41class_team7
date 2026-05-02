import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as color from "../colors.js";
import { SETTINGS_PATH } from "../helper.js";
import { throwCreateIssueError } from "../logger.js";
import { logs } from "../logs.js";

const execAsync = promisify(exec);

export default async function editConfigurations(): Promise<void> {
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
      `${openSettingsCommand}"${SETTINGS_PATH}"`,
    );
    if (stderr) {
      logs.error("Error occurred while opening the file: " + SETTINGS_PATH);
      console.log(
        "You can open that path manually and edit jobclaw-projects.json",
      );
      throwCreateIssueError(stderr);
      return;
    }

    console.log(
      color.boldGreen(">>> ") +
        "Opening jobclaw-projects.json" +
        color.green(" ✔"),
    );
  } catch (err) {
    logs.error("Error occurred while opening the file: " + SETTINGS_PATH);
    console.warn(
      "You can open that path manually and edit jobclaw-projects.json",
    );
    throwCreateIssueError(err);
  }
}
