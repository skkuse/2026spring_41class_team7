import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Spinner({ label }: { label: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);
  return (
    <Box>
      <Text color="cyan">{FRAMES[frame]} </Text>
      <Text>{label}</Text>
    </Box>
  );
}

type StepStatus = "pending" | "active" | "done" | "error";

export function StatusStep({
  label,
  status,
  detail,
}: {
  label: string;
  status: StepStatus;
  detail?: string;
}) {
  if (status === "active") {
    return (
      <Box flexDirection="column">
        <Spinner label={label} />
        {detail && (
          <Box marginLeft={2}>
            <Text dimColor>{detail}</Text>
          </Box>
        )}
      </Box>
    );
  }
  if (status === "done") {
    return (
      <Box>
        <Text color="green">✓ </Text>
        <Text dimColor>{label}</Text>
      </Box>
    );
  }
  if (status === "error") {
    return (
      <Box>
        <Text color="red">✗ </Text>
        <Text color="red">{label}</Text>
      </Box>
    );
  }
  return (
    <Box>
      <Text dimColor>○ {label}</Text>
    </Box>
  );
}

export function CommandHeader({ title }: { title: string }) {
  return (
    <Box borderStyle="round" borderColor="cyan" paddingX={2} marginBottom={1}>
      <Text bold color="cyan">
        {title}
      </Text>
    </Box>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={2} marginTop={1}>
      <Box>
        <Text color="red" bold>✗  Error</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="red">{message}</Text>
      </Box>
    </Box>
  );
}

export function SuccessBox({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} marginTop={1}>
      <Box>
        <Text color="green" bold>✓  {title}</Text>
      </Box>
      {children && <Box marginTop={1} flexDirection="column">{children}</Box>}
    </Box>
  );
}

export function WarningBox({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={2} marginTop={1}>
      <Box>
        <Text color="yellow" bold>⚠  {title}</Text>
      </Box>
      {children && <Box marginTop={1} flexDirection="column">{children}</Box>}
    </Box>
  );
}
