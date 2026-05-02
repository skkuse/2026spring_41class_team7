#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import addProject from "./commands/add.js";
import createProject from "./commands/create.js";
import editConfigurations from "./commands/edit.js";
import getProjectPath from "./commands/getpath.js";
import openProject from "./commands/open.js";
import removeProject from "./commands/remove.js";
import rmEditor from "./commands/rmeditor.js";
import setEditor from "./commands/seteditor.js";
import { suggestCommands } from "./helper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf8"),
) as { version: string };

const program = new Command();

program.name("projects");
program.version(pkg.version);

program
  .command("open [projectName]")
  .alias("o")
  .description("Open one of your saved projects")
  .action(openProject);

program
  .command("create [projectName]")
  .alias("c")
  .description("Create project")
  .action(createProject);

program
  .command("add [projectDirectory]")
  .alias("save")
  .option("-u, --url [link]", "Add a link to a repository to projects")
  .description("Save current directory as a project")
  .action(addProject);

program
  .command("remove [projectName]")
  .description("Remove the project")
  .action(removeProject);

program
  .command("seteditor [commandToOpen]")
  .description("Set text editor to use")
  .option(
    "-f|--for-project [projectName]",
    "set different editor for specific project",
  )
  .action(setEditor);

program
  .command("rmeditor [projectName]")
  .description("Remove text editor to use")
  .option("-a|--all", "remove editors from all projects")
  .action(rmEditor);

program
  .command("edit")
  .description("Edit jobclaw-projects.json (~/.jobclaw/)")
  .action(editConfigurations);

program
  .command("getpath [projectName]")
  .alias("gp")
  .description("Get project path")
  .action(getProjectPath);

program.on("command:*", (operands: string[]) => {
  const cmd = operands[0] ?? "";
  console.log(`Command ${cmd} not found\n`);
  program.outputHelp();
  suggestCommands(cmd, program);
});

program.usage("<command>");

async function main(): Promise<void> {
  if (process.argv.length <= 2) {
    await openProject();
    return;
  }
  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
