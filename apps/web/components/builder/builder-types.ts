export type BuilderFormProps = {
  githubConnected: boolean;
  onConnectGithub: () => void;
  resumeFile: File | null;
  onResumeFile: (file: File | null) => void;
  stack: string;
  setStack: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  status: string;
  onRun: () => void;
};
