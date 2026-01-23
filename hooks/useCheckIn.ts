/**
 * Recovery Pulse - Check-In Hook
 * CRUD operations for daily check-ins
 */

import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  createCheckIn,
  getTodayCheckIn,
  getRecentCheckIns,
  getAverageRecoveryScore,
  updateCheckIn,
} from '../db/queries';
import { CheckIn } from '../db/schema';

interface CheckInData {
  sleepHours: number;
  sleepQuality: number;
  fatigue: number;
  soreness: number;
  notes?: string;
}

export const useCheckIn = () => {
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      const today = getTodayCheckIn();
      setTodayCheckIn(today || null);

      const recent = getRecentCheckIns(7);
      setRecentCheckIns(recent);

      const avg = getAverageRecoveryScore(7);
      setAverageScore(avg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Refresh when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  /**
   * Submit a new check-in or update existing
   */
  const submitCheckIn = useCallback(
    (data: CheckInData): CheckIn => {
      let result: CheckIn;

      if (todayCheckIn) {
        // Update existing check-in
        const updated = updateCheckIn(todayCheckIn.id, data);
        if (!updated) throw new Error('Failed to update check-in');
        result = updated;
      } else {
        // Create new check-in
        result = createCheckIn(data);
      }

      // Refresh data
      refresh();
      return result;
    },
    [todayCheckIn, refresh]
  );

  /**
   * Check if user has completed today's check-in
   */
  const hasCheckedInToday = todayCheckIn !== null;

  return {
    todayCheckIn,
    recentCheckIns,
    averageScore,
    isLoading,
    hasCheckedInToday,
    submitCheckIn,
    refresh,
  };
};
