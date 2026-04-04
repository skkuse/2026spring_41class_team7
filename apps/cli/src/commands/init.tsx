import { useCallback, useState } from "react";
import { Box, Text, useInput } from "ink";

type Step = "intro" | "terms" | "privacy" | "aborted";

const TERMS_URL = "https://jobclaw.fyi/terms";
const PRIVACY_URL = "https://jobclaw.fyi/privacy";

export type InitLegalProps = {
  /** 0 = accepted both; 1 = user aborted */
  onFinish: (code: number) => void;
};

/**
 * Intro → terms → privacy. Credential prompts run in the shell after Ink unmounts.
 */
export default function InitLegal({ onFinish }: InitLegalProps) {
  const [step, setStep] = useState<Step>("intro");

  const abort = useCallback(() => {
    setStep("aborted");
    onFinish(1);
  }, [onFinish]);

  useInput(
    (input, key) => {
      if (step === "aborted") return;

      const yes = input === "y" || input === "Y";
      const no = input === "n" || input === "N" || key.escape;

      if (step === "intro") {
        if (key.return || yes) setStep("terms");
        else if (no) abort();
        return;
      }
      if (step === "terms") {
        if (yes) setStep("privacy");
        else if (no) abort();
        return;
      }
      if (step === "privacy") {
        if (yes) onFinish(0);
        else if (no) abort();
      }
    },
    { isActive: process.stdin.isTTY },
  );

  if (step === "aborted") {
    return <Text color="red">Init cancelled.</Text>;
  }

  return (
    <Box flexDirection="column">
      {step === "intro" && (
        <>
          <Text bold color="cyan">
            Let&apos;s get started
          </Text>
          <Text> </Text>
          <Text wrap="wrap">
            Jobclaw will work with private data on your machine (for example your OpenAI API key).
            Because of that, we need you to agree to our Terms of Service and Privacy Policy before we
            continue. You&apos;ll confirm each in the next steps.
          </Text>
          <Text> </Text>
          <Text dimColor>
            [Enter] or y — continue · n or Esc — exit
          </Text>
        </>
      )}
      {step === "terms" && (
        <>
          <Text bold color="cyan">
            Terms of Service
          </Text>
          <Text> </Text>
          <Text wrap="wrap">
            Read the full terms at {TERMS_URL}. Do you accept the Terms of Service? [y/N]
          </Text>
          <Text dimColor>You must accept to continue.</Text>
        </>
      )}
      {step === "privacy" && (
        <>
          <Text bold color="cyan">
            Privacy Policy
          </Text>
          <Text> </Text>
          <Text wrap="wrap">
            Read the full policy at {PRIVACY_URL}. Do you accept the Privacy Policy? [y/N]
          </Text>
        </>
      )}
    </Box>
  );
}
