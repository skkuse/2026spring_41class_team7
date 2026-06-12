import React from "react";
import { Box, Text } from "ink";
import type {
  BackendEvaluationResult,
  ScorecardRow,
} from "../lib/backend-evaluation.js";

export type EvaluationResultMeta = {
  evaluationType: string;
  scanPath: string;
  savedPath: string;
  contextChars: number;
  outPath?: string;
};

type Props = {
  result: BackendEvaluationResult;
  meta: EvaluationResultMeta;
};

function scoreColor(n: number): "green" | "yellow" | "red" {
  if (n >= 7) return "green";
  if (n >= 4) return "yellow";
  return "red";
}

function overallColor(n: number): "green" | "yellow" | "red" {
  if (n >= 70) return "green";
  if (n >= 40) return "yellow";
  return "red";
}

function statusColor(s: ScorecardRow["status"]): "green" | "yellow" | "red" {
  if (s === "Strong") return "green";
  if (s === "Partial") return "yellow";
  return "red";
}

function scoreBar(score: number): string {
  const filled = Math.max(0, Math.min(10, Math.round(score)));
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

function Divider({ label }: { label: string }) {
  const line = "─".repeat(3);
  const tail = "─".repeat(Math.max(0, 42 - label.length - 8));
  return (
    <Box marginTop={1} marginBottom={1}>
      <Text dimColor>{line} </Text>
      <Text bold>{label}</Text>
      <Text dimColor> {tail}</Text>
    </Box>
  );
}

function BulletList({
  items,
  icon,
  color,
}: {
  items: string[];
  icon: string;
  color: "green" | "yellow" | "red" | "cyan";
}) {
  if (items.length === 0) return <Text dimColor>  None.</Text>;
  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Box key={i}>
          <Text color={color}>  {icon} </Text>
          <Text>{item}</Text>
        </Box>
      ))}
    </Box>
  );
}

function ScorecardTable({ rows }: { rows: ScorecardRow[] }) {
  const maxLen = Math.max(...rows.map((r) => r.criterion.length), 16);
  return (
    <Box flexDirection="column">
      {rows.map((row, i) => {
        const pad = " ".repeat(maxLen - row.criterion.length + 2);
        const col = scoreColor(row.score);
        return (
          <Box key={i} flexDirection="row">
            <Text>  {row.criterion}{pad}</Text>
            <Text color={col}>{scoreBar(row.score)}</Text>
            <Text>  </Text>
            <Text color={col} bold>
              {String(row.score).padStart(2)}/10
            </Text>
            <Text>  </Text>
            <Text color={statusColor(row.status)}>
              {row.status.padEnd(7)}
            </Text>
            <Text dimColor>  {row.confidence}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

export default function EvaluationResultView({ result, meta }: Props) {
  const oc = overallColor(result.overallScore);

  return (
    <Box flexDirection="column" marginTop={1}>
      {/* Header */}
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2}>
        <Text bold color="cyan">JOBCLAW  ·  Node.js Backend Evaluation</Text>
        <Box marginTop={1}>
          <Text>Overall Score  </Text>
          <Text bold color={oc}>{result.overallScore}/100</Text>
        </Box>
      </Box>

      {/* Executive Summary */}
      <Divider label="Executive Summary" />
      <Box paddingLeft={2}>
        <Text wrap="wrap">{result.executiveSummary || "—"}</Text>
      </Box>

      {/* Scorecard */}
      <Divider label="Scorecard" />
      <ScorecardTable rows={result.scorecard} />

      {/* Findings */}
      <Divider label="Findings" />
      <BulletList items={result.findings} icon="✓" color="green" />

      {/* Gaps & Risks */}
      <Divider label="Gaps & Risks" />
      <BulletList items={result.gapsAndRisks} icon="⚠" color="yellow" />

      {/* Next Steps */}
      <Divider label="Next Steps" />
      <Box flexDirection="column">
        {result.nextSteps.length === 0 ? (
          <Text dimColor>  None.</Text>
        ) : (
          result.nextSteps.map((step, i) => (
            <Box key={i}>
              <Text color="cyan">  {i + 1}. </Text>
              <Text>{step}</Text>
            </Box>
          ))
        )}
      </Box>

      {/* Footer */}
      <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={2}>
        <Text dimColor>Scan    <Text color="white">{meta.scanPath}</Text></Text>
        <Text dimColor>Report  <Text color="white">{meta.savedPath}</Text></Text>
        {meta.outPath && (
          <Text dimColor>Out     <Text color="white">{meta.outPath}</Text></Text>
        )}
        <Text dimColor>Context <Text color="white">{meta.contextChars.toLocaleString()} chars</Text></Text>
      </Box>
    </Box>
  );
}
