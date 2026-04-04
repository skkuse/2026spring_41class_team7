'use client';

import { Icon } from '@iconify/react';
import { useId, useRef } from 'react';

import type { BuilderFormProps } from './builder-types';

export function BuilderMobile({
  githubConnected,
  onConnectGithub,
  resumeFile,
  onResumeFile,
  stack,
  setStack,
  role,
  setRole,
  status,
  onRun,
}: BuilderFormProps) {
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 px-6 pb-6 pt-12 backdrop-blur-md">
        <div className="mb-2 flex items-center gap-2">
          <Icon icon="hugeicons:magic-wand-01" className="text-primary" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Step 01 / Input
          </span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Generator</h1>
      </header>
      <main className="space-y-12 px-6 py-10">
        <section>
          <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
            01. Source Code
          </span>
          <button
            type="button"
            onClick={onConnectGithub}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded py-6 font-bold transition-all active:scale-[0.98] ${
              githubConnected
                ? 'border border-primary/40 bg-primary/10 text-foreground'
                : 'bg-foreground text-background'
            }`}
          >
            <Icon icon="mdi:github" className="text-3xl" />
            <span className="font-mono text-[9px] font-black uppercase tracking-widest">
              {githubConnected ? 'GitHub profile linked' : 'Connect GitHub Profile'}
            </span>
          </button>
        </section>
        <section>
          <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
            02. Career Docs
          </span>
          <input
            ref={resumeInputRef}
            id={resumeInputId}
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="sr-only"
            onChange={(e) => onResumeFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card/30 p-10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon icon="hugeicons:cloud-upload" className="text-2xl" />
            </div>
            <div className="text-center">
              <p className="mb-1 font-mono text-[11px] font-bold uppercase">
                {resumeFile ? resumeFile.name : 'Upload Resume'}
              </p>
              <p className="text-[9px] uppercase text-muted-foreground">PDF, DOCX OR TXT</p>
            </div>
          </button>
        </section>
        <section>
          <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
            03. Target
          </span>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="builder-stack-mobile"
                className="mb-1.5 ml-1 block font-mono text-[9px] font-bold uppercase text-muted-foreground"
              >
                Focus Stack
              </label>
              <input
                id="builder-stack-mobile"
                type="text"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                className="w-full rounded border border-border bg-card px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. Rust, K8s"
              />
            </div>
            <div>
              <label
                htmlFor="builder-role-mobile"
                className="mb-1.5 ml-1 block font-mono text-[9px] font-bold uppercase text-muted-foreground"
              >
                Target Role
              </label>
              <input
                id="builder-role-mobile"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border border-border bg-card px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. Senior Engineer"
              />
            </div>
          </div>
        </section>
        <div className="pt-6">
          <button
            type="button"
            onClick={onRun}
            className="w-full rounded-sm bg-primary py-5 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_40px_rgba(0,229,255,0.2)] transition-opacity hover:opacity-95 active:scale-[0.99]"
          >
            Run Engine
          </button>
          {status ? (
            <p className="mt-4 text-center font-mono text-xs text-primary" role="status">
              {status}
            </p>
          ) : (
            <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              ETA: 12 SECONDS
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
