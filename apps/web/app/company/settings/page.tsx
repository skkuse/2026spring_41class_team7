'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CompanyHeader } from '../../../components/company/company-header';
import { useApi } from '../../../lib/api-context';
import { useProfile } from '../../../lib/profile-context';

export default function CompanySettingsPage() {
  const { patch } = useApi();
  const { profile, refetch } = useProfile();
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [allowContact, setAllowContact] = useState(false);
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.activeCompany?.name ?? '');
    setIndustry(profile.activeCompany?.industry ?? '');
    setAllowContact(profile.allowContact);
  }, [profile]);

  async function handleSave() {
    if (!companyName.trim() || !profile?.activeCompanyId) return;
    setSaving(true);
    try {
      await Promise.all([
        patch(`/v1/companies/${profile.activeCompanyId}`, {
          name: companyName.trim(),
          industry: industry.trim() || undefined,
        }),
        patch('/v1/me', { allowContact }),
      ]);
      refetch();
      setSaved(`Saved at ${new Date().toLocaleTimeString()}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompanyHeader />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/company/talent" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Talent Directory
          </Link>
        </div>

        <h1 className="mb-8 text-3xl font-bold">Company Settings</h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Company name <span className="text-destructive">*</span>
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full rounded border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Industry</label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech, SaaS, Healthcare"
              className="w-full rounded border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded border border-border bg-card px-4 py-3">
            <div>
              <p className="font-medium text-sm">Visible to developers</p>
              <p className="text-xs text-muted-foreground">Developers can see your company profile and you can contact them.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={allowContact}
              onClick={() => setAllowContact((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${allowContact ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow transform transition-transform ${allowContact ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!companyName.trim() || saving}
          className="mt-6 rounded bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-40 transition-opacity"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <p className="mt-3 text-sm text-primary">{saved}</p>}
      </main>
    </div>
  );
}
