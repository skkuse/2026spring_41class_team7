
export default function MobilePreviewPage() {
  return (
    <main className="min-h-screen max-w-md mx-auto border-x border-border bg-zinc-950/40 pb-24">
      <header className="sticky top-0 bg-background border-b border-border p-4 flex justify-between">
        <h1 className="font-bold">Preview</h1>
        <button className="px-3 py-1 bg-cyan-400 text-black rounded text-xs font-bold">Export</button>
      </header>
      <section className="p-4">
        <article className="bg-background border border-border p-5 rounded">
          <h2 className="text-4xl font-black">H. Kang</h2>
          <p className="text-xs text-cyan-400 mt-2">hkang@dev.system</p>
          <h3 className="mt-6 text-xs text-cyan-400 uppercase">Overview</h3>
          <p className="mt-2 text-sm">Lead Platform Engineer focused on distributed systems and cloud-native scaling protocols.</p>
          <h3 className="mt-6 text-xs text-cyan-400 uppercase">Tech Stack</h3>
          <p className="mt-2 text-sm">Rust, Go, C++, Kubernetes, AWS, Terraform</p>
        </article>
      </section>
      <div className="fixed bottom-0 w-full max-w-md border-t border-border bg-background p-4 space-y-2">
        <button className="w-full py-3 border border-border rounded">Download PDF</button>
        <button className="w-full py-3 bg-cyan-400 text-black rounded font-bold">Publish Site</button>
      </div>
    </main>
  );
}
