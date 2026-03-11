/**
 * Recovery Pulse - Daily Check-In Screen
 * THE BILLIONAIRE PROTOCOL: Luxury interaction feel
 *
 * - Staggered card entrance
 * - Haptic sliders
 * - Live score preview
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';

import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedCard, AnimatedElement } from '../../components/AnimatedCard';
import { SapphireButton } from '../../components/SapphireButton';
import { SafeText, HeadlineText, CaptionText } from '../../components/SafeText';
import { MetricSlider } from '../../components/MetricSlider';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useHaptic } from '../../hooks/useHaptic';
import { SPACING } from '../../constants/theme';
import { SPRINGS } from '../../constants/springs';
import { calculateRecoveryScore, getRecoveryStatus } from '../../db/schema';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SLEEP_HOURS_DESCRIPTIONS: Record<number, string> = {
  4: 'Severely sleep deprived — expect low recovery',
  5: 'Below minimum — cognitive function impaired',
  6: 'Slightly short — may feel okay but recovery suffers',
  7: 'Solid night — meets recommended minimum',
  8: 'Optimal — peak recovery and mental clarity',
  9: 'Extended recovery — great after hard training',
  10: 'Maximum rest — ideal for illness or overreaching',
};

const SLEEP_QUALITY_DESCRIPTIONS: Record<number, string> = {
  1: 'Barely slept — tossing and turning all night',
  2: 'Very restless — woke up many times',
  3: 'Poor — took long to fall asleep, light sleep',
  4: 'Below average — some interruptions, unrefreshing',
  5: 'Average — nothing special, woke up once or twice',
  6: 'Decent — mostly uninterrupted, mild grogginess',
  7: 'Good — fell asleep quickly, woke up fairly rested',
  8: 'Very good — deep sleep, woke up refreshed',
  9: 'Excellent — slept through the night, full of energy',
  10: 'Perfect — best sleep possible, completely recharged',
};

const FATIGUE_DESCRIPTIONS: Record<number, string> = {
  1: 'Fully energized — ready for anything',
  2: 'Very fresh — minimal fatigue, high motivation',
  3: 'Slightly tired — nothing a warm-up won\'t fix',
  4: 'Mild fatigue — functional but not 100%',
  5: 'Moderate — noticeable tiredness, can still train',
  6: 'Fairly tired — would prefer a lighter session',
  7: 'Tired — low motivation, body feels heavy',
  8: 'Very fatigued — struggling to focus or move',
  9: 'Exhausted — rest day strongly recommended',
  10: 'Completely drained — unable to perform any activity',
};

const SORENESS_DESCRIPTIONS: Record<number, string> = {
  1: 'No soreness — muscles feel completely normal',
  2: 'Barely noticeable — slight tightness if you focus',
  3: 'Mild — feel it during movement, goes away quickly',
  4: 'Moderate mild — aware of soreness during daily tasks',
  5: 'Moderate — clear soreness, manageable with warm-up',
  6: 'Significant — uncomfortable during certain movements',
  7: 'High — affects range of motion and daily activity',
  8: 'Very sore — pain during most movements',
  9: 'Severe — difficult to perform basic tasks',
  10: 'Extreme — possible injury, seek medical advice',
};

const RING_SIZE = 140;
const STROKE_WIDTH = 8;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { todayCheckIn, submitCheckIn, hasCheckedInToday } = useCheckIn();
  const { trigger } = useHaptic();

  // Form state
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [fatigue, setFatigue] = useState(5);
  const [soreness, setSoreness] = useState(5);

  // Load existing data if editing
  useEffect(() => {
    if (todayCheckIn) {
      setSleepHours(Math.round(todayCheckIn.sleepHours));
      setSleepQuality(todayCheckIn.sleepQuality);
      setFatigue(todayCheckIn.fatigue);
      setSoreness(todayCheckIn.soreness);
    }
  }, [todayCheckIn]);

  // Calculate preview score
  const previewScore = calculateRecoveryScore(sleepQuality, fatigue, soreness, sleepHours);
  const previewStatus = getRecoveryStatus(previewScore);

  // Animated ring progress
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withSpring(previewScore / 100, {
      damping: 28,
      stiffness: 80,
      mass: 1,
    });
  }, [previewScore, ringProgress]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  // Pick gradient colors based on score
  const ringGradientStart = previewStatus.color;
  const ringGradientEnd = previewStatus.color.replace(/[\d.]+\)$/, '0.4)');

  const handleSubmit = () => {
    try {
      submitCheckIn({
        sleepHours,
        sleepQuality,
        fatigue,
        soreness,
      });

      trigger('success');

      Alert.alert(
        hasCheckedInToday ? 'Updated!' : 'Check-In Complete!',
        `Your recovery score is ${previewScore} (${previewStatus.label})`,
        [
          {
            text: 'View Dashboard',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (error) {
      trigger('error');
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedElement index={0} delay={0}>
          <View style={styles.header}>
            <CaptionText>
              {hasCheckedInToday ? 'Update Check-In' : 'Daily Check-In'}
            </CaptionText>
            <HeadlineText>How are you feeling?</HeadlineText>
          </View>
        </AnimatedElement>

        {/* Score Preview - Hero Card with Ring */}
        <AnimatedCard index={1} delay={100}>
          <Animated.View
            entering={FadeIn.delay(400).duration(800)}
            style={styles.previewContent}
          >
            <CaptionText>Recovery Score Preview</CaptionText>
            <View style={styles.ringContainer}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Defs>
                  <LinearGradient id="scoreRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={ringGradientStart} />
                    <Stop offset="100%" stopColor={ringGradientEnd} />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={RING_CENTER}
                  cy={RING_CENTER}
                  r={RING_RADIUS}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING_CENTER}
                  cy={RING_CENTER}
                  r={RING_RADIUS}
                  stroke="url(#scoreRing)"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animatedProps={ringAnimatedProps}
                  transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={[styles.ringScore, { color: previewStatus.color }]}>
                  {previewScore}
                </Text>
                <Text style={[styles.ringLabel, { color: previewStatus.color }]}>
                  {previewStatus.label}
                </Text>
              </View>
            </View>
          </Animated.View>
        </AnimatedCard>

        {/* Sleep Hours */}
        <AnimatedCard index={2} delay={160}>
          <MetricSlider
            label="Sleep Duration"
            value={sleepHours}
            onChange={setSleepHours}
            min={4}
            max={10}
            lowLabel="4 hours"
            highLabel="10 hours"
            redThreshold={0.3}
            greenThreshold={0.5}
            descriptions={SLEEP_HOURS_DESCRIPTIONS}
          />
        </AnimatedCard>

        {/* Sleep Quality */}
        <AnimatedCard index={3} delay={240}>
          <MetricSlider
            label="Sleep Quality"
            value={sleepQuality}
            onChange={setSleepQuality}
            lowLabel="Poor"
            highLabel="Excellent"
            descriptions={SLEEP_QUALITY_DESCRIPTIONS}
          />
        </AnimatedCard>

        {/* Fatigue */}
        <AnimatedCard index={4} delay={320}>
          <MetricSlider
            label="Fatigue Level"
            value={fatigue}
            onChange={setFatigue}
            lowLabel="Energized"
            highLabel="Exhausted"
            invertColors
            descriptions={FATIGUE_DESCRIPTIONS}
          />
        </AnimatedCard>

        {/* Soreness */}
        <AnimatedCard index={5} delay={400}>
          <MetricSlider
            label="Muscle Soreness"
            value={soreness}
            onChange={setSoreness}
            lowLabel="None"
            highLabel="Severe"
            invertColors
            descriptions={SORENESS_DESCRIPTIONS}
          />
        </AnimatedCard>

        {/* Submit Button */}
        <AnimatedElement index={6} delay={480}>
          <SapphireButton
            title={hasCheckedInToday ? 'Update Check-In' : 'Complete Check-In'}
            onPress={handleSubmit}
            variant="primary"
            fullWidth
          />
        </AnimatedElement>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  header: {
    gap: SPACING.xs,
  },
  previewContent: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  ringScore: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '300',
    letterSpacing: -1,
  },
  ringLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
