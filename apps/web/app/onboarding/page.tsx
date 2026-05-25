import React, { Suspense } from 'react';

import { Onboarding } from '../../components/onboarding';

export default function OnboardingPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading…
        </div>
      }
    >
      <Onboarding />
    </Suspense>
  );
}
