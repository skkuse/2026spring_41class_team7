import React, { useCallback, useEffect, useRef, useState } from "react";
import { createInterface } from "node:readline/promises";
import { Box, Text, useInput } from "ink";
import {
  attemptPublish,
  recordSubscription,
  FREE_PUBLISH_LIMIT,
} from "../lib/publish-logic.js";

const SUBSCRIBE_URL = "https://jobclaw.fyi/subscribe";

export type PublishProps = {
  cwd: string;
  onFinish: (code: number) => void;
};

type View =
  | { phase: "working" }
  | { phase: "blocked" }
  | { phase: "done"; url: string; detail: string }
  | { phase: "error"; message: string };

export default function PublishCommand({ cwd, onFinish }: PublishProps) {
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
    const out = await attemptPublish(cwd);
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
  }, [cwd, finish]);

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
          const out = await attemptPublish(cwd);
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
  }, [view.phase, cwd]);

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
        const out = await attemptPublish(cwd);
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
      <Box flexDirection="column">
        <Text bold color="cyan">
          jobclaw publish
        </Text>
        <Text>Publishing…</Text>
      </Box>
    );
  }

  if (view.phase === "blocked") {
    return (
      <Box flexDirection="column">
        <Text bold color="yellow">
          Subscription required
        </Text>
        <Text>
          You have used {FREE_PUBLISH_LIMIT} free publishes. Subscribe at{" "}
          {SUBSCRIBE_URL}
        </Text>
        <Text dimColor>
          After subscribing, press y or Enter to record subscription and continue.
        </Text>
        <Text dimColor>[y / Enter] confirm · [n / Esc] cancel</Text>
      </Box>
    );
  }

  if (view.phase === "error") {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">
          jobclaw publish
        </Text>
        <Text color="red">{view.message}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        jobclaw publish
      </Text>
      <Text color="green">{view.detail}</Text>
      <Text bold>{view.url}</Text>
    </Box>
  );
}
