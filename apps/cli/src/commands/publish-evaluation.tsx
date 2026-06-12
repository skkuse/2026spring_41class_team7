import React, { useCallback, useEffect, useRef, useState } from "react";
import { createInterface } from "node:readline/promises";
import path from "node:path";
import { Box, Text, useInput } from "ink";
import { attemptPublishEvaluation } from "../lib/publish-evaluation-logic.js";
import { FREE_PUBLISH_LIMIT, recordSubscription } from "../lib/publish-logic.js";
import { ErrorBox, Spinner, SuccessBox, WarningBox } from "../ui/index.js";

const SUBSCRIBE_URL = "https://jobclaw.fyi/subscribe";

export type PublishEvaluationProps = {
  cwd: string;
  args: string[];
  onFinish: (code: number) => void;
};

function parsePublishEvaluationArgs(cwd: string, argv: string[]): {
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
  | { phase: "blocked" }
  | { phase: "done"; url: string; detail: string }
  | { phase: "error"; message: string };

export default function PublishEvaluationCommand({
  cwd,
  args,
  onFinish,
}: PublishEvaluationProps) {
  const { projectRoot } = parsePublishEvaluationArgs(cwd, args);
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
    const out = await attemptPublishEvaluation({ cwd, projectRoot });
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
          const out = await attemptPublishEvaluation({ cwd, projectRoot });
          if (out.kind === "error") {
            setView({ phase: "error", message: out.message });
            finish(1);
            return;
          }
          if (out.kind === "blocked") {
            setView({ phase: "blocked" });
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
          const out = await attemptPublishEvaluation({ cwd, projectRoot });
          if (out.kind === "error") {
            setView({ phase: "error", message: out.message });
            finish(1);
            return;
          }
          if (out.kind === "blocked") {
            setView({ phase: "blocked" });
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
        <Spinner label="Publishing evaluation…" />
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>{projectRoot}</Text>
        </Box>
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
    <SuccessBox title="Evaluation published!">
      <Text dimColor>{view.detail}</Text>
      <Text bold color="cyan">{view.url}</Text>
    </SuccessBox>
  );
}
