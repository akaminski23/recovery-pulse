/**
 * Recovery Pulse - Recovery Ring
 * Circular progress indicator with animated fill
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import { SPACING } from '../constants/theme';
import { SPRINGS } from '../constants/springs';
import { SafeText } from './SafeText';
import { getRecoveryStatus } from '../db/schema';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RecoveryRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const RecoveryRing: React.FC<RecoveryRingProps> = ({
  score,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
}) => {
  const progress = useSharedValue(0);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withSpring(score / 100, SPRINGS.smooth);
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const { label, color } = getRecoveryStatus(score);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <SafeText
          variant="metric"
          color={color}
          numberOfLines={1}
          style={styles.score}
        >
          {score}
        </SafeText>
        {showLabel && (
          <SafeText variant="caption" numberOfLines={1}>
            {label}
          </SafeText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  score: {
    fontSize: 56,
  },
});
