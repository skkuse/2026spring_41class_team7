'use client';

import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useApi } from '../../../lib/api-context';
import { useProfile } from '../../../lib/profile-context';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { patch, post } = useApi();
  const { profile, isLoading, refetch } = useProfile();
  const [selected, setSelected] = useState<'DEVELOPER' | 'COMPANY' | null>(null);
  const [devName, setDevName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if role already set
  useEffect(() => {
    if (!isLoading && profile?.userType === 'DEVELOPER') router.replace('/home');
    if (!isLoading && profile?.userType === 'COMPANY') router.replace('/company/talent');
  }, [isLoading, profile, router]);

  async function handleSubmit() {
    if (!selected) return;
    if (selected === 'COMPANY' && !companyName.trim()) return;
    setSubmitting(true);
    try {
      if (selected === 'DEVELOPER') {
        await patch('/v1/me', { userType: 'DEVELOPER', fullName: devName.trim() });
        refetch();
        router.push('/home');
      } else {
        await post('/v1/companies', {
          name: companyName.trim(),
          industry: industry.trim() || undefined,
        });
        refetch();
        router.push('/company/talent');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Icon icon="solar:spinner-bold" className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-background" />
        <div className="absolute top-0 left-0 size-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/15 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-10 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_30px_rgba(217,119,87,0.4)] mx-auto">
            <Icon icon="solar:bolt-bold" className="text-3xl text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight">Who are you?</h1>
          <p className="text-muted-foreground">Choose your role to get started.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <button
            type="button"
            onClick={() => setSelected('DEVELOPER')}
            className={`rounded-xl border-2 p-6 text-left transition-all ${
              selected === 'DEVELOPER'
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <Icon icon="solar:code-bold" className="mb-3 text-3xl text-primary" />
            <div className="font-semibold">I&apos;m a Developer</div>
            <div className="mt-1 text-sm text-muted-foreground">Build your technical identity with AI assessments</div>
          </button>

          <button
            type="button"
            onClick={() => setSelected('COMPANY')}
            className={`rounded-xl border-2 p-6 text-left transition-all ${
              selected === 'COMPANY'
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <Icon icon="solar:buildings-bold" className="mb-3 text-3xl text-primary" />
            <div className="font-semibold">I&apos;m a Company</div>
            <div className="mt-1 text-sm text-muted-foreground">Hire developers based on verified code quality</div>
          </button>
        </div>

        {selected === 'DEVELOPER' && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">How should we call you?</p>
            <input
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              placeholder="Your full name"
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        )}

        {selected === 'COMPANY' && (
          <div className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name *"
              className="w-full rounded border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Industry (optional)"
              className="w-full rounded border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selected || submitting || (selected === 'COMPANY' && !companyName.trim()) || (selected === 'DEVELOPER' && !devName.trim())}
          className="w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {submitting ? 'Setting up…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
