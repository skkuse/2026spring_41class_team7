/**
 * Workspace-oriented helpers for Jobclaw CLI: resolve repo root, load agent prompts,
 * and bundle repository text for LLMs.
 *
 * **Note:** This is **not** code extracted from Cursor. Cursor’s IDE agent is proprietary.
 * These utilities mirror common patterns (workspace root = cwd or CLI path, file bundles,
 * reusable prompts) so scripts and commands stay consistent.
 */

export {
  resolveRepoRoot,
  parseAssessCommandArgv,
  type ParsedAssessArgv,
} from "./repo-root.js";

export { loadLocalRepositoryAgentPrompt } from "./load-agent-prompt.js";

export {
  bundleRepositoryContext,
  type BundleRepositoryProfile,
} from "./bundle-repo-context.js";
