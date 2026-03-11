/**
 * Onboarding Step 4: Wow Moment
 * Mock weekly chart + stats — auto-advancing with Skia animation
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SafeText } from '../SafeText';
import { PALETTE, SPACING, RADII } from '../../constants/theme';

interface WowMomentStepProps {
  onNext: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCORES = [72, 65, 81, 78, 85, 90, 82];
const MAX_BAR = 100;

const STATS = [
  { icon: 'trending-up' as const, value: '79', label: 'Avg Score' },
  { icon: 'flame' as const, value: '7', label: 'Day Streak' },
  { icon: 'trophy' as const, value: '90', label: 'Best Day' },
];

const MESSAGES = [
  'Analyzing your recovery patterns...',
  'Identifying peak performance days...',
  'Building your wellness profile...',
];

const getBarColor = (score: number): string => {
  if (score >= 80) return 'rgba(80, 200, 120, 0.9)';
  if (score >= 60) return 'rgba(212, 175, 55, 0.85)';
  return 'rgba(224, 17, 95, 0.9)';
};

export const WowMomentStep: React.FC<WowMomentStepProps> = ({ onNext }) => {
  const insets = useSafeAreaInsets();
  const [messageIndex, setMessageIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const _glowOpacity = useSharedValue(0);

  // Message cycling + auto-advance
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Message 1 → 2
    timers.push(setTimeout(() => {
      Haptics.selectionAsync();
      setMessageIndex(1);
    }, 1600));

    // Message 2 → 3
    timers.push(setTimeout(() => {
      Haptics.selectionAsync();
      setMessageIndex(2);
    }, 3200));

    // Show results
    timers.push(setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResults(true);
    }, 4800));

    // Auto-advance to paywall
    timers.push(setTimeout(() => {
      onNext();
    }, 7200));

    return () => timers.forEach(clearTimeout);
  }, [onNext]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
      {/* Step Label */}
      <Animated.View
        entering={FadeInUp.delay(100).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.stepLabel} numberOfLines={1}>
          STEP 3 OF 4
        </SafeText>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.title} numberOfLines={2}>
          Track Your{'\n'}Progress
        </SafeText>
      </Animated.View>

      {/* Processing Message */}
      <Animated.View
        entering={FadeInUp.delay(400).springify().damping(20).stiffness(100)}
        style={styles.messageContainer}
      >
        <SafeText
          key={messageIndex}
          style={styles.message}
          numberOfLines={1}
        >
          {MESSAGES[messageIndex]}
        </SafeText>
      </Animated.View>

      {/* Mock Chart */}
      <Animated.View
        entering={FadeInUp.delay(600).springify().damping(20).stiffness(100)}
        style={[styles.chartCard, glowStyle]}
      >
        <View style={styles.barsContainer}>
          {DAYS.map((day, index) => {
            const barHeight = (SCORES[index] / MAX_BAR) * 120;
            return (
              <Animated.View
                key={day}
                entering={FadeInUp.delay(800 + index * 80).springify().damping(20).stiffness(100)}
                style={styles.barColumn}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getBarColor(SCORES[index]),
                      },
                    ]}
                  />
                </View>
                <SafeText style={styles.dayLabel} numberOfLines={1}>
                  {day}
                </SafeText>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      {/* Stats Row — appears after analysis */}
      {showResults && (
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeIn.delay(index * 120).springify().damping(20).stiffness(100)}
              style={styles.statCard}
            >
              <Ionicons
                name={stat.icon}
                size={20}
                color={PALETTE.champagneGoldBright}
              />
              <SafeText style={styles.statValue} numberOfLines={1}>
                {stat.value}
              </SafeText>
              <SafeText style={styles.statLabel} numberOfLines={1}>
                {stat.label}
              </SafeText>
            </Animated.View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
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
  messageContainer: {
    minHeight: 20,
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: 14,
    fontWeight: '300',
    color: PALETTE.champagneGold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  chartCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  barTrack: {
    width: 20,
    height: 120,
    justifyContent: 'flex-end',
    borderRadius: 10,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderCurve: 'continuous',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: PALETTE.mutedWhite,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 340,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.button,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: PALETTE.pureWhite,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
});
