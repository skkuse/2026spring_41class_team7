import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** From `src/lib/workspace-agent/` → `apps/cli/prompts/…` */
const AGENT_PROMPT_REL = "../../../prompts/agents/local-repository-agent.prompt.md";

function resolveAgentPromptPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, AGENT_PROMPT_REL);
}

/**
 * Loads the “local repository agent” markdown and substitutes `{{REPO_ROOT}}`
 * with an absolute path so it can be pasted into OpenAI or another model as system context.
 */
export async function loadLocalRepositoryAgentPrompt(repoRoot: string): Promise<string> {
  const abs = path.resolve(repoRoot);
  const raw = await readFile(resolveAgentPromptPath(), "utf8");
  return raw.replace(/\{\{REPO_ROOT\}\}/g, abs);
}
