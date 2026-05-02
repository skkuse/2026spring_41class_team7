import {
  cmdAdd,
  cmdCreate,
  cmdEdit,
  cmdGetPath,
  cmdOpen,
  cmdRemove,
  cmdRmEditor,
  cmdSetEditor,
} from "./commands.js";

function printProjectsHelp(): void {
  console.log(`Saved project shortcuts (config: ~/.jobclaw/jobclaw-projects.json)

  jobclaw projects              Open a saved folder or URL (pick if omitted)
  jobclaw projects open [name]   Alias: o
  jobclaw projects add [dir]     Alias: save  (options: -u, --url [url])
  jobclaw projects remove [name]
  jobclaw projects getpath [name]   Alias: gp
  jobclaw projects create [name]    Alias: c  (from template project)
  jobclaw projects edit             Edit JSON in your editor
  jobclaw projects seteditor [cmd]   Options: -f, --for-project [name]
  jobclaw projects rmeditor [name]   Options: -a, --all
`);
}

function parseAddArgv(argv: string[]): { dir: string; url?: string | true } {
  let dir = ".";
  let url: string | true | undefined;
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url" || a === "-u") {
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        url = next;
        i++;
      } else {
        url = true;
      }
    } else if (!a.startsWith("-")) {
      positionals.push(a);
    }
  }
  if (positionals[0]) dir = positionals[0];
  return { dir, url };
}

function parseSetEditorArgv(argv: string[]): {
  command?: string;
  forProject?: string | true;
} {
  const rest: string[] = [];
  let forProject: string | true | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-f" || a === "--for-project") {
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        forProject = next;
        i++;
      } else {
        forProject = true;
      }
      continue;
    }
    rest.push(a);
  }
  const command = rest.find((x) => !x.startsWith("-"));
  return { command, forProject };
}

function parseRmEditorArgv(argv: string[]): {
  projectName?: string;
  all: boolean;
} {
  let all = false;
  const rest: string[] = [];
  for (const a of argv) {
    if (a === "-a" || a === "--all") all = true;
    else rest.push(a);
  }
  const projectName = rest.find((x) => !x.startsWith("-"));
  return { projectName, all };
}

/**
 * `jobclaw projects …` — bookmark and open local paths or URLs (same file as prior tooling: ~/.jobclaw/jobclaw-projects.json).
 */
export async function runSavedProjects(args: string[]): Promise<number> {
  if (args.length === 0) {
    return cmdOpen();
  }

  const [sub, ...tail] = args;
  if (sub === "help" || sub === "-h" || sub === "--help") {
    printProjectsHelp();
    return 0;
  }

  switch (sub) {
    case "open":
    case "o":
      return cmdOpen(tail[0]);
    case "add":
    case "save": {
      const { dir, url } = parseAddArgv(tail);
      return cmdAdd(dir, url);
    }
    case "remove":
      return cmdRemove(tail[0]);
    case "edit":
      return cmdEdit();
    case "seteditor": {
      const parsed = parseSetEditorArgv(tail);
      return cmdSetEditor(parsed.command, parsed.forProject);
    }
    case "rmeditor": {
      const { projectName, all } = parseRmEditorArgv(tail);
      return cmdRmEditor(projectName, all);
    }
    case "getpath":
    case "gp":
      return cmdGetPath(tail[0]);
    case "create":
    case "c":
      return cmdCreate(tail[0]);
    default:
      console.error(`Unknown "projects" subcommand: ${sub}\n`);
      printProjectsHelp();
      return 1;
  }
}
