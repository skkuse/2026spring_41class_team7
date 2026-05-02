import { Box, Text } from "ink";
import { JobclawFilledLogoStatic } from "./filled-logo.js";

export default function Help({ showLogo }: { showLogo?: boolean }) {
  return (
    <Box flexDirection="column">
      {showLogo ? <JobclawFilledLogoStatic /> : null}
      <Text>jobclaw init — OpenAI API key, accept terms & privacy</Text>
      <Text>jobclaw scan — Git timeline, manifest scan, server evaluation</Text>
      <Text>jobclaw publish — Publish last scan to jobclaw.fyi (5 free publishes)</Text>
      <Text>jobclaw doctor — Verify configuration from init</Text>
      <Text>jobclaw assess [path] — Node backend quality (OpenAPI, Zod, rate limit, cache, Prisma) via OpenAI</Text>
      <Text dimColor>  env: OPENAI_API_KEY · --model · --json · --out FILE.md|json</Text>
      <Text>jobclaw pm … — Portfolio project management(add/open projects for AI eval)</Text>
      <Text dimColor>  alias: jobclaw projects · sources in packages/projectman</Text>
      <Text> </Text>
      <Text dimColor>https://jobclaw.fyi</Text>
    </Box>
  );
}
