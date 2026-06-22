import React, { useCallback, useEffect, useRef, useState } from "react";
import { createInterface } from "node:readline/promises";
import path from "node:path";
import { Box, Text, useInput } from "ink";
import { attemptPublishAssessment } from "../lib/publish-assessment-logic.js";
import { FREE_PUBLISH_LIMIT, recordSubscription } from "../lib/publish-logic.js";
import { runOAuthFlow } from "../lib/browser-auth.js";
import { saveSession } from "../lib/auth-store.js";
import { ErrorBox, Spinner, SuccessBox, WarningBox } from "../ui/index.js";

const SUBSCRIBE_URL = "https://jobclaw.fyi/subscribe";

export type PublishAssessmentProps = {
  cwd: string;
  args: string[];
  onFinish: (code: number) => void;
};

function parsePublishAssessmentArgs(cwd: string, argv: string[]): {
  projectRoot: string;
} {
  let projectRoot = path.resolve(cwd);
  for (const a of argv) {
    if (a.startsWith("-")) continue;
    projectRoot = path.resolve(cwd, a);
  }
  return { projectRoot };
}

type View =
  | { phase: "working" }
  | { phase: "logging-in" }
  | { phase: "blocked" }
  | { phase: "done"; url: string; detail: string }
  | { phase: "error"; message: string };

export default function PublishAssessmentCommand({
  cwd,
  args,
  onFinish,
}: PublishAssessmentProps) {
  const { projectRoot } = parsePublishAssessmentArgs(cwd, args);
  const [view, setView] = useState<View>({ phase: "working" });
  const finished = useRef(false);
  const nonTtyBlockedHandled = useRef(false);

  const finish = useCallback(
    (code: number) => {
      if (finished.current) return;
      finished.current = true;
      onFinish(code);
    },
    [onFinish],
  );

  const run = useCallback(async () => {
    const out = await attemptPublishAssessment({ cwd, projectRoot });
    if (out.kind === "needs-login") {
      setView({ phase: "logging-in" });
      const result = await runOAuthFlow((url) => {
        console.error(`Opening browser for GitHub login…\nIf it did not open, visit:\n  ${url}\n`);
      });
      if (!result.ok) {
        setView({ phase: "error", message: `Login failed: ${result.error}` });
        finish(1);
        return;
      }
      await saveSession(result.session);
      setView({ phase: "working" });
      const retryOut = await attemptPublishAssessment({ cwd, projectRoot });
      if (retryOut.kind === "blocked") {
        setView({ phase: "blocked" });
        return;
      }
      if (retryOut.kind === "error") {
        setView({ phase: "error", message: retryOut.message });
        finish(1);
        return;
      }
      if (retryOut.kind === "needs-login") {
        setView({ phase: "error", message: "Login succeeded but session was not saved. Try again." });
        finish(1);
        return;
      }
      setView({ phase: "done", url: retryOut.url, detail: retryOut.detail });
      finish(0);
      return;
    }
    if (out.kind === "blocked") {
      setView({ phase: "blocked" });
      return;
    }
    if (out.kind === "error") {
      setView({ phase: "error", message: out.message });
      finish(1);
      return;
    }
    setView({
      phase: "done",
      url: out.url,
      detail: out.detail,
    });
    finish(0);
  }, [cwd, projectRoot, finish]);

  useEffect(() => {
    void run();
  }, [run]);

  useEffect(() => {
    if (view.phase !== "blocked" || process.stdin.isTTY) return;
    if (nonTtyBlockedHandled.current) return;
    nonTtyBlockedHandled.current = true;
    void (async () => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        const ans = (
          await rl.question(
            `Subscribe at ${SUBSCRIBE_URL}, then type y to record subscription (or n to cancel): `,
          )
        ).trim();
        if (ans === "y" || ans === "Y") {
          await recordSubscription();
          finished.current = false;
          const out = await attemptPublishAssessment({ cwd, projectRoot });
          if (out.kind === "error") {
            setView({ phase: "error", message: out.message });
            finish(1);
            return;
          }
          if (out.kind === "blocked") {
            setView({ phase: "blocked" });
            return;
          }
          if (out.kind === "needs-login") {
            setView({ phase: "error", message: "Session expired. Run jobclaw publish again to log in." });
            finish(1);
            return;
          }
          setView({ phase: "done", url: out.url, detail: out.detail });
          finish(0);
        } else {
          setView({ phase: "error", message: "Publish cancelled." });
          finish(1);
        }
      } finally {
        rl.close();
      }
    })();
  }, [view.phase, cwd, projectRoot, finish]);

  useInput(
    (input, key) => {
      if (view.phase !== "blocked") return;
      const yes = input === "y" || input === "Y" || key.return;
      const no = input === "n" || input === "N" || key.escape;
      if (yes) {
        void (async () => {
          await recordSubscription();
          setView({ phase: "working" });
          finished.current = false;
          const out = await attemptPublishAssessment({ cwd, projectRoot });
          if (out.kind === "error") {
            setView({ phase: "error", message: out.message });
            finish(1);
            return;
          }
          if (out.kind === "blocked") {
            setView({ phase: "blocked" });
            return;
          }
          if (out.kind === "needs-login") {
            setView({ phase: "error", message: "Session expired. Run jobclaw publish again to log in." });
            finish(1);
            return;
          }
          setView({ phase: "done", url: out.url, detail: out.detail });
          finish(0);
        })();
      } else if (no) {
        setView({ phase: "error", message: "Publish cancelled." });
        finish(1);
      }
    },
    { isActive: view.phase === "blocked" && process.stdin.isTTY },
  );

  if (view.phase === "working") {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Spinner label="Publishing assessment…" />
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>{projectRoot}</Text>
        </Box>
      </Box>
    );
  }

  if (view.phase === "logging-in") {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Spinner label="Waiting for GitHub login…" />
      </Box>
    );
  }

  if (view.phase === "blocked") {
    return (
      <WarningBox title={`Subscription required — ${FREE_PUBLISH_LIMIT} free publishes used`}>
        <Text>Subscribe at <Text bold color="cyan">{SUBSCRIBE_URL}</Text></Text>
        <Text> </Text>
        <Text dimColor>After subscribing, confirm below to continue.</Text>
        <Text> </Text>
        <Text dimColor>[y / Enter] Record subscription  ·  [n / Esc] Cancel</Text>
      </WarningBox>
    );
  }

  if (view.phase === "error") {
    return <ErrorBox message={view.message} />;
  }

  return (
    <SuccessBox title="Assessment published!">
      <Text dimColor>{view.detail}</Text>
      <Text bold color="cyan">{view.url}</Text>
    </SuccessBox>
  );
}
