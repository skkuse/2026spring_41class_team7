import * as color from "./colors.js";

export const logger = {
  error: (message: string) => console.log(color.boldRed(">>> ") + message),
  warn: (message: string) => console.log(color.boldYellow(">>> ") + message),
  success: (message: string) =>
    console.log(color.boldGreen(">>> ") + message + " ✔"),
};

export function throwCreateIssueError(err: unknown): void {
  logger.error("Error details follow.");
  console.log(color.boldRed("Err:"));
  console.log(err);
}
