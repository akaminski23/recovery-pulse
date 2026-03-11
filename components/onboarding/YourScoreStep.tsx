/**
 * Onboarding Step 3: Your Score
 * Recovery Score 0-100 with color ranges (ruby/gold/emerald)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SafeText } from '../SafeText';
import { SapphireButton } from '../SapphireButton';
import { PALETTE, SPACING, RADII } from '../../constants/theme';
import { SPRINGS } from '../../constants/springs';

interface YourScoreStepProps {
  onNext: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SCORE_RANGES = [
  {
    range: '80 — 100',
    label: 'Optimal',
    description: 'Fully recovered. Train hard.',
    color: 'rgba(80, 200, 120, 0.9)',
  },
  {
    range: '60 — 79',
    label: 'Good',
    description: 'Moderate recovery. Normal training.',
    color: 'rgba(212, 175, 55, 0.85)',
  },
  {
    range: 'Below 60',
    label: 'Low',
    description: 'Take it easy. Rest day.',
    color: 'rgba(224, 17, 95, 0.9)',
  },
];

const RING_SIZE = 180;
const STROKE_WIDTH = 10;
const CENTER = RING_SIZE / 2;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DEMO_SCORE = 82;

export const YourScoreStep: React.FC<YourScoreStepProps> = ({ onNext }) => {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      600,
      withSpring(DEMO_SCORE / 100, { damping: 28, stiffness: 80, mass: 1 })
    );
    const timer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 900);
    return () => clearTimeout(timer);
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
      {/* Step Label */}
      <Animated.View
        entering={FadeInUp.delay(100).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.stepLabel} numberOfLines={1}>
          STEP 2 OF 4
        </SafeText>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.title} numberOfLines={2}>
          Your Recovery{'\n'}Score
        </SafeText>
      </Animated.View>

      {/* Demo Ring */}
      <Animated.View
        entering={FadeInUp.delay(400).springify().damping(20).stiffness(100)}
        style={styles.ringContainer}
      >
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Defs>
            <LinearGradient id="onboardingRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(80, 200, 120, 1)" />
              <Stop offset="100%" stopColor="rgba(80, 200, 120, 0.6)" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="url(#onboardingRing)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringScore}>
            {DEMO_SCORE}
          </Text>
          <Text style={styles.ringLabel}>
            OPTIMAL
          </Text>
        </View>
      </Animated.View>

      {/* Score Ranges */}
      {SCORE_RANGES.map((range, index) => (
        <Animated.View
          key={range.label}
          entering={FadeInUp.delay(600 + index * 80).springify().damping(20).stiffness(100)}
          style={styles.rangeRow}
        >
          <View style={[styles.rangeDot, { backgroundColor: range.color }]} />
          <View style={styles.rangeText}>
            <SafeText style={styles.rangeTitle} numberOfLines={1}>
              {range.range} — {range.label}
            </SafeText>
            <SafeText
              style={styles.rangeDescription}
              numberOfLines={1}
              adjustsFontSizeToFit={false}
            >
              {range.description}
            </SafeText>
          </View>
        </Animated.View>
      ))}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA */}
      <Animated.View
        entering={FadeInUp.delay(880).springify().damping(20).stiffness(100)}
        style={styles.ctaContainer}
      >
        <SapphireButton
          title="CONTINUE"
          onPress={handleNext}
          variant="primary"
          fullWidth
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: PALETTE.titaniumSilverMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '200',
    letterSpacing: 1,
    color: PALETTE.pureWhite,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  ringCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  ringScore: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '300',
    letterSpacing: -1,
    color: 'rgba(80, 200, 120, 1)',
  },
  ringLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: PALETTE.titaniumSilverMuted,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.button,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rangeText: {
    flex: 1,
    gap: 2,
  },
  rangeTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: PALETTE.pureWhite,
  },
  rangeDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
  },
  spacer: {
    flex: 1,
  },
  ctaContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 48,
  },
});
