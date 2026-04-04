import { PreviewResumeCard } from './preview-content';

export function PreviewTablet() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl border-x border-border bg-zinc-950/40 pb-nav-safe">
      <header className="flex items-center justify-between border-b border-border bg-background px-8 py-5">
        <div>
          <h1 className="font-home-heading text-xl font-bold uppercase tracking-tight">Preview</h1>
          <p className="font-home-mono text-[10px] text-muted-foreground">Live layout · PDF · Publish</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 font-home-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground"
        >
          Export
        </button>
      </header>
      <section className="p-8">
        <PreviewResumeCard />
      </section>
      <div className="border-t border-border bg-background/95 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button type="button" className="flex-1 rounded-lg border border-border py-3 font-home-mono text-xs font-bold uppercase">
            Download PDF
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-primary py-3 font-home-mono text-xs font-bold uppercase text-primary-foreground"
          >
            Publish Site
          </button>
        </div>
      </div>
    </main>
  );
}
