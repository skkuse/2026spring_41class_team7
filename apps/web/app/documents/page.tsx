'use client';

import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';

import { useApi } from '../../lib/api-context';

type DocumentItem = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  sizeLabel: string | null;
  tags: string[];
  createdAt: string;
  projectId: string;
  projectName: string;
};

const STATUS_STYLE: Record<DocumentItem['status'], string> = {
  ACTIVE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  DRAFT: 'text-amber-700 bg-amber-50 border-amber-200',
  ARCHIVED: 'text-muted-foreground bg-muted border-border',
};

const STATUS_TABS = ['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as const;
type Tab = (typeof STATUS_TABS)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentsPage() {
  const { get, authToken } = useApi();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('ALL');

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get<{ items: DocumentItem[] }>('/v1/documents')
      .then((data) => setDocuments(data.items))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [get, authToken]);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesTab = tab === 'ALL' || d.status === tab;
      const matchesQuery =
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.projectName.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [documents, query, tab]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="mb-1 flex items-center gap-2">
            <Icon icon="solar:folder-bold" className="text-lg text-primary" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Saved Files
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold">Documents</h1>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or project…"
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-1">
              {STATUS_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
                    tab === t
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl p-6">
        {loading && (
          <p className="font-mono text-xs text-muted-foreground">Loading documents…</p>
        )}
        {!loading && !authToken && (
          <p className="font-mono text-xs text-muted-foreground">Sign in to view your documents.</p>
        )}
        {!loading && authToken && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Icon icon="solar:folder-open-linear" className="mx-auto mb-3 text-4xl text-muted-foreground/40" />
            <p className="font-mono text-sm text-muted-foreground">
              {query || tab !== 'ALL'
                ? 'No documents match your filter.'
                : <>No documents yet. Run <code className="text-primary">jobclaw publish</code> to generate one.</>}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <article
              key={doc.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
            >
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-bold">{doc.name}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                      {doc.projectName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${STATUS_STYLE[doc.status]}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground">
                  {formatDate(doc.createdAt)}
                  {doc.sizeLabel ? ` · ${doc.sizeLabel}` : ''}
                </p>
              </div>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[9px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex gap-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted"
                >
                  <Icon icon="solar:download-linear" className="text-sm" />
                  Download
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted"
                >
                  <Icon icon="solar:share-linear" className="text-sm" />
                  Share
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
