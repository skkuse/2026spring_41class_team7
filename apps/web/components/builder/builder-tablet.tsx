'use client';

import { Icon } from '@iconify/react';
import { useId, useRef } from 'react';

import type { BuilderFormProps } from './builder-types';

export function BuilderTablet({
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
    <div className="min-h-screen border-x border-border bg-background pb-nav-safe font-sans text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/90 px-8 pb-8 pt-14 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <Icon icon="hugeicons:magic-wand-01" className="text-primary" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Step 01 / Input
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">Generator</h1>
          <p className="mt-2 max-w-xl font-mono text-xs text-muted-foreground">
            Link GitHub, attach career docs, then set stack and role targets for synthesis.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-12 px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <section className="space-y-10">
            <div>
              <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
                01. Source Code
              </span>
              <button
                type="button"
                onClick={onConnectGithub}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg py-8 font-bold transition-all active:scale-[0.99] ${
                  githubConnected
                    ? 'border border-primary/40 bg-primary/10 text-foreground'
                    : 'bg-foreground text-background'
                }`}
              >
                <Icon icon="mdi:github" className="text-4xl" />
                <span className="font-mono text-[9px] font-black uppercase tracking-widest">
                  {githubConnected ? 'GitHub profile linked' : 'Connect GitHub Profile'}
                </span>
              </button>
            </div>
            <div>
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
                className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card/30 p-12"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon icon="hugeicons:cloud-upload" className="text-3xl" />
                </div>
                <div className="text-center">
                  <p className="mb-1 font-mono text-xs font-bold uppercase">
                    {resumeFile ? resumeFile.name : 'Upload Resume'}
                  </p>
                  <p className="text-[9px] uppercase text-muted-foreground">PDF, DOCX OR TXT</p>
                </div>
              </button>
            </div>
          </section>
          <section>
            <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
              03. Target
            </span>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="builder-stack-tablet"
                  className="mb-1.5 ml-1 block font-mono text-[9px] font-bold uppercase text-muted-foreground"
                >
                  Focus Stack
                </label>
                <input
                  id="builder-stack-tablet"
                  type="text"
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Rust, K8s"
                />
              </div>
              <div>
                <label
                  htmlFor="builder-role-tablet"
                  className="mb-1.5 ml-1 block font-mono text-[9px] font-bold uppercase text-muted-foreground"
                >
                  Target Role
                </label>
                <input
                  id="builder-role-tablet"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Senior Engineer"
                />
              </div>
            </div>
            <div className="mt-10">
              <button
                type="button"
                onClick={onRun}
                className="w-full rounded-sm bg-primary py-5 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_40px_rgba(0,229,255,0.2)] transition-opacity hover:opacity-95"
              >
                Run Engine
              </button>
              {status ? (
                <p className="mt-4 text-center font-mono text-sm text-primary" role="status">
                  {status}
                </p>
              ) : (
                <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  ETA: 12 SECONDS
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
