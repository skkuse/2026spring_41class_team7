export type ScanResultFile = {
  generatedAt: string;
  repoRoot: string;
  timeline: { start: string | null; end: string | null };
  agent1: {
    skills: string[];
    libraries: string[];
    manifests: { packageJson: string[]; cargoToml: string[] };
  };
  agent2: {
    promptSource: "server" | "fallback";
    scores: Record<string, number>;
    checklist: { id: string; label: string; status: "done" | "not_done" }[];
  };
};
