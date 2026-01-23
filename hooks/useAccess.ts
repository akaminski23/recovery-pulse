/**
 * Recovery Pulse - Access Control Hook
 * Combines Subscription + 7-Day Grace Period
 *
 * Access Logic:
 * hasFullAccess = isPro || isTrialing || isInGracePeriod
 */

import { useSubscription } from './useSubscription';
import { useGracePeriod } from './useGracePeriod';

export const useAccess = () => {
  const subscription = useSubscription();
  const gracePeriod = useGracePeriod();

  // Combined loading state
  const isLoading = subscription.isLoading || gracePeriod.isLoading;

  // Full access if: subscribed OR in RevenueCat trial OR in grace period
  const hasFullAccess =
    subscription.isPro ||
    subscription.isTrialing ||
    gracePeriod.isInGracePeriod;

  // Is in complimentary grace period (not paid subscription)
  const isInComplimentaryAccess =
    !subscription.isPro &&
    !subscription.isTrialing &&
    gracePeriod.isInGracePeriod;

  // Days left in grace period (only relevant if in complimentary access)
  const graceDaysLeft = gracePeriod.daysLeft;

  return {
    // Access control
    isLoading,
    hasFullAccess,
    isLocked: !hasFullAccess && !isLoading,

    // Grace period info
    isInComplimentaryAccess,
    graceDaysLeft,

    // Subscription info (pass through)
    isPro: subscription.isPro,
    isTrialing: subscription.isTrialing,
    annualPrice: subscription.annualPrice,
    monthlyPrice: subscription.monthlyPrice,
    error: subscription.error,

    // Actions
    subscribeAnnual: subscription.subscribeAnnual,
    subscribeMonthly: subscription.subscribeMonthly,
    restore: subscription.restore,
    refresh: subscription.refresh,
  };
};
