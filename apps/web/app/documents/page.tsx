
'use client';

import { useMemo, useState } from 'react';
import { documents } from '../../lib/mock-data';

export default function DocumentsPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'pro' | 'drafts'>('all');

  const filtered = useMemo(() => {
    return documents.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 border-b border-border bg-background/90 backdrop-blur px-6 py-6">
        <h1 className="text-3xl font-bold">Saved Assets</h1>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name" className="mt-4 w-full max-w-md rounded-full bg-card border border-border px-4 py-2" />
        <div className="mt-4 flex gap-3 text-xs uppercase">
          {['all', 'pro', 'drafts'].map((t) => (
            <button key={t} onClick={() => setTab(t as 'all' | 'pro' | 'drafts')} className={`px-3 py-2 border-b-2 ${tab === t ? 'text-cyan-400 border-cyan-400' : 'border-transparent text-zinc-500'}`}>
              {t}
            </button>
          ))}
        </div>
      </header>
      <section className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <article key={doc.id} className="border border-border bg-card/60 rounded p-5 flex flex-col gap-4">
            <div>
              <h3 className="font-mono text-sm font-bold">{doc.name}</h3>
              <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
            </div>
            <div className="flex gap-2 flex-wrap">{doc.tags.map((tag) => <span key={tag} className="text-[10px] border border-border rounded px-2 py-1">{tag}</span>)}</div>
            <div className="mt-auto flex gap-2">
              <button className="flex-1 border border-border rounded py-2">Open</button>
              <button className="flex-1 border border-border rounded py-2">Share</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
