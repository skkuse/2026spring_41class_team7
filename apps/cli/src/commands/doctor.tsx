import React, { useEffect, useRef, useState } from "react";
import { Box, Text } from "ink";
import type { JobclawConfig } from "../lib/config.js";
import { getOpenAiApiKey } from "../lib/credentials.js";
import { getSession } from "../lib/auth-store.js";

function Row({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Text color={ok ? "green" : "red"}>
      {ok ? "✓" : "✗"} {label}
    </Text>
  );
}

export type DoctorViewProps = {
  cfg: JobclawConfig | null;
};

export default function DoctorView({ cfg }: DoctorViewProps) {
  const [githubUser, setGithubUser] = useState<string | null | undefined>(
    undefined,
  );
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    void getSession().then((s) => setGithubUser(s?.user.githubUsername ?? null));
  }, []);

  const terms = cfg?.termsAccepted === true;
  const privacy = cfg?.privacyAccepted === true;
  const openai = !!getOpenAiApiKey();
  const loggedIn = !!githubUser;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        jobclaw doctor
      </Text>
      <Text> </Text>
      <Row ok={cfg !== null} label="Config file ~/.jobclaw/config.json" />
      <Row ok={terms} label="Terms of Service accepted (init)" />
      <Row ok={privacy} label="Privacy Policy accepted (init)" />
      <Row ok={openai} label="OpenAI API key (env or ~/.jobclaw/secrets.json)" />
      <Row
        ok={loggedIn}
        label={
          loggedIn
            ? `GitHub auth — logged in as @${githubUser}`
            : "GitHub auth (run jobclaw login)"
        }
      />
      <Text> </Text>
      {!cfg && (
        <Text color="yellow">Run jobclaw init to create configuration.</Text>
      )}
    </Box>
  );
}
