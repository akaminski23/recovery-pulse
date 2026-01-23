/**
 * Recovery Pulse - Haptic Feedback Hook
 * 16ms lead time for haptic-first pattern
 */

import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { HAPTIC_LEAD_TIME } from '../constants/springs';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export const useHaptic = () => {
  /**
   * Trigger haptic feedback
   */
  const trigger = useCallback((style: HapticStyle = 'light') => {
    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }, []);

  /**
   * HAPTIC-FIRST PATTERN
   * Haptic fires BEFORE action with 16ms lead time
   * This creates a more responsive feel
   */
  const withHaptic = useCallback(
    <T extends (...args: unknown[]) => void>(
      callback: T,
      style: HapticStyle = 'light'
    ): ((...args: Parameters<T>) => void) => {
      return (...args: Parameters<T>) => {
        trigger(style);
        // 16ms delay for haptic to register before visual feedback
        setTimeout(() => callback(...args), HAPTIC_LEAD_TIME);
      };
    },
    [trigger]
  );

  /**
   * Wrap an async callback with haptic feedback
   */
  const withHapticAsync = useCallback(
    <T extends (...args: unknown[]) => Promise<unknown>>(
      callback: T,
      style: HapticStyle = 'light'
    ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        trigger(style);
        await new Promise((resolve) => setTimeout(resolve, HAPTIC_LEAD_TIME));
        return callback(...args) as Promise<ReturnType<T>>;
      };
    },
    [trigger]
  );

  return {
    trigger,
    withHaptic,
    withHapticAsync,
  };
};
