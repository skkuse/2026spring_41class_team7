import { Box, Text } from "ink";
import { JobclawFilledLogoStatic } from "./filled-logo.js";

export default function Help({ showLogo }: { showLogo?: boolean }) {
  return (
    <Box flexDirection="column">
      {showLogo ? <JobclawFilledLogoStatic /> : null}
      <Text>jobclaw init — OpenAI API key, accept terms & privacy</Text>
      <Text>jobclaw assess [path] — Repo scan → scan-result.json, then backend rubric (OpenAPI, Zod, …)</Text>
      <Text dimColor>  env: OPENAI_API_KEY · --type · --model · --json · --out FILE.md|json</Text>
      <Text>jobclaw publish [path] — Publish scan + latest assessment (requires both under .jobclaw/)</Text>
      <Text>jobclaw publish-scan — Publish scan-only (same free-publish quota)</Text>
      <Text>jobclaw doctor — Verify configuration from init</Text>
      <Text>jobclaw pm … — Portfolio project management(add/open projects for AI eval)</Text>
      <Text dimColor>  alias: jobclaw projects · sources in packages/projectman</Text>
      <Text> </Text>
      <Text dimColor>https://jobclaw.fyi</Text>
    </Box>
  );
}
