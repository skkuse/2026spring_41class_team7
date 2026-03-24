'use client';

import type { CustomerInfo, Purchases } from '@revenuecat/purchases-js';

const API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ?? '';
export const JOBSCRIPT_PRO_ENTITLEMENT = 'Jobscript Pro';
export const DEFAULT_RC_APP_USER_ID = 'jobscript-web-demo-user';

let purchasesModulePromise: Promise<typeof import('@revenuecat/purchases-js')> | null = null;
let purchasesInstance: Purchases | null = null;

async function loadPurchasesModule() {
  if (!purchasesModulePromise) {
    purchasesModulePromise = import('@revenuecat/purchases-js');
  }
  return purchasesModulePromise;
}

/**
 * Returns the configured Purchases singleton instance.
 * `Purchases.configure()` returns an instance (with getCustomerInfo, etc.); it is not the class constructor.
 */
export async function initRevenueCat(appUserId: string = DEFAULT_RC_APP_USER_ID): Promise<Purchases> {
  if (typeof window === 'undefined') {
    throw new Error('RevenueCat must be initialized in the browser.');
  }

  if (!API_KEY.trim()) {
    throw new Error('Set NEXT_PUBLIC_REVENUECAT_API_KEY in apps/web/.env.local (RevenueCat public SDK key).');
  }

  const mod = await loadPurchasesModule();
  const { Purchases: PurchasesClass, LogLevel } = mod;

  if (!purchasesInstance) {
    if (process.env.NODE_ENV !== 'production') {
      PurchasesClass.setLogLevel(LogLevel.Debug);
    }

    purchasesInstance = PurchasesClass.configure({
      apiKey: API_KEY,
      appUserId,
    });
  } else if (purchasesInstance.getAppUserId() !== appUserId) {
    await purchasesInstance.changeUser(appUserId);
  }

  return purchasesInstance;
}

export async function getCustomerInfo(appUserId?: string): Promise<CustomerInfo> {
  const purchases = await initRevenueCat(appUserId ?? DEFAULT_RC_APP_USER_ID);
  return purchases.getCustomerInfo();
}

export function hasJobscriptPro(customerInfo: CustomerInfo | null | undefined) {
  if (!customerInfo) return false;
  const { active, all } = customerInfo.entitlements;
  return Boolean(
    active[JOBSCRIPT_PRO_ENTITLEMENT] || all[JOBSCRIPT_PRO_ENTITLEMENT]?.isActive,
  );
}
