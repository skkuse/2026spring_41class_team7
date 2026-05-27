'use client';

import { DashboardChrome } from '../components/home/dashboard-chrome';
import { ApiProvider } from '../lib/api-context';
import { BillingProvider } from '../lib/billing-context';
import { ProfileProvider } from '../lib/profile-context';
import { SupabaseAuthBridge } from '../lib/supabase-auth-bridge';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      <BillingProvider>
        <SupabaseAuthBridge>
          <ProfileProvider>
            <DashboardChrome>{children}</DashboardChrome>
          </ProfileProvider>
        </SupabaseAuthBridge>
      </BillingProvider>
    </ApiProvider>
  );
}
