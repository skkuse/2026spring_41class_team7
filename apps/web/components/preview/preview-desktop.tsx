import { PreviewResumeCard } from './preview-content';

export function PreviewDesktop() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-8 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-home-heading text-3xl font-bold uppercase tracking-tight">Preview</h1>
          <p className="mt-2 max-w-xl font-home-mono text-sm text-muted-foreground">
            Review the generated identity card before export. Actions sync with billing and hosting
            when wired.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border border-border px-6 py-3 font-home-mono text-xs font-bold uppercase tracking-widest"
          >
            Download PDF
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-6 py-3 font-home-mono text-xs font-bold uppercase tracking-widest text-primary-foreground"
          >
            Publish Site
          </button>
          <button
            type="button"
            className="rounded-lg border border-dashed border-border px-5 py-3 font-home-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Export JSON
          </button>
        </div>
      </header>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PreviewResumeCard />
        </div>
        <aside className="rounded-lg border border-border bg-card/30 p-6 font-home-sans text-sm text-muted-foreground lg:col-span-4">
          <h2 className="mb-3 font-home-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            Checklist
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Verify headline and contact channel.</li>
            <li>Stack tags match target roles.</li>
            <li>Export PDF for ATS submissions.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
