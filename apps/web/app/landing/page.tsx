
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-20 border-b border-border bg-black/40 backdrop-blur px-6 py-4 flex justify-between">
        <div className="font-extrabold tracking-tight">SIGNAL<span className="text-cyan-400">.AI</span></div>
        <div className="flex gap-3">
          <Link href="/onboarding" className="px-4 py-2 border border-border rounded">Login</Link>
          <Link href="/mobile/home" className="px-4 py-2 bg-cyan-400 text-black rounded font-bold">Get Started</Link>
        </div>
      </nav>
      <section className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Next-Gen Resume Engine</p>
          <h1 className="text-5xl font-black leading-tight mb-6">Code is your <span className="text-cyan-400">competitive advantage.</span></h1>
          <p className="text-zinc-300 mb-8">Transform GitHub history into a portfolio and ATS-ready resume in seconds.</p>
          <div className="flex gap-3">
            <Link href="/mobile/builder" className="px-6 py-3 bg-white text-black rounded-xl font-semibold">Build My Portfolio</Link>
            <Link href="/documents" className="px-6 py-3 border border-border rounded-xl">View Demo</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-border p-6 bg-gradient-to-b from-zinc-800/40 to-zinc-900/20">
          <div className="h-80 rounded-2xl bg-zinc-900 border border-zinc-700 p-6">
            <p className="text-cyan-400 text-xs mb-4">SYSTEM STATUS</p>
            <p className="text-3xl font-bold">15,000+ engineers onboarded</p>
          </div>
        </div>
      </section>
    </main>
  );
}
