import { PreviewResumeCard } from './preview-content';

export function PreviewMobile() {
  return (
    <main className="mx-auto min-h-screen max-w-md border-x border-border bg-zinc-950/40 pb-nav-safe">
      <header className="sticky top-0 flex justify-between border-b border-border bg-background p-4">
        <h1 className="font-bold">Preview</h1>
        <button
          type="button"
          className="rounded bg-cyan-400 px-3 py-1 text-xs font-bold text-black"
        >
          Export
        </button>
      </header>
      <section className="p-4">
        <PreviewResumeCard />
      </section>
      <div className="border-t border-border bg-background p-4 space-y-2">
        <button type="button" className="w-full rounded border border-border py-3">
          Download PDF
        </button>
        <button type="button" className="w-full rounded bg-cyan-400 py-3 font-bold text-black">
          Publish Site
        </button>
      </div>
    </main>
  );
}
