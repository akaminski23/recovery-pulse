/**
 * Recovery Pulse - Breathing Star
 * Luxurious "alive" animation - slow, organic breathing
 *
 * THE BILLIONAIRE PROTOCOL: Element must feel ALIVE
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PALETTE } from '../constants/theme';

interface BreathingStarProps {
  size?: number;
  color?: string;
}

// BREATHING CONFIG - SLOW & LUXURIOUS
const BREATHING = {
  scale: {
    min: 1.0,
    max: 1.15,
    duration: 2500, // 2.5s per cycle - organic, not nervous
  },
  glow: {
    min: 0.3,
    max: 0.8,
    duration: 2500,
  },
  easing: Easing.inOut(Easing.sin), // Sin = organic breathing
};

export const BreathingStar: React.FC<BreathingStarProps> = ({
  size = 48,
  color = PALETTE.champagneGoldMuted,
}) => {
  const scale = useSharedValue(BREATHING.scale.min);
  const glowOpacity = useSharedValue(BREATHING.glow.min);

  useEffect(() => {
    // Scale breathing
    scale.value = withRepeat(
      withSequence(
        withTiming(BREATHING.scale.max, {
          duration: BREATHING.scale.duration,
          easing: BREATHING.easing,
        }),
        withTiming(BREATHING.scale.min, {
          duration: BREATHING.scale.duration,
          easing: BREATHING.easing,
        })
      ),
      -1, // Infinite
      false
    );

    // Glow breathing (slightly offset for depth)
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(BREATHING.glow.max, {
          duration: BREATHING.glow.duration,
          easing: BREATHING.easing,
        }),
        withTiming(BREATHING.glow.min, {
          duration: BREATHING.glow.duration,
          easing: BREATHING.easing,
        })
      ),
      -1,
      false
    );
  }, [scale, glowOpacity]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {/* Outer glow layer */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size,
            backgroundColor: color,
          },
          glowStyle,
        ]}
      />

      {/* Star character */}
      <Animated.Text
        style={[
          styles.star,
          {
            fontSize: size,
            color: color,
          },
          starStyle,
        ]}
      >
        ✦
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    // Soft blur effect via shadow
    shadowColor: PALETTE.champagneGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  star: {
    textShadowColor: PALETTE.champagneGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
});
