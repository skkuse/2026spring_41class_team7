import React from "react";
import { Box, Text } from "ink";
import type { JobclawConfig } from "../lib/config.js";
import { getOpenAiApiKey } from "../lib/credentials.js";

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

/** Synchronous view; caller loads config and unmounts after a tick. */
export default function DoctorView({ cfg }: DoctorViewProps) {
  const terms = cfg?.termsAccepted === true;
  const privacy = cfg?.privacyAccepted === true;
  const openai = !!getOpenAiApiKey();

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
      <Text> </Text>
      {!cfg && (
        <Text color="yellow">Run jobclaw init to create configuration.</Text>
      )}
    </Box>
  );
}
