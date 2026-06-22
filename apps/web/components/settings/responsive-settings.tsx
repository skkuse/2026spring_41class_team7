'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { SettingsDesktop } from './settings-desktop';
import { SettingsMobile } from './settings-mobile';
import { SettingsTablet } from './settings-tablet';
import type { ProfileForm } from './settings-types';

const EMPTY_FORM: ProfileForm = { name: '', email: '', role: '', location: '', website: '', allowContact: false };

export function ResponsiveSettings() {
  const bp = useHomeBreakpoint();
  const { get, patch, authToken } = useApi();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    if (!authToken) { setLoading(false); return; }
    setLoading(true);
    get<{ fullName: string; email: string; role: string; location: string; website: string | null; allowContact: boolean }>('/v1/me')
      .then((data) => setForm({
        name: data.fullName,
        email: data.email,
        role: data.role,
        location: data.location,
        website: data.website ?? '',
        allowContact: data.allowContact ?? false,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [get, authToken]);

  const update = (key: keyof ProfileForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleAllowContact = async (value: boolean) => {
    setForm((f) => ({ ...f, allowContact: value }));
    setSavingContact(true);
    try {
      await patch('/v1/me', { allowContact: value });
    } catch (err: unknown) {
      console.error('Failed to save visibility:', err);
      setForm((f) => ({ ...f, allowContact: !value }));
    } finally {
      setSavingContact(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await patch('/v1/me', {
        fullName: form.name,
        role: form.role,
        location: form.location,
        website: form.website || null,
        allowContact: form.allowContact,
        userType: 'DEVELOPER',
      });
      setSaved('Saved');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSaved(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(''), 4000);
    }
  };

  const props = { form, update, onToggleAllowContact: toggleAllowContact, saved, onSave, saving, savingContact, loading };

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <SettingsDesktop {...props} />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <SettingsTablet {...props} />
        {nav}
      </>
    );
  }
  return (
    <>
      <SettingsMobile {...props} />
      {nav}
    </>
  );
}
