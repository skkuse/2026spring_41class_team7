'use client';

import { useEffect, useMemo, useState } from 'react';

import { useApi } from '../../lib/api-context';

type AssessmentSummary = {
  id: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  assessmentType: string;
  overallScore: number;
  model: string;
  generatedAt: string;
  createdAt: string;
};

export default function DocumentsPage() {
  const { get, authToken } = useApi();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'pro' | 'drafts'>('all');

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get<{ items: AssessmentSummary[]; total: number }>('/v1/assessments')
      .then((data) => setAssessments(data.items))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, [get, authToken]);

  const filtered = useMemo(() => {
    return assessments.filter((a) =>
      `${a.repoOwner}/${a.repoName}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [assessments, query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 border-b border-border bg-background/90 backdrop-blur px-6 py-6">
        <h1 className="text-3xl font-bold">Saved Assets</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by repo"
          className="mt-4 w-full max-w-md rounded-full bg-card border border-border px-4 py-2"
        />
        <div className="mt-4 flex gap-3 text-xs uppercase">
          {(['all', 'pro', 'drafts'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 border-b-2 ${tab === t ? 'text-cyan-400 border-cyan-400' : 'border-transparent text-zinc-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>
      <section className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <p className="col-span-3 text-muted-foreground">Loading assessments…</p>
        )}
        {!loading && !authToken && (
          <p className="col-span-3 text-muted-foreground">Sign in to view your assessments.</p>
        )}
        {!loading && authToken && filtered.length === 0 && (
          <p className="col-span-3 text-muted-foreground">
            No assessments yet. Run <code className="font-mono">jobclaw publish</code> to get started.
          </p>
        )}
        {filtered.map((doc) => (
          <article
            key={doc.id}
            className="border border-border bg-card/60 rounded p-5 flex flex-col gap-4"
          >
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {doc.assessmentType}
              </p>
              <h3 className="font-mono text-sm font-bold">
                {doc.repoOwner}/{doc.repoName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                · Score: {doc.overallScore}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] border border-border rounded px-2 py-1">
                {doc.model}
              </span>
              <span className="text-[10px] border border-border rounded px-2 py-1">
                {doc.assessmentType}
              </span>
            </div>
            <div className="mt-auto flex gap-2">
              <a
                href={doc.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 border border-border rounded py-2 text-center text-sm"
              >
                View Repo
              </a>
              <button className="flex-1 border border-border rounded py-2">Share</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
