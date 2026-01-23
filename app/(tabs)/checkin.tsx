/**
 * Recovery Pulse - Daily Check-In Screen
 * THE BILLIONAIRE PROTOCOL: Luxury interaction feel
 *
 * - Staggered card entrance
 * - Haptic sliders
 * - Live score preview
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedCard, AnimatedElement } from '../../components/AnimatedCard';
import { SapphireButton } from '../../components/SapphireButton';
import { SafeText, HeadlineText, CaptionText } from '../../components/SafeText';
import { MetricSlider } from '../../components/MetricSlider';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useHaptic } from '../../hooks/useHaptic';
import { SPACING } from '../../constants/theme';
import { calculateRecoveryScore, getRecoveryStatus } from '../../db/schema';

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
  const previewScore = calculateRecoveryScore(sleepQuality, fatigue, soreness);
  const previewStatus = getRecoveryStatus(previewScore);

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

        {/* Score Preview - Hero Card */}
        <AnimatedCard index={1} delay={100}>
          {/* DAMPED FLUIDITY - slower, heavier fade */}
          <Animated.View
            entering={FadeIn.delay(400).duration(800)}
            style={styles.previewContent}
          >
            <CaptionText>Recovery Score Preview</CaptionText>
            <SafeText variant="metric" color={previewStatus.color} style={styles.previewScore}>
              {previewScore}
            </SafeText>
            <SafeText variant="bodySmall" color={previewStatus.color}>
              {previewStatus.label}
            </SafeText>
          </Animated.View>
        </AnimatedCard>

        {/* Sleep Hours */}
        <AnimatedCard index={2} delay={160}>
          <MetricSlider
            label="Sleep Duration"
            value={sleepHours}
            onChange={setSleepHours}
            min={3}
            max={12}
            lowLabel="3 hours"
            highLabel="12 hours"
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
    gap: SPACING.xs,
  },
  previewScore: {
    fontSize: 64,
    marginVertical: SPACING.sm,
  },
});
