'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  function scoreColor(score: number) {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon icon="solar:bolt-bold" className="text-2xl text-primary" />
          <span className="font-heading text-xl font-black tracking-tighter">
            Job<span className="text-primary">claw</span>
          </span>
        </div>
        <Link
          href="/company/talent"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon icon="solar:arrow-left-linear" />
          Back to directory
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
          </div>
        ) : notFound || !talent ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Developer not found.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile card */}
            <div className="rounded-xl border border-border bg-card p-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{talent.fullName}</h1>
                <p className="text-muted-foreground">{talent.role}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {talent.location && (
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:map-point-linear" />
                      {talent.location}
                    </span>
                  )}
                  {talent.website && (
                    <a
                      href={talent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Icon icon="solar:link-linear" />
                      {talent.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleShortlist}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <Icon
                  icon={talent.isShortlisted ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}
                  className={talent.isShortlisted ? 'text-primary' : ''}
                />
                {talent.isShortlisted ? 'Shortlisted' : 'Save'}
              </button>
            </div>

            {/* Assessments */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">Assessments</h2>
              {talent.assessments.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
                  No assessments yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-secondary/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Repository</th>
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-center font-semibold">Score</th>
                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {talent.assessments.map((a, idx) => (
                        <tr
                          key={a.id}
                          className={`border-b border-border last:border-0 transition-colors hover:bg-secondary/20 ${idx % 2 === 0 ? '' : 'bg-secondary/10'}`}
                        >
                          <td className="px-4 py-3">
                            <a
                              href={a.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <Icon icon="solar:code-square-linear" className="shrink-0" />
                              {a.repoOwner}/{a.repoName}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">
                            {a.assessmentType.toLowerCase()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-mono font-bold text-lg ${scoreColor(a.overallScore)}`}>
                              {a.overallScore}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(a.generatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Contact form */}
            {talent.allowContact && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Contact Developer</h2>
                <div className="rounded-xl border border-border bg-card p-6">
                  {sent ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Icon icon="solar:check-circle-bold" />
                      Message sent successfully.
                    </div>
                  ) : (
                    <form onSubmit={sendContact} className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message (10–2000 characters)..."
                        rows={5}
                        minLength={10}
                        maxLength={2000}
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      {sendError && (
                        <p className="text-sm text-red-400">{sendError}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{message.length}/2000</span>
                        <button
                          type="submit"
                          disabled={sending || message.length < 10}
                          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
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
