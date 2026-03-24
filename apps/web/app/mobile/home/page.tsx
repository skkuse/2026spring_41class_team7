
import Link from 'next/link';

export default function MobileHomePage() {
  return (
    <main className="min-h-screen max-w-md mx-auto border-x border-border pb-20">
      <header className="px-5 pt-10 pb-5 border-b border-border"><h1 className="text-2xl font-bold">Signal.cv</h1></header>
      <section className="p-5 space-y-6">
        <h2 className="text-4xl font-black leading-tight">Ship your <span className="text-cyan-400">career</span> faster.</h2>
        <p className="text-sm text-muted-foreground">High-signal portfolio and resume generator for engineers.</p>
        <div className="space-y-3">
          <Link href="/mobile/builder" className="block text-center py-4 bg-cyan-400 text-black font-bold rounded">Create New Asset</Link>
          <Link href="/documents" className="block text-center py-4 border border-border rounded">View History</Link>
        </div>
      </section>
    </main>
  );
}
