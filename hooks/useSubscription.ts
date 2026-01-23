/**
 * Recovery Pulse - Subscription Hook
 * Manages Pro subscription state with dual pricing
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerInfo,
  checkProEntitlement,
  isTrialActive,
  getTrialEndDate,
  getPaywallPackages,
  purchasePackage,
  restorePurchases,
  formatPrice,
  PurchasesPackage,
} from '../services/purchases';

interface SubscriptionState {
  isLoading: boolean;
  isPro: boolean;
  isTrialing: boolean;
  trialEndDate: Date | null;
  annualPackage: PurchasesPackage | null;
  monthlyPackage: PurchasesPackage | null;
  annualPrice: string | null;
  monthlyPrice: string | null;
  error: string | null;
}

interface UseSubscriptionReturn extends SubscriptionState {
  refresh: () => Promise<void>;
  subscribeAnnual: () => Promise<boolean>;
  subscribeMonthly: () => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isPro: false,
    isTrialing: false,
    trialEndDate: null,
    annualPackage: null,
    monthlyPackage: null,
    annualPrice: null,
    monthlyPrice: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [customerInfo, packages] = await Promise.all([
        getCustomerInfo(),
        getPaywallPackages(),
      ]);

      if (customerInfo) {
        const isPro = checkProEntitlement(customerInfo);
        const isTrialing = isTrialActive(customerInfo);
        const trialEndDate = getTrialEndDate(customerInfo);

        setState({
          isLoading: false,
          isPro,
          isTrialing,
          trialEndDate,
          annualPackage: packages.annual,
          monthlyPackage: packages.monthly,
          annualPrice: packages.annual ? formatPrice(packages.annual) : '$79.99',
          monthlyPrice: packages.monthly ? formatPrice(packages.monthly) : '$12.99',
          error: null,
        });
      } else {
        setState({
          isLoading: false,
          isPro: false,
          isTrialing: false,
          trialEndDate: null,
          annualPackage: packages.annual,
          monthlyPackage: packages.monthly,
          annualPrice: packages.annual ? formatPrice(packages.annual) : '$79.99',
          monthlyPrice: packages.monthly ? formatPrice(packages.monthly) : '$12.99',
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load subscription status',
      }));
    }
  }, []);

  const subscribeAnnual = useCallback(async (): Promise<boolean> => {
    if (!state.annualPackage) {
      setState((prev) => ({ ...prev, error: 'Annual package not available' }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { success, customerInfo } = await purchasePackage(state.annualPackage);

    if (success && customerInfo) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPro: true,
        isTrialing: isTrialActive(customerInfo),
        trialEndDate: getTrialEndDate(customerInfo),
        error: null,
      }));
      return true;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: null, // Don't show error for cancellation
    }));
    return false;
  }, [state.annualPackage]);

  const subscribeMonthly = useCallback(async (): Promise<boolean> => {
    if (!state.monthlyPackage) {
      setState((prev) => ({ ...prev, error: 'Monthly package not available' }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { success, customerInfo } = await purchasePackage(state.monthlyPackage);

    if (success && customerInfo) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPro: true,
        isTrialing: false, // Monthly has no trial
        trialEndDate: null,
        error: null,
      }));
      return true;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: null,
    }));
    return false;
  }, [state.monthlyPackage]);

  const restore = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { success, customerInfo } = await restorePurchases();

    if (success && customerInfo) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPro: true,
        isTrialing: isTrialActive(customerInfo),
        trialEndDate: getTrialEndDate(customerInfo),
        error: null,
      }));
      return true;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: success ? null : 'No purchases to restore',
    }));
    return false;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    subscribeAnnual,
    subscribeMonthly,
    restore,
  };
};
