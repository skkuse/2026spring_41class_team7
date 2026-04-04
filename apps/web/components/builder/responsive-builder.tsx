'use client';

import { useState } from 'react';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { BuilderDesktop } from './builder-desktop';
import { BuilderMobile } from './builder-mobile';
import { BuilderTablet } from './builder-tablet';

export function ResponsiveBuilder() {
  const bp = useHomeBreakpoint();
  const [githubConnected, setGithubConnected] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [stack, setStack] = useState('Rust, K8s');
  const [role, setRole] = useState('Senior Engineer');
  const [status, setStatus] = useState('');

  const onRun = () => {
    if (!githubConnected) {
      setStatus('Connect GitHub first.');
      return;
    }
    const doc = resumeFile ? resumeFile.name : 'no file';
    setStatus(`Engine started for ${role} (${stack}) · ${doc}`);
  };

  const props = {
    githubConnected,
    onConnectGithub: () => setGithubConnected((c) => !c),
    resumeFile,
    onResumeFile: setResumeFile,
    stack,
    setStack,
    role,
    setRole,
    status,
    onRun,
  };

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <BuilderDesktop {...props} />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <BuilderTablet {...props} />
        {nav}
      </>
    );
  }
  return (
    <>
      <BuilderMobile {...props} />
      {nav}
    </>
  );
}
