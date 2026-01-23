/**
 * Recovery Pulse - Grace Period Hook
 * 7-Day Complimentary Sovereign Access
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, addDays, subDays } from 'date-fns';

const FIRST_LAUNCH_KEY = '@recovery_pulse_first_launch';
const GRACE_PERIOD_DAYS = 7;

interface GracePeriodState {
  isLoading: boolean;
  isInGracePeriod: boolean;
  daysLeft: number;
  firstLaunchDate: Date | null;
  graceEndDate: Date | null;
}

export const useGracePeriod = () => {
  const [state, setState] = useState<GracePeriodState>({
    isLoading: true,
    isInGracePeriod: true, // Assume grace until proven otherwise
    daysLeft: GRACE_PERIOD_DAYS,
    firstLaunchDate: null,
    graceEndDate: null,
  });

  const checkGracePeriod = useCallback(async () => {
    try {
      let firstLaunchStr = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

      // First time launch - save the date
      if (!firstLaunchStr) {
        const now = new Date();
        firstLaunchStr = now.toISOString();
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, firstLaunchStr);
      }

      const firstLaunchDate = new Date(firstLaunchStr);
      const graceEndDate = addDays(firstLaunchDate, GRACE_PERIOD_DAYS);
      const now = new Date();

      // Calculate days left
      const daysPassed = differenceInDays(now, firstLaunchDate);
      const daysLeft = Math.max(0, GRACE_PERIOD_DAYS - daysPassed);
      const isInGracePeriod = daysLeft > 0;

      setState({
        isLoading: false,
        isInGracePeriod,
        daysLeft,
        firstLaunchDate,
        graceEndDate,
      });
    } catch {
      // On error, give benefit of the doubt
      setState({
        isLoading: false,
        isInGracePeriod: true,
        daysLeft: GRACE_PERIOD_DAYS,
        firstLaunchDate: null,
        graceEndDate: null,
      });
    }
  }, []);

  // For testing: expire grace period (set first launch to 8 days ago)
  const resetGracePeriod = useCallback(async () => {
    const expiredDate = subDays(new Date(), GRACE_PERIOD_DAYS + 1);
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, expiredDate.toISOString());
    await checkGracePeriod();
  }, [checkGracePeriod]);

  useEffect(() => {
    checkGracePeriod();
  }, [checkGracePeriod]);

  return {
    ...state,
    refresh: checkGracePeriod,
    resetGracePeriod, // Dev only
  };
};
