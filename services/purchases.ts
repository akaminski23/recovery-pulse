/**
 * Recovery Pulse - RevenueCat Purchases Service
 * Sovereign Freemium Strategy
 *
 * Note: RevenueCat requires native build. In Expo Go, mock functions are used.
 */

import { Platform } from 'react-native';

// RevenueCat Configuration - Recovery Pulse
const REVENUECAT_API_KEY_IOS = 'appl_THHrREEATFDsxxAqATZRasuPwsS';
const ENTITLEMENT_ID = 'Recovery Pulse Pro';

// Product identifiers (must match App Store Connect)
export const PRODUCT_IDS = {
  ANNUAL: 'com.recoverypulse.app.annual',    // $79.99/year with 7-day trial
  MONTHLY: 'com.recoverypulse.app.monthly',  // $12.99/month with 7-day trial
} as const;

// Check if native module is available
let Purchases: any = null;
let isNativeAvailable = false;

try {
  Purchases = require('react-native-purchases').default;
  isNativeAvailable = true;
} catch {
  // Native module not available - using mock in Expo Go
}

// Shared Pro state — all useSubscription hooks read from this
let _isProGlobal = false;
type ProListener = (isPro: boolean) => void;
const _listeners = new Set<ProListener>();

export const setProStatus = (isPro: boolean) => {
  _isProGlobal = isPro;
  _listeners.forEach((fn) => fn(isPro));
};
export const getProStatus = () => _isProGlobal;
export const onProStatusChange = (fn: ProListener) => {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
};

// Type definitions for when native module isn't available
export interface CustomerInfo {
  entitlements: {
    active: {
      [key: string]: {
        periodType: string;
        expirationDate: string | null;
      } | undefined;
    };
  };
}

export interface PurchasesPackage {
  product: {
    priceString: string;
    identifier?: string;
  };
  packageType: string;
}

export interface PurchasesOffering {
  annual: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
  availablePackages: PurchasesPackage[];
}

/**
 * Initialize RevenueCat SDK
 * Call this once in app root layout
 */
export const initializePurchases = async (): Promise<void> => {
  if (!isNativeAvailable) {
    return;
  }
  try {
    const { LOG_LEVEL } = require('react-native-purchases');
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
  } catch (error) {
    console.error('[Purchases] Failed to initialize:', error);
  }
};

/**
 * Mock customer info for development
 */
const MOCK_CUSTOMER_INFO: CustomerInfo = {
  entitlements: {
    active: {
      // Uncomment to simulate Pro access in dev:
      // [ENTITLEMENT_ID]: { periodType: 'TRIAL', expirationDate: null },
    },
  },
};

/**
 * Get current customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isNativeAvailable) {
    return MOCK_CUSTOMER_INFO;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return info;
  } catch (error) {
    console.error('[Purchases] Failed to get customer info:', error);
    return null;
  }
};

/**
 * Check if user has Pro entitlement
 */
export const checkProEntitlement = (info: CustomerInfo): boolean => {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
};

/**
 * Check if user is in trial period
 */
export const isTrialActive = (info: CustomerInfo): boolean => {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return false;
  return entitlement.periodType === 'TRIAL';
};

/**
 * Get trial end date if in trial
 */
export const getTrialEndDate = (info: CustomerInfo): Date | null => {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement || entitlement.periodType !== 'TRIAL') return null;
  return entitlement.expirationDate
    ? new Date(entitlement.expirationDate)
    : null;
};

/**
 * Mock offerings for development
 */
const MOCK_ANNUAL_PACKAGE: PurchasesPackage = {
  product: { priceString: '$79.99', identifier: PRODUCT_IDS.ANNUAL },
  packageType: 'ANNUAL',
};

const MOCK_MONTHLY_PACKAGE: PurchasesPackage = {
  product: { priceString: '$12.99', identifier: PRODUCT_IDS.MONTHLY },
  packageType: 'MONTHLY',
};

const MOCK_OFFERING: PurchasesOffering = {
  annual: MOCK_ANNUAL_PACKAGE,
  monthly: MOCK_MONTHLY_PACKAGE,
  availablePackages: [MOCK_ANNUAL_PACKAGE, MOCK_MONTHLY_PACKAGE],
};

/**
 * Get current offering (pricing)
 */
export const getCurrentOffering = async (): Promise<PurchasesOffering | null> => {
  if (!isNativeAvailable) {
    return MOCK_OFFERING;
  }
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('[Purchases] Failed to get offerings:', error);
    return null;
  }
};

/**
 * Get the annual package from offerings
 */
export const getAnnualPackage = async (): Promise<PurchasesPackage | null> => {
  const offering = await getCurrentOffering();
  if (!offering) return null;
  return offering.annual || offering.availablePackages.find(p => p.packageType === 'ANNUAL') || null;
};

/**
 * Get the monthly package from offerings
 */
export const getMonthlyPackage = async (): Promise<PurchasesPackage | null> => {
  const offering = await getCurrentOffering();
  if (!offering) return null;
  return offering.monthly || offering.availablePackages.find(p => p.packageType === 'MONTHLY') || null;
};

/**
 * Get both packages for paywall
 */
export const getPaywallPackages = async (): Promise<{
  annual: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
}> => {
  const offering = await getCurrentOffering();
  if (!offering) return { annual: null, monthly: null };

  return {
    annual: offering.annual || offering.availablePackages.find(p => p.packageType === 'ANNUAL') || null,
    monthly: offering.monthly || offering.availablePackages.find(p => p.packageType === 'MONTHLY') || null,
  };
};

/**
 * Purchase a package
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo: CustomerInfo | null }> => {
  if (!isNativeAvailable) {
    // Mock purchase for Expo Go development
    const mockInfo: CustomerInfo = {
      entitlements: {
        active: {
          [ENTITLEMENT_ID]: { periodType: 'TRIAL', expirationDate: null },
        },
      },
    };
    return { success: true, customerInfo: mockInfo };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = checkProEntitlement(customerInfo);
    if (isPro) setProStatus(true);
    return { success: isPro, customerInfo };
  } catch (error: any) {
    // Always re-check entitlement — purchase may have succeeded despite error
    // (sandbox race condition, "already subscribed" dialog, etc.)
    try {
      const freshInfo = await Purchases.getCustomerInfo();
      if (checkProEntitlement(freshInfo)) {
        setProStatus(true);
        return { success: true, customerInfo: freshInfo };
      }
    } catch {
      // ignore re-check failure
    }
    // User cancelled (and not subscribed)
    if (error.userCancelled) {
      return { success: false, customerInfo: null };
    }
    console.error('[Purchases] Purchase failed:', error);
    return { success: false, customerInfo: null };
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo: CustomerInfo | null;
}> => {
  if (!isNativeAvailable) {
    // Mock restore for Expo Go development
    return { success: false, customerInfo: MOCK_CUSTOMER_INFO };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: checkProEntitlement(customerInfo), customerInfo };
  } catch (error) {
    console.error('[Purchases] Restore failed:', error);
    return { success: false, customerInfo: null };
  }
};

/**
 * Format price for display
 */
export const formatPrice = (pkg: PurchasesPackage): string => {
  return pkg.product.priceString;
};

/**
 * Get price per period description
 */
export const getPriceDescription = (pkg: PurchasesPackage): string => {
  const price = pkg.product.priceString;
  switch (pkg.packageType) {
    case 'ANNUAL':
      return `${price}/year`;
    case 'MONTHLY':
      return `${price}/month`;
    case 'WEEKLY':
      return `${price}/week`;
    default:
      return price;
  }
};
