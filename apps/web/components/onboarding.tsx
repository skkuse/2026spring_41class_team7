'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { SocialAuthButtons } from './auth/social-auth-buttons';

export function Onboarding() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const authMessage = authError === 'auth' ? 'Authentication failed. Try again.' : null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-background" />
        <div className="absolute top-0 left-0 size-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 size-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-chart-2/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)]" />
      </div>
      <div className="relative z-10 w-full max-w-md animate-onboarding-enter">
        <div className="mb-12 flex flex-col items-center">
          <Image src="/logo-glyph.png" alt="Jobclaw" width={48} height={48} className="mb-4 h-12 w-12" />
          <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
        </div>
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-heading text-4xl font-bold tracking-tight">
            Claim your technical identity.
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            Join 15,000+ engineers leveraging AI to transform their code into career opportunities.
          </p>
        </div>
        <SocialAuthButtons />
        {authMessage ? (
          <p className="mt-4 text-center text-sm text-primary" role="alert">
            {authMessage}
          </p>
        ) : null}
        <p className="mt-12 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary underline-offset-4 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon
              icon="solar:arrow-left-linear"
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Jobclaw
          </Link>
        </div>
      </div>
    </div>
  );
}
