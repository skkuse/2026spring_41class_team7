'use client';

import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useApi } from '../../../lib/api-context';
import { useProfile } from '../../../lib/profile-context';

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const { post } = useApi();
  const { isLoading, refetch } = useProfile();
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setSubmitting(true);
    try {
      await post('/v1/companies', {
        name: companyName.trim(),
        industry: industry.trim() || undefined,
      });
      refetch();
      router.push('/company/talent');
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

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 mx-auto flex size-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_30px_rgba(217,119,87,0.4)]">
            <Icon icon="solar:buildings-bold" className="text-3xl text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight">Set up your company</h1>
          <p className="text-muted-foreground text-sm">Tell us about your company to start hiring developers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium text-muted-foreground">
              Company name <span className="text-destructive">*</span>
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium text-muted-foreground">
              Industry <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech, SaaS, Healthcare"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!companyName.trim() || submitting}
            className="w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {submitting ? 'Setting up…' : 'Continue as Company'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 w-full text-center font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}
