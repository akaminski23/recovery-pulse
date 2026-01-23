/**
 * Recovery Pulse - Sapphire Button
 * Animated button with spring physics and haptic feedback
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SPRINGS } from '../constants/springs';
import { PALETTE, RADII, HIT_TARGET, SPACING } from '../constants/theme';
import { useHaptic } from '../hooks/useHaptic';
import { SafeText } from './SafeText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface SapphireButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SapphireButton: React.FC<SapphireButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  style,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const { withHaptic } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles = getVariantStyles(variant, disabled);

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (!disabled) {
          // DAMPED FLUIDITY - controlled press
          scale.value = withSpring(0.97, SPRINGS.luxury);
        }
      }}
      onPressOut={() => {
        // SMOOTH RETURN - no bounce back
        scale.value = withSpring(1, SPRINGS.luxuryReturn);
      }}
      onPress={disabled ? undefined : withHaptic(onPress, 'medium')}
      style={[
        styles.button,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <SafeText
        variant="title"
        color={variantStyles.textColor}
        numberOfLines={1}
        style={styles.text}
      >
        {title}
      </SafeText>
    </AnimatedPressable>
  );
};

const getVariantStyles = (
  variant: ButtonVariant,
  disabled: boolean
): { container: ViewStyle; textColor: string } => {
  const opacity = disabled ? 0.4 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: `rgba(212, 175, 55, ${0.85 * opacity})`,
        },
        textColor: disabled ? 'rgba(5, 5, 5, 0.6)' : PALETTE.obsidian,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 0.5,
          borderColor: PALETTE.borderLight,
        },
        textColor: disabled ? PALETTE.mutedWhite : PALETTE.pureWhite,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'rgba(0, 0, 0, 0)',
        },
        textColor: disabled ? PALETTE.titaniumSilverMuted : PALETTE.titaniumSilver,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    minHeight: HIT_TARGET,
    minWidth: HIT_TARGET,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    textAlign: 'center',
  },
});
