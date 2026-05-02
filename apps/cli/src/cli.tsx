import { Box, render, Text } from "ink";
import { cwd as processCwd } from "node:process";
import Help from "./commands/help.js";
import InitLegal from "./commands/init.js";
import { JobclawFilledLogoStatic } from "./commands/filled-logo.js";
import { runInitCredentialsPrompts } from "./lib/init-credentials.js";
import { restoreStdinAfterInk } from "./lib/readline-tty.js";
import DoctorView from "./commands/doctor.js";
import ScanCommand from "./commands/scan.js";
import PublishCommand from "./commands/publish.js";
import AssessCommand from "./commands/assess.js";
import { loadConfig } from "./lib/config.js";
import { doctorExitCodeFromCfg } from "./lib/doctor-check.js";
import { runProjectman } from "./lib/run-projectman.js";

export async function dispatch(argv: string[]): Promise<void> {
  const [cmd, ...rest] = argv;
  const root = processCwd();

  if (!cmd) {
    const inst = render(<Help showLogo />);
    setImmediate(() => inst.unmount());
    await inst.waitUntilExit();
    return;
  }

  if (cmd === "help" || cmd === "-h" || cmd === "--help") {
    const inst = render(<Help />);
    setImmediate(() => inst.unmount());
    await inst.waitUntilExit();
    return;
  }

  switch (cmd) {
    case "init": {
      if (!process.stdin.isTTY) {
        console.error(
          "jobclaw init requires an interactive terminal (stdin must be a TTY).",
        );
        process.exitCode = 1;
        return;
      }
      let legalCode = 1;
      const inst = render(
        <Box flexDirection="column">
          <JobclawFilledLogoStatic showInitMascot />
          <InitLegal
            onFinish={(code) => {
              legalCode = code;
              inst.unmount();
            }}
          />
        </Box>,
      );
      await inst.waitUntilExit();
      if (legalCode !== 0) {
        process.exitCode = legalCode;
        return;
      }
      await restoreStdinAfterInk();
      process.exitCode = await runInitCredentialsPrompts();
      return;
    }
    case "doctor": {
      const cfg = await loadConfig();
      const code = doctorExitCodeFromCfg(cfg);
      const inst = render(<DoctorView cfg={cfg} />);
      setImmediate(() => inst.unmount());
      await inst.waitUntilExit();
      process.exitCode = code;
      return;
    }
    case "scan": {
      const inst = render(
        <ScanCommand
          cwd={root}
          onDone={(code) => {
            process.exitCode = code;
            inst.unmount();
          }}
        />,
      );
      await inst.waitUntilExit();
      return;
    }
    case "publish": {
      const inst = render(
        <PublishCommand
          cwd={root}
          onFinish={(code) => {
            process.exitCode = code;
            inst.unmount();
          }}
        />,
      );
      await inst.waitUntilExit();
      return;
    }
    case "assess": {
      const inst = render(
        <AssessCommand
          cwd={root}
          args={rest}
          onDone={(code) => {
            process.exitCode = code;
            inst.unmount();
          }}
        />,
      );
      await inst.waitUntilExit();
      return;
    }
    case "pm":
    case "projectman":
    case "projects": {
      process.exitCode = await runProjectman(rest);
      return;
    }
    default: {
      const inst = render(
        <Text color="red">
          Unknown command &quot;{cmd}&quot;. Run jobclaw help.
        </Text>,
      );
      setImmediate(() => inst.unmount());
      await inst.waitUntilExit();
      process.exitCode = 1;
    }
  }
}
