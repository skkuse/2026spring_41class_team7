'use client';

import { useState } from 'react';

import { profile } from '../../lib/mock-data';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { SettingsDesktop } from './settings-desktop';
import { SettingsMobile } from './settings-mobile';
import { SettingsTablet } from './settings-tablet';
import type { ProfileForm } from './settings-types';

export function ResponsiveSettings() {
  const bp = useHomeBreakpoint();
  const [form, setForm] = useState<ProfileForm>(profile);
  const [saved, setSaved] = useState('');

  const update = (key: keyof ProfileForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = () => setSaved(`Saved ${form.name} at ${new Date().toLocaleTimeString()}`);

  const props = { form, update, saved, onSave };

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
