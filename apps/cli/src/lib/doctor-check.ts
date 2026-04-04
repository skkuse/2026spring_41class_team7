import type { JobclawConfig } from "./config.js";
import { getOpenAiApiKey } from "./credentials.js";

export function doctorExitCodeFromCfg(cfg: JobclawConfig | null): number {
  const ok =
    cfg !== null &&
    cfg.termsAccepted &&
    cfg.privacyAccepted &&
    !!getOpenAiApiKey();
  return ok ? 0 : 1;
}
