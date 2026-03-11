/**
 * Onboarding Step 1: Welcome
 * Hero ring + "Know when to push. Know when to rest."
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
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

interface WelcomeStepProps {
  onNext: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 200;
const STROKE_WIDTH = 8;
const CENTER = RING_SIZE / 2;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const HIGHLIGHTS = [
  { icon: 'moon' as const, label: 'Sleep' },
  { icon: 'battery-half' as const, label: 'Fatigue' },
  { icon: 'fitness' as const, label: 'Soreness' },
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      500,
      withSpring(0.78, { damping: 28, stiffness: 80, mass: 1 })
    );
    const timer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
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
    <View style={[styles.container, { paddingTop: insets.top + 56 }]}>
      {/* Hero Ring */}
      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(20).stiffness(100)}
        style={styles.ringContainer}
      >
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Defs>
            <LinearGradient id="welcomeRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={PALETTE.champagneGoldBright} />
              <Stop offset="100%" stopColor="rgba(212, 175, 55, 0.5)" />
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
            stroke="url(#welcomeRing)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Ionicons name="pulse" size={40} color={PALETTE.champagneGoldBright} />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInUp.delay(400).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.title} numberOfLines={2}>
          Recovery Pulse
        </SafeText>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View
        entering={FadeInUp.delay(500).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.subtitle} numberOfLines={2}>
          Know when to push.{'\n'}Know when to rest.
        </SafeText>
      </Animated.View>

      {/* 3 Highlights */}
      <Animated.View
        entering={FadeInUp.delay(640).springify().damping(20).stiffness(100)}
        style={styles.highlightsRow}
      >
        {HIGHLIGHTS.map((item) => (
          <View key={item.label} style={styles.highlightItem}>
            <View style={styles.highlightIcon}>
              <Ionicons name={item.icon} size={20} color={PALETTE.champagneGoldBright} />
            </View>
            <SafeText style={styles.highlightLabel} numberOfLines={1}>
              {item.label}
            </SafeText>
          </View>
        ))}
      </Animated.View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Disclaimer */}
      <Animated.View
        entering={FadeInUp.delay(720).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.disclaimer} numberOfLines={4}>
          This app helps you track recovery using self-reported data.
          It does not provide medical advice. Consult a healthcare
          professional for medical decisions.
        </SafeText>
      </Animated.View>

      {/* CTA */}
      <Animated.View
        entering={FadeInUp.delay(800).springify().damping(20).stiffness(100)}
        style={styles.ctaContainer}
      >
        <SapphireButton
          title="BEGIN"
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
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '200',
    letterSpacing: 2,
    color: PALETTE.pureWhite,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 28,
    color: PALETTE.subtleWhite,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  highlightItem: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
    color: PALETTE.subtleWhite,
    textTransform: 'uppercase',
  },
  spacer: {
    flex: 1,
  },
  disclaimer: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: PALETTE.mutedWhite,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: SPACING.lg,
  },
  ctaContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 48,
  },
});
