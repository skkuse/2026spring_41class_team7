import { Icon } from '@iconify/react';
import Link from 'next/link';

import { DashboardBottomNav } from './dashboard-bottom-nav';
import { HomeGuestSocial } from './home-guest-social';
import { TerminalMockup } from './terminal-mockup';

export function HomeTablet() {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground selection:bg-primary/30">
      <header className="border-b border-border/50 px-8 pb-8 pt-14">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon icon="hugeicons:code" className="text-2xl" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tighter">
            Job<span className="text-primary">Script</span>
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-8 py-12">
        <HomeGuestSocial />
        <section className="mb-16 grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              <Icon icon="hugeicons:ai-brain-01" className="text-sm" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                AI-Engine Active
              </span>
            </div>
            <h2 className="mb-6 font-heading text-4xl font-black uppercase italic leading-[0.9] tracking-tighter md:text-5xl">
              Ship your <span className="text-primary">career</span> faster.
            </h2>
            <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
              &gt; High-signal portfolio and resume generator for engineers. Derived from raw Git
              commits.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/builder"
                className="flex-1 rounded bg-primary py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-opacity hover:opacity-90"
              >
                Create New Asset
              </Link>
              <Link
                href="/documents"
                className="flex-1 rounded border border-border/50 bg-secondary py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted"
              >
                View History
              </Link>
            </div>
          </div>
          <TerminalMockup />
        </section>
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Icon icon="hugeicons:cpu" className="text-xl text-primary" />
            <h3 className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The Protocol
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
      <DashboardBottomNav tone="tablet" />
    </div>
  );
}
