'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useApi } from '../../../lib/api-context';
import { UserMenu } from '../../user-menu';

type TalentItem = {
  userId: string;
  fullName: string;
  role: string;
  location: string;
  website: string | null;
  allowContact: boolean;
  bestScore: number | null;
  assessmentCount: number;
  isShortlisted: boolean;
};

export default function TalentDirectoryPage() {
  const { get, post, delete: del } = useApi();
  const [items, setItems] = useState<TalentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<{ items: TalentItem[]; total: number }>('/v1/talent')
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [get]);

  async function toggleShortlist(item: TalentItem) {
    if (item.isShortlisted) {
      await del(`/v1/shortlist/${item.userId}`).catch(() => null);
    } else {
      await post('/v1/shortlist', { devUserId: item.userId }).catch(() => null);
    }
    setItems((prev) =>
      prev.map((i) => (i.userId === item.userId ? { ...i, isShortlisted: !i.isShortlisted } : i)),
    );
  }

  function scoreColor(score: number) {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Image src="/logo.png" alt="Jobclaw" width={120} height={32} priority />
        <UserMenu />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Talent Directory</h1>
          <p className="mt-1 text-muted-foreground">
            Developers sorted by their highest assessment score.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            No developers with assessments yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Developer</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-center font-semibold">Best Score</th>
                  <th className="px-4 py-3 text-center font-semibold">Assessments</th>
                  <th className="px-4 py-3 text-center font-semibold">Save</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.userId}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-secondary/20 ${idx % 2 === 0 ? '' : 'bg-secondary/10'}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/company/talent/${item.userId}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {item.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.location}</td>
                    <td className="px-4 py-3 text-center">
                      {item.bestScore != null ? (
                        <span className={`font-mono font-bold text-lg ${scoreColor(item.bestScore)}`}>
                          {item.bestScore}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.assessmentCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleShortlist(item)}
                        className="transition-colors hover:text-primary"
                        title={item.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        <Icon
                          icon={item.isShortlisted ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}
                          className={`text-xl ${item.isShortlisted ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
