import { Icon } from '@iconify/react';
import Link from 'next/link';

import { DashboardBottomNav } from './dashboard-bottom-nav';
import { TerminalMockup } from './terminal-mockup';

export function HomeMobile() {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground selection:bg-primary/30">
      <header className="border-b border-border/50 px-6 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground">
            <Icon icon="hugeicons:code" className="text-2xl" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tighter">
            Job<span className="text-primary">Script</span>
          </h1>
        </div>
      </header>
      <main className="px-6 py-12">
        <section className="mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
            <Icon icon="hugeicons:ai-brain-01" className="text-sm" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              AI-Engine Active
            </span>
          </div>
          <h2 className="mb-8 font-heading text-5xl font-black uppercase italic leading-[0.9] tracking-tighter">
            Ship your <span className="text-primary">career</span> faster.
          </h2>
          <p className="mb-10 font-mono text-sm leading-relaxed text-muted-foreground">
            &gt; High-signal portfolio and resume generator for engineers. Derived from raw Git
            commits.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href="/builder"
              className="rounded bg-primary py-5 text-center font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Create New Asset
            </Link>
            <Link
              href="/documents"
              className="rounded border border-border/50 bg-secondary py-5 text-center font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            >
              View History
            </Link>
          </div>
        </section>
        <section className="mb-16">
          <TerminalMockup />
        </section>
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Icon icon="hugeicons:cpu" className="text-xl text-primary" />
            <h3 className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The Protocol
            </h3>
          </div>
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded border border-border bg-card/40 p-6">
              <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-primary" />
              <div className="mb-3 font-mono text-[9px] text-muted-foreground">01 / SOURCE</div>
              <h4 className="mb-2 font-mono text-base font-bold uppercase">Connect Git</h4>
              <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                Automatic ingestion of repo metadata and commit density for proof of work.
              </p>
            </div>
            <div className="relative overflow-hidden rounded border border-border bg-card/40 p-6">
              <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-border" />
              <div className="mb-3 font-mono text-[9px] text-muted-foreground">02 / HISTORY</div>
              <h4 className="mb-2 font-mono text-base font-bold uppercase">Upload Docs</h4>
              <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                Transform unstructured PDFs into a queryable historical timeline.
              </p>
            </div>
          </div>
        </section>
      </main>
      <DashboardBottomNav tone="mobile" />
    </div>
  );
}
