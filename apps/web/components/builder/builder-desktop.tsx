'use client';

import { Icon } from '@iconify/react';
import { useId, useRef } from 'react';

import type { BuilderFormProps } from './builder-types';

export function BuilderDesktop({
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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <main className="mx-auto max-w-6xl px-8 py-10 lg:py-12">
        <div className="mb-10 border-b border-border/50 pb-8">
          <div className="mb-2 flex items-center gap-2">
            <Icon icon="hugeicons:magic-wand-01" className="text-2xl text-primary" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Step 01 / Input
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Generator</h1>
          <p className="mt-2 max-w-xl font-mono text-sm text-muted-foreground">
            Wire sources, upload context documents, and lock synthesis targets before running the
            engine.
          </p>
        </div>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="space-y-12 lg:col-span-7">
            <div className="grid gap-10 md:grid-cols-2">
              <section>
                <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
                  01. Source Code
                </span>
                <button
                  type="button"
                  onClick={onConnectGithub}
                  className={`flex w-full flex-col items-center justify-center gap-3 rounded-lg py-10 font-bold transition-all hover:opacity-95 active:scale-[0.99] ${
                    githubConnected
                      ? 'border-2 border-primary/50 bg-primary/10 text-foreground'
                      : 'bg-foreground text-background'
                  }`}
                >
                  <Icon icon="mdi:github" className="text-5xl" />
                  <span className="px-2 text-center font-mono text-[9px] font-black uppercase tracking-widest">
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
                  className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card/30 p-8 transition-colors hover:bg-card/50"
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
              </section>
            </div>
            <section>
              <span className="mb-6 block font-mono text-[10px] font-bold uppercase italic tracking-[0.2em] text-muted-foreground">
                03. Target
              </span>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="builder-stack-desktop"
                    className="mb-2 block font-mono text-[9px] font-bold uppercase text-muted-foreground"
                  >
                    Focus Stack
                  </label>
                  <input
                    id="builder-stack-desktop"
                    type="text"
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Rust, K8s"
                  />
                </div>
                <div>
                  <label
                    htmlFor="builder-role-desktop"
                    className="mb-2 block font-mono text-[9px] font-bold uppercase text-muted-foreground"
                  >
                    Target Role
                  </label>
                  <input
                    id="builder-role-desktop"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Senior Engineer"
                  />
                </div>
              </div>
            </section>
            <div>
              <button
                type="button"
                onClick={onRun}
                className="rounded-sm bg-primary px-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_40px_rgba(0,229,255,0.2)] transition-opacity hover:opacity-95"
              >
                Run Engine
              </button>
              {status ? (
                <p className="mt-4 font-mono text-sm text-primary" role="status">
                  {status}
                </p>
              ) : (
                <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  ETA: 12 SECONDS
                </p>
              )}
            </div>
          </div>
          <aside className="rounded-lg border border-border bg-card/30 p-8 lg:col-span-5">
            <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Pipeline
            </h2>
            <ol className="space-y-5 font-mono text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary">01</span>
                <span>OAuth to GitHub; ingest public contribution graph and repo metadata.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">02</span>
                <span>Parse resume / PDF text into structured timeline for the model.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">03</span>
                <span>Apply stack + role prompts; emit preview layout and export bundles.</span>
              </li>
            </ol>
          </aside>
        </div>
      </main>
    </div>
  );
}
