import path from "node:path";
import { bundleBackendAssessmentContext } from "../bundle-backend-context.js";
import { bundleSourceContext } from "../source-snippet.js";

export type BundleRepositoryProfile = "general" | "backend";

/**
 * Concatenates truncated source excerpts under `repoRoot` for LLM prompts.
 *
 * - **general** — broad walk (same caps as `scan` evaluation bundling).
 * - **backend** — prioritizes Prisma, routes, OpenAPI-ish paths (`bundle-backend-context`).
 */
export async function bundleRepositoryContext(
  repoRoot: string,
  profile: BundleRepositoryProfile = "general",
): Promise<string> {
  const root = path.resolve(repoRoot);
  if (profile === "backend") {
    return bundleBackendAssessmentContext(root);
  }
  return bundleSourceContext(root);
}
