'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { CustomerInfo, Offerings } from '@revenuecat/purchases-js';

import { DEFAULT_RC_APP_USER_ID, hasJobscriptPro, initRevenueCat, JOBSCRIPT_PRO_ENTITLEMENT } from './revenuecat';

const RC_USER_STORAGE_KEY = 'team7_rc_app_user_id';

function readStoredAppUserId(): string {
  if (typeof window === 'undefined') return DEFAULT_RC_APP_USER_ID;
  try {
    const s = sessionStorage.getItem(RC_USER_STORAGE_KEY);
    return s?.trim() || DEFAULT_RC_APP_USER_ID;
  } catch {
    return DEFAULT_RC_APP_USER_ID;
  }
}

type BillingContextValue = {
  loading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | null;
  offerings: Offerings | null;
  jobscriptProActive: boolean;
  entitlementName: string;
  refresh: () => Promise<CustomerInfo>;
  appUserId: string;
  setAppUserId: (id: string) => void;
};

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [appUserId, setAppUserIdState] = useState(() => readStoredAppUserId());

  const setAppUserId = useCallback((id: string) => {
    const next = id.trim() || DEFAULT_RC_APP_USER_ID;
    setAppUserIdState(next);
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(RC_USER_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    const purchases = await initRevenueCat(appUserId);
    const info = await purchases.getCustomerInfo();
    setCustomerInfo(info);
    return info;
  }, [appUserId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const purchases = await initRevenueCat(appUserId);
        const [info, loadedOfferings] = await Promise.all([
          purchases.getCustomerInfo(),
          purchases.getOfferings(),
        ]);
        if (!cancelled) {
          setCustomerInfo(info);
          setOfferings(loadedOfferings);
        }
      } catch (err) {
        console.error('BillingProvider: RevenueCat load failed', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load billing state.');
          setCustomerInfo(null);
          setOfferings(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [appUserId]);

  const value = useMemo<BillingContextValue>(
    () => ({
      loading,
      error,
      customerInfo,
      offerings,
      entitlementName: JOBSCRIPT_PRO_ENTITLEMENT,
      jobscriptProActive: hasJobscriptPro(customerInfo),
      refresh,
      appUserId,
      setAppUserId,
    }),
    [loading, error, customerInfo, offerings, refresh, appUserId, setAppUserId],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) throw new Error('useBilling must be used inside BillingProvider.');
  return context;
}
