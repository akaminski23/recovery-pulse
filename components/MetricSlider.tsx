/**
 * Recovery Pulse - Luxury Metric Slider
 * Haptic feedback on EVERY segment + visual glow
 *
 * THE BILLIONAIRE PROTOCOL: Must feel like adjusting expensive audio equipment
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PALETTE, RADII, SPACING, HIT_TARGET } from '../constants/theme';
import { SPRINGS } from '../constants/springs';
import { SafeText, CaptionText } from './SafeText';

interface MetricSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  invertColors?: boolean;
  redThreshold?: number;
  greenThreshold?: number;
}

export const MetricSlider: React.FC<MetricSliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel = 'Low',
  highLabel = 'High',
  invertColors = false,
  redThreshold = 0.4,
  greenThreshold = 0.7,
}) => {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  // Animated value scale for the number display
  const numberScale = useSharedValue(1);

  const handlePress = useCallback(
    (newValue: number) => {
      if (newValue !== value) {
        // HAPTIC FIRST - mechanical precision feel
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Scale up the number during interaction - DAMPED FLUIDITY
        numberScale.value = withSpring(1.12, SPRINGS.luxury);
        setTimeout(() => {
          // SMOOTH RETURN - no vibration on settle
          numberScale.value = withSpring(1, SPRINGS.luxuryReturn);
        }, 200);

        onChange(newValue);
      }
    },
    [value, onChange, numberScale]
  );

  const getStepColor = (step: number, isSelected: boolean): string => {
    if (!isSelected) return 'rgba(255, 255, 255, 0.08)';

    const progress = (step - min) / (max - min);
    const adjustedProgress = invertColors ? 1 - progress : progress;

    if (adjustedProgress < redThreshold) {
      return PALETTE.danger;
    } else if (adjustedProgress < greenThreshold) {
      return PALETTE.warning;
    } else {
      return PALETTE.success;
    }
  };

  // Animated style for the value number
  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header with label and animated value */}
      <View style={styles.header}>
        <SafeText variant="title" numberOfLines={1}>
          {label}
        </SafeText>
        <Animated.View style={numberAnimatedStyle}>
          <SafeText variant="metric" color={PALETTE.champagneGold} style={styles.value}>
            {value}
          </SafeText>
        </Animated.View>
      </View>

      {/* Slider segments */}
      <View style={styles.sliderContainer}>
        {steps.map((step) => {
          const isSelected = step <= value;
          const isCurrentValue = step === value;

          return (
            <LuxurySliderStep
              key={step}
              step={step}
              isSelected={isSelected}
              isCurrentValue={isCurrentValue}
              color={getStepColor(step, isSelected)}
              onPress={() => handlePress(step)}
            />
          );
        })}
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        <CaptionText>{lowLabel}</CaptionText>
        <CaptionText>{highLabel}</CaptionText>
      </View>
    </View>
  );
};

interface LuxurySliderStepProps {
  step: number;
  isSelected: boolean;
  isCurrentValue: boolean;
  color: string;
  onPress: () => void;
}

const LuxurySliderStep: React.FC<LuxurySliderStepProps> = ({
  isCurrentValue,
  color,
  onPress,
}) => {
  const glowIntensity = useSharedValue(0);

  const handlePressIn = () => {
    // Haptic on touch - feels mechanical
    Haptics.selectionAsync();
    glowIntensity.value = withSpring(1, SPRINGS.luxury);
  };

  const handlePressOut = () => {
    glowIntensity.value = withSpring(isCurrentValue ? 0.6 : 0, SPRINGS.luxuryReturn);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowRadius = interpolate(
      glowIntensity.value,
      [0, 1],
      [0, 12],
      Extrapolation.CLAMP
    );

    return {
      shadowRadius,
      shadowOpacity: glowIntensity.value * 0.8,
    };
  });

  // Set glow for current value
  React.useEffect(() => {
    glowIntensity.value = withSpring(isCurrentValue ? 0.6 : 0, SPRINGS.luxuryReturn);
  }, [isCurrentValue, glowIntensity]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.stepPressable}
    >
      <Animated.View
        style={[
          styles.step,
          {
            backgroundColor: color,
            shadowColor: color,
          },
          animatedStyle,
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: '300',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  stepPressable: {
    flex: 1,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  step: {
    width: '100%',
    height: 10,
    borderRadius: RADII.chip,
    borderCurve: 'continuous',
    // Shadow for glow effect
    shadowOffset: { width: 0, height: 0 },
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.xs,
  },
});
