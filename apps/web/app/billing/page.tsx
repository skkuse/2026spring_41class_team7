
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { useBilling } from '../../lib/billing-context';
import { initRevenueCat } from '../../lib/revenuecat';

const PRODUCT_IDS = ['monthly', 'yearly', 'lifetime'];

export default function BillingPage() {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const paywallTargetRef = useRef<HTMLDivElement | null>(null);

  const api = useApi();
  const { authToken } = api;
  const {
    loading,
    error: billingError,
    offerings,
    customerInfo,
    entitlementName,
    jobscriptProActive,
    refresh,
    appUserId,
    setAppUserId,
  } = useBilling();
  const [rcUserInput, setRcUserInput] = useState(appUserId);

  useEffect(() => {
    setRcUserInput(appUserId);
  }, [appUserId]);

  const packageMap = useMemo(() => {
    const currentPackages = offerings?.current?.availablePackages ?? [];
    const map = new Map<string, any>();
    for (const pkg of currentPackages) {
      const id = pkg.identifier ?? pkg.webBillingProduct.identifier;
      if (id) map.set(id, pkg);
    }
    return map;
  }, [offerings]);

  async function handlePurchase(productId: string) {
    try {
      setPurchasingId(productId);
      setError(null);
      setMessage(null);
      const purchases = await initRevenueCat(appUserId);
      const pkg = packageMap.get(productId);
      if (!pkg) throw new Error(`Package not found for product id: ${productId}`);
      await purchases.purchasePackage(pkg);
      await refresh();
      setMessage('Purchase successful. Customer info refreshed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed.');
    } finally {
      setPurchasingId(null);
    }
  }

  async function handleRestore() {
    try {
      setError(null);
      setMessage(null);
      // Web Billing SDK has no restorePurchases(); re-fetch subscriber state from RevenueCat.
      await refresh();
      setMessage('Subscription state refreshed from RevenueCat.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed.');
    }
  }

  async function handlePaywall() {
    try {
      setError(null);
      const purchases = await initRevenueCat(appUserId);
      if (!purchases.presentPaywall) throw new Error('presentPaywall is not available.');
      if (!paywallTargetRef.current) throw new Error('Missing paywall target element.');
      await purchases.presentPaywall({
        htmlTarget: paywallTargetRef.current,
        offering: offerings?.current ?? undefined,
      });
      await refresh();
      setMessage('Paywall completed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not present paywall.');
    }
  }

  async function bootstrapMockData() {
    try {
      setError(null);
      const result = await api.post<{ profileCreated: boolean; documentsCreated: number; invoicesCreated: number }>(
        '/v1/bootstrap',
      );
      setMessage(`Bootstrap done: profile=${result.profileCreated}, docs=${result.documentsCreated}, invoices=${result.invoicesCreated}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bootstrap failed.');
    }
  }

  async function loadMe() {
    try {
      setError(null);
      const me = await api.get<{ fullName: string; email: string }>('/v1/me');
      setMessage(`GET /v1/me: ${me.fullName} (${me.email})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GET /v1/me failed.');
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Jobscript Billing</h1>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xl font-semibold">API Provider (GET/POST)</h2>
          <p className="text-sm text-muted-foreground">
            After you <Link href="/login" className="text-primary underline">sign in</Link>, the Supabase session access token is attached to every{' '}
            <code className="text-xs">api.get</code> / <code className="text-xs">api.post</code> automatically. Override below only if you need to debug.
          </p>
          {authToken ? (
            <p className="text-xs font-mono text-muted-foreground break-all">Active token: {authToken.slice(0, 24)}…</p>
          ) : (
            <p className="text-xs text-amber-400">No token yet — sign in or paste a JWT.</p>
          )}
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Optional: paste access token (override)"
            className="w-full rounded border border-border bg-black/30 px-3 py-2"
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => api.setAuthToken(tokenInput || null)} className="px-3 py-2 rounded border border-border">Set Token</button>
            <button onClick={() => api.setAuthToken(null)} className="px-3 py-2 rounded border border-border">Clear Token</button>
            <button onClick={() => void bootstrapMockData()} className="px-3 py-2 rounded border border-border">POST /v1/bootstrap</button>
            <button onClick={() => void loadMe()} className="px-3 py-2 rounded border border-border">GET /v1/me</button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xl font-semibold">RevenueCat app user</h2>
          <p className="text-sm text-muted-foreground">Must match the user you identify in production (e.g. Supabase user id).</p>
          <div className="flex gap-2 flex-wrap items-center">
            <input
              value={rcUserInput}
              onChange={(e) => setRcUserInput(e.target.value)}
              className="flex-1 min-w-[200px] rounded border border-border bg-black/30 px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setAppUserId(rcUserInput)}
              className="px-3 py-2 rounded border border-border"
            >
              Apply user id
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xl font-semibold">Subscription Status</h2>
          {billingError ? <p className="text-red-400">{billingError}</p> : null}
          {loading ? <p>Loading customer info...</p> : <p>{entitlementName}: <span className={jobscriptProActive ? 'text-emerald-400' : 'text-zinc-400'}>{jobscriptProActive ? 'ACTIVE' : 'INACTIVE'}</span></p>}
          <button onClick={() => void refresh()} className="px-3 py-2 rounded border border-border">Refresh Customer Info</button>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xl font-semibold">Offerings</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {PRODUCT_IDS.map((id) => (
              <button
                key={id}
                disabled={loading || purchasingId === id || !packageMap.get(id)}
                onClick={() => void handlePurchase(id)}
                className="px-4 py-3 rounded border border-border disabled:opacity-50"
              >
                {purchasingId === id ? 'Purchasing...' : `Buy ${id}`}
              </button>
            ))}
          </div>
          <button onClick={() => void handleRestore()} className="px-4 py-2 rounded border border-border">Refresh subscription state</button>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xl font-semibold">RevenueCat Paywall</h2>
          <button onClick={() => void handlePaywall()} className="px-4 py-2 rounded bg-primary text-black font-semibold">Present Paywall</button>
          <div ref={paywallTargetRef} className="min-h-[120px] rounded border border-dashed border-border p-3" />
        </section>

        {customerInfo?.managementURL ? (
          <a href={customerInfo.managementURL} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded border border-border">Manage Subscription</a>
        ) : null}

        {error ? <p className="text-red-400">{error}</p> : null}
        {message ? <p className="text-cyan-300">{message}</p> : null}
      </div>
    </main>
  );
}
