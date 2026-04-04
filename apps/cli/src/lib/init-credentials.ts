import { stdout as output } from "node:process";
import { createCredentialsReadline } from "./readline-tty.js";
import {
  type JobclawConfig,
  loadConfig,
  saveConfig,
  CONFIG_VERSION,
} from "./config.js";
import { saveSecrets } from "./secrets.js";
import { getOpenAiApiKey } from "./credentials.js";

/** Official OpenAI guides (users bring their own API key). */
const OPENAI_GUIDE_LINKS = [
  ["Quickstart", "https://platform.openai.com/docs/quickstart"],
  ["API authentication", "https://platform.openai.com/docs/api-reference/authentication"],
  ["Create / manage API keys", "https://platform.openai.com/api-keys"],
  [
    "Help: Where to find your API key",
    "https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key",
  ],
] as const;

/**
 * After legal acceptance, prompt for OpenAI API key and write ~/.jobclaw/secrets.json (0600).
 */
export async function runInitCredentialsPrompts(): Promise<number> {
  const { rl, dispose } = createCredentialsReadline();

  try {
    output.write("\n");
    output.write("── OpenAI (your API key) ──\n");
    output.write(
      "Jobclaw uses your own OpenAI API key. Follow OpenAI’s docs to create one, then paste it below.\n\n",
    );
    for (const [label, url] of OPENAI_GUIDE_LINKS) {
      output.write(`  • ${label}: ${url}\n`);
    }
    output.write(
      "\nBilling and usage limits are on your OpenAI account — see their pricing and dashboard.\n\n",
    );
    output.write(
      "Paste your secret key here. It is stored only in ~/.jobclaw/secrets.json (mode 600), not in the repo.\n",
    );
    output.write(
      "Press Enter with nothing typed to skip — scan will use fallback scores until a key is set.\n\n",
    );

    const openaiLine = (await rl.question("OpenAI API key: ")).trim();

    await saveSecrets({
      ...(openaiLine ? { openaiApiKey: openaiLine } : {}),
    });

    const prev = await loadConfig();
    const openaiReady = !!getOpenAiApiKey();

    const cfg: JobclawConfig = {
      version: CONFIG_VERSION,
      termsAccepted: true,
      privacyAccepted: true,
      openaiReady,
      publishCount: prev?.publishCount ?? 0,
      subscribedAt: prev?.subscribedAt,
      githubUsername: prev?.githubUsername,
    };
    await saveConfig(cfg);

    output.write("\n");
    if (openaiReady) {
      output.write("OpenAI: saved and ready.\n");
    } else {
      output.write(
        "OpenAI: no key — set one later with jobclaw init or OPENAI_API_KEY.\n",
      );
    }
    output.write("\nJobclaw init complete.\n");
    output.write("Config: ~/.jobclaw/config.json · secrets: ~/.jobclaw/secrets.json\n");

    return 0;
  } catch (e) {
    output.write(
      `\nError: ${e instanceof Error ? e.message : String(e)}\n`,
    );
    return 1;
  } finally {
    dispose();
  }
}
