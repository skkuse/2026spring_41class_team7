'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { SettingsDesktop } from './settings-desktop';
import { SettingsMobile } from './settings-mobile';
import { SettingsTablet } from './settings-tablet';
import type { ProfileForm } from './settings-types';

const EMPTY_FORM: ProfileForm = { name: '', email: '', role: '', location: '', website: '' };

export function ResponsiveSettings() {
  const bp = useHomeBreakpoint();
  const { get, authToken } = useApi();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    if (!authToken) { setLoading(false); return; }
    setLoading(true);
    get<{ fullName: string; email: string; role: string; location: string; website: string | null }>('/v1/me')
      .then((data) => setForm({
        name: data.fullName,
        email: data.email,
        role: data.role,
        location: data.location,
        website: data.website ?? '',
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [get, authToken]);

  const update = (key: keyof ProfileForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = () => setSaved(`Saved at ${new Date().toLocaleTimeString()}`);

  const props = { form, update, saved, onSave, loading };

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
