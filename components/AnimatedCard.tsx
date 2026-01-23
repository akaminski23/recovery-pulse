/**
 * Recovery Pulse - Animated Card
 * DAMPED FLUIDITY PROTOCOL: Heavy, expensive, zero-bounce motion
 *
 * THE BILLIONAIRE PROTOCOL: Cards glide into place and STOP DEAD
 */

import React, { PropsWithChildren } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { SapphireCard } from './SapphireCard';
import { SPACING } from '../constants/theme';

interface AnimatedCardProps {
  index?: number;
  delay?: number;
  direction?: 'up' | 'down';
  style?: ViewStyle;
  padding?: keyof typeof SPACING | number;
}

// DAMPED FLUIDITY PROTOCOL
const STAGGER_DELAY = 150; // Slower cascade = more luxurious
const BASE_DURATION = 700; // Longer duration = heavier feel
const LUXURY_DAMPING = 28; // High damping = ZERO overshoot
const LUXURY_STIFFNESS = 80; // Low stiffness = slower, weighted motion

export const AnimatedCard: React.FC<PropsWithChildren<AnimatedCardProps>> = ({
  children,
  index = 0,
  delay = 0,
  direction = 'up',
  style,
  padding = 'lg',
}) => {
  const totalDelay = delay + index * STAGGER_DELAY;

  // LUXURY ENTRANCE: Slide in and STOP DEAD - no bounce, no vibration
  const entering =
    direction === 'up'
      ? FadeInUp.delay(totalDelay)
          .duration(BASE_DURATION)
          .springify()
          .damping(LUXURY_DAMPING)
          .stiffness(LUXURY_STIFFNESS)
          .mass(1.2)
      : FadeInDown.delay(totalDelay)
          .duration(BASE_DURATION)
          .springify()
          .damping(LUXURY_DAMPING)
          .stiffness(LUXURY_STIFFNESS)
          .mass(1.2);

  return (
    <Animated.View entering={entering}>
      <SapphireCard style={style} padding={padding}>
        {children}
      </SapphireCard>
    </Animated.View>
  );
};

/**
 * Animated View wrapper for non-card elements
 * Same DAMPED FLUIDITY as cards
 */
export const AnimatedElement: React.FC<
  PropsWithChildren<{
    index?: number;
    delay?: number;
    style?: ViewStyle;
  }>
> = ({ children, index = 0, delay = 0, style }) => {
  const totalDelay = delay + index * STAGGER_DELAY;

  return (
    <Animated.View
      entering={FadeInUp.delay(totalDelay)
        .duration(BASE_DURATION)
        .springify()
        .damping(LUXURY_DAMPING)
        .stiffness(LUXURY_STIFFNESS)
        .mass(1.2)}
      style={style}
    >
      {children}
    </Animated.View>
  );
};
