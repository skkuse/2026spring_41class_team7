
'use client';

import { ApiProvider } from '../lib/api-context';
import { BillingProvider } from '../lib/billing-context';
import { SupabaseAuthBridge } from '../lib/supabase-auth-bridge';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      <BillingProvider>
        <SupabaseAuthBridge>{children}</SupabaseAuthBridge>
      </BillingProvider>
    </ApiProvider>
  );
}
