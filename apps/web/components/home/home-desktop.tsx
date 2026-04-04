import { Icon } from '@iconify/react';
import Link from 'next/link';

import { HomeGuestSocial } from './home-guest-social';
import { TerminalMockup } from './terminal-mockup';

export function HomeDesktop() {
  return (
    <div className="min-h-screen bg-background font-home-sans text-foreground selection:bg-primary/30">
      <main className="mx-auto max-w-6xl px-8 py-12 lg:py-16">
        <HomeGuestSocial />
        <section className="mb-20 grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              <Icon icon="hugeicons:ai-brain-01" className="text-sm" />
              <span className="font-home-mono text-[10px] font-bold uppercase tracking-widest">
                AI-Engine Active
              </span>
            </div>
            <h2 className="mb-6 font-home-heading text-5xl font-extrabold uppercase italic leading-[0.92] tracking-tight lg:text-6xl xl:text-7xl">
              Ship your <span className="text-primary">career</span> faster.
            </h2>
            <p className="mb-4 max-w-xl font-home-serif text-xl italic leading-relaxed text-muted-foreground">
              High-signal portfolio and resume generator for engineers—derived from raw Git
              commits.
            </p>
            <p className="mb-10 max-w-lg font-home-mono text-sm leading-relaxed text-muted-foreground">
              &gt; Parse repos, synthesize proof-of-work, export ATS-ready assets in one pipeline.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/builder"
                className="rounded-lg bg-primary px-10 py-4 font-home-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-opacity hover:opacity-90"
              >
                Create New Asset
              </Link>
              <Link
                href="/documents"
                className="rounded-lg border border-border/50 bg-secondary px-10 py-4 font-home-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted"
              >
                View History
              </Link>
              <Link
                href="/dev"
                className="rounded-lg border border-dashed border-border px-6 py-4 font-home-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                All screens
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <TerminalMockup />
          </div>
        </section>
        <section>
          <div className="mb-8 flex items-center gap-3">
            <Icon icon="hugeicons:cpu" className="text-2xl text-primary" />
            <h3 className="font-home-heading text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              The Protocol
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg border border-border bg-card/40 p-8">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
              <div className="mb-3 font-home-mono text-[10px] text-muted-foreground">01 / SOURCE</div>
              <h4 className="mb-3 font-home-mono text-lg font-bold uppercase">Connect Git</h4>
              <p className="max-w-md font-home-sans text-sm leading-relaxed text-muted-foreground">
                Automatic ingestion of repo metadata and commit density for proof of work.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-card/40 p-8">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-border" />
              <div className="mb-3 font-home-mono text-[10px] text-muted-foreground">02 / HISTORY</div>
              <h4 className="mb-3 font-home-mono text-lg font-bold uppercase">Upload Docs</h4>
              <p className="max-w-md font-home-sans text-sm leading-relaxed text-muted-foreground">
                Transform unstructured PDFs into a queryable historical timeline.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
