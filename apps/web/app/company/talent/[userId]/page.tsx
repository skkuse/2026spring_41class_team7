'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CompanyHeader } from '../../../../components/company/company-header';
import { useApi } from '../../../../lib/api-context';

type Assessment = {
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

type TalentDetail = {
  userId: string;
  fullName: string;
  role: string;
  location: string;
  website: string | null;
  allowContact: boolean;
  isShortlisted: boolean;
  assessments: Assessment[];
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBorderColor(score: number) {
  if (score >= 80) return 'border-green-400/40';
  if (score >= 60) return 'border-yellow-400/40';
  return 'border-red-400/40';
}

export default function TalentDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { get, post, delete: del } = useApi();

  const [talent, setTalent] = useState<TalentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    get<TalentDetail>(`/v1/talent/${userId}`)
      .then((data) => setTalent(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [get, userId]);

  async function toggleShortlist() {
    if (!talent) return;
    if (talent.isShortlisted) {
      await del(`/v1/shortlist/${talent.userId}`).catch(() => null);
    } else {
      await post('/v1/shortlist', { devUserId: talent.userId }).catch(() => null);
    }
    setTalent((prev) => prev && { ...prev, isShortlisted: !prev.isShortlisted });
  }

  async function sendContact(e: React.FormEvent) {
    e.preventDefault();
    if (!talent) return;
    setSending(true);
    setSendError('');
    try {
      await post(`/v1/talent/${talent.userId}/contact`, { message });
      setSent(true);
      setMessage('');
    } catch {
      setSendError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const displayName = talent?.fullName || 'Anonymous Developer';
  const bestScore = talent?.assessments[0]?.overallScore ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompanyHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-6 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Link href="/company/talent" className="hover:text-foreground transition-colors">
            Talent Directory
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" className="shrink-0 text-[10px]" />
          <span className="text-foreground">{loading ? '…' : displayName}</span>
        </nav>

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
          </div>
        ) : notFound || !talent ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Icon icon="solar:user-cross-linear" className="mx-auto mb-3 text-4xl text-muted-foreground" />
            <p className="text-muted-foreground">Developer not found.</p>
            <Link href="/company/talent" className="mt-4 inline-block font-mono text-xs text-primary hover:underline">
              ← Back to Talent Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile hero */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {/* Avatar */}
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-mono text-2xl font-black text-primary">
                  {initials(displayName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h1 className="text-2xl font-bold leading-tight">{displayName}</h1>
                  {talent.role && (
                    <p className="text-muted-foreground">{talent.role}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
                    {talent.location && (
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:map-point-linear" className="shrink-0" />
                        {talent.location}
                      </span>
                    )}
                    {talent.website && (
                      <a
                        href={talent.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Icon icon="solar:link-linear" className="shrink-0" />
                        {talent.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                {/* Score + actions */}
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                  {bestScore !== null && (
                    <div className={`flex flex-col items-center justify-center rounded-xl border-2 bg-card p-4 w-24 ${scoreBorderColor(bestScore)}`}>
                      <span className={`font-mono text-3xl font-black leading-none ${scoreColor(bestScore)}`}>
                        {bestScore}
                      </span>
                      <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Best Score
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={toggleShortlist}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xs transition-colors ${
                      talent.isShortlisted
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Icon
                      icon={talent.isShortlisted ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}
                      className="text-base"
                    />
                    {talent.isShortlisted ? 'Saved' : 'Shortlist'}
                  </button>
                </div>
              </div>
            </div>

            {/* Assessments */}
            <section>
              <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assessments ({talent.assessments.length})
              </h2>
              {talent.assessments.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  No assessments yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {talent.assessments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-secondary/20"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <Icon icon="solar:code-square-linear" className="text-base text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <a
                            href={a.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate font-mono text-sm font-medium hover:text-primary transition-colors"
                          >
                            {a.repoOwner}/{a.repoName}
                          </a>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {a.assessmentType.toLowerCase()} · {new Date(a.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 font-mono text-2xl font-black ${scoreColor(a.overallScore)}`}>
                        {a.overallScore}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Contact */}
            {talent.allowContact && (
              <section>
                <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Send a Message
                </h2>
                <div className="rounded-xl border border-border bg-card p-6">
                  {sent ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Icon icon="solar:check-circle-bold" className="text-xl" />
                      <span className="font-mono text-sm">Message sent successfully.</span>
                    </div>
                  ) : (
                    <form onSubmit={sendContact} className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Write your message to ${displayName}…`}
                        rows={5}
                        minLength={10}
                        maxLength={2000}
                        required
                        className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      {sendError && (
                        <p className="font-mono text-xs text-red-400">{sendError}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          {message.length}/2000
                        </span>
                        <button
                          type="submit"
                          disabled={sending || message.length < 10}
                          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-bold text-primary-foreground transition-opacity disabled:opacity-50"
                        >
                          {sending && <Icon icon="solar:spinner-bold" className="animate-spin" />}
                          Send Message
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
