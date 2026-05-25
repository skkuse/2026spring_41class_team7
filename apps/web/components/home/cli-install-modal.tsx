'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

const INSTALL_CMD = 'npm install -g jobclaw';

const STEPS = [
  { step: '01', label: 'Assess your repo', code: 'jobclaw assess' },
  { step: '02', label: 'Publish results', code: 'jobclaw publish' },
];

export function CLIInstallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  function copy() {
    void navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:bolt-bold" className="text-lg text-primary" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest">
              Install Jobclaw CLI
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon icon="solar:close-linear" className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Install
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
              <code className="flex-1 font-mono text-sm text-foreground">
                {INSTALL_CMD}
              </code>
              <button
                onClick={copy}
                className="flex-shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                title="Copy"
              >
                <Icon
                  icon={copied ? 'solar:check-read-linear' : 'solar:copy-linear'}
                  className={`text-base transition-colors ${copied ? 'text-green-400' : ''}`}
                />
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Then in your project
            </p>
            <div className="space-y-2">
              {STEPS.map(({ step, label, code }) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
                  <span className="font-mono text-[10px] text-muted-foreground">{step}</span>
                  <div className="flex-1">
                    <p className="mb-0.5 font-mono text-[10px] text-muted-foreground">{label}</p>
                    <code className="font-mono text-sm text-foreground">{code}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
            Requires Node.js 18+. Your assessments will appear in this dashboard after publishing.
          </p>
        </div>
      </div>
    </div>
  );
}

export function InstallCLIButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        Install CLI
      </button>
      <CLIInstallModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
