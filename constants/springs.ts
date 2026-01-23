/**
 * Recovery Pulse - Animation Springs
 * Always use withSpring() for motion, never withTiming()
 */

import { WithSpringConfig } from 'react-native-reanimated';

export const SPRINGS = {
  // General UI transitions - smooth and elegant
  smooth: {
    damping: 20,
    stiffness: 100,
  } as WithSpringConfig,

  // Button press feedback - quick response
  snappy: {
    damping: 15,
    stiffness: 250,
  } as WithSpringConfig,

  // Playful bounces - fun interactions
  bouncy: {
    damping: 12,
    stiffness: 180,
  } as WithSpringConfig,

  // Heavy/important actions - weighty feel
  heavy: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  } as WithSpringConfig,

  // Gentle fade-ins
  gentle: {
    damping: 25,
    stiffness: 80,
  } as WithSpringConfig,

  // LUXURY ENTRANCE - zero overshoot, heavy & expensive
  // Cards slide into place and STOP DEAD
  luxury: {
    damping: 28, // High damping = no bounce
    stiffness: 80, // Low stiffness = slower, heavier motion
    mass: 1.2, // Heavier mass = more weight
  } as WithSpringConfig,

  // LUXURY RETURN - smooth exit without vibration
  luxuryReturn: {
    damping: 25,
    stiffness: 90,
    mass: 1,
  } as WithSpringConfig,
} as const;

// Haptic lead time in milliseconds
export const HAPTIC_LEAD_TIME = 16;
