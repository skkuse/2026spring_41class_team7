
'use client';

import { ApiProvider } from '../lib/api-context';
import { BillingProvider } from '../lib/billing-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      <BillingProvider>{children}</BillingProvider>
    </ApiProvider>
  );
}
