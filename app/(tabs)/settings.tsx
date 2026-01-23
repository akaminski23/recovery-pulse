/**
 * Recovery Pulse - Settings Screen
 * THE BILLIONAIRE PROTOCOL: Staggered entrance animations
 * Hidden "Laboratory" unlocked by tapping Version 5 times
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedCard, AnimatedElement } from '../../components/AnimatedCard';
import { SapphireButton } from '../../components/SapphireButton';
import { SafeText, HeadlineText, CaptionText } from '../../components/SafeText';
import { useHaptic } from '../../hooks/useHaptic';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useGracePeriod } from '../../hooks/useGracePeriod';
import { resetDatabase } from '../../db/client';
import { useCheckIn } from '../../hooks/useCheckIn';
import { PALETTE, SPACING } from '../../constants/theme';

const LAB_TAP_THRESHOLD = 5;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trigger } = useHaptic();
  const { refresh } = useCheckIn();
  const { resetOnboarding } = useOnboarding();
  const { resetGracePeriod } = useGracePeriod();

  // Laboratory visibility:
  // - In __DEV__ mode: always visible for testing
  // - In production: hidden behind 5x tap on Version
  const [labTapCount, setLabTapCount] = useState(0);
  const [labUnlocked, setLabUnlocked] = useState(__DEV__); // Auto-unlock in dev

  const handleVersionTap = useCallback(() => {
    if (__DEV__) return; // Already unlocked in dev mode

    const newCount = labTapCount + 1;
    setLabTapCount(newCount);

    if (newCount >= LAB_TAP_THRESHOLD && !labUnlocked) {
      trigger('success');
      setLabUnlocked(true);
    } else if (newCount >= LAB_TAP_THRESHOLD - 2) {
      // Subtle hint when close
      trigger('light');
    }
  }, [labTapCount, labUnlocked, trigger]);

  const handleExpireGracePeriod = async () => {
    Alert.alert(
      'Expire Grace Period',
      'This will reset your first launch date to 8 days ago, simulating an expired grace period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Expire',
          style: 'destructive',
          onPress: async () => {
            await resetGracePeriod();
            trigger('warning');
            Alert.alert('Grace Period', 'Grace period has been reset. Restart the app to see the effect.');
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your check-in history. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDatabase();
            refresh();
            trigger('warning');
            Alert.alert('Data Reset', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleReplayOnboarding = async () => {
    trigger('medium');
    await resetOnboarding();
    // Navigate to onboarding
    router.replace('/onboarding');
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
            <CaptionText>Configuration</CaptionText>
            <HeadlineText>Settings</HeadlineText>
          </View>
        </AnimatedElement>

        {/* About Section */}
        <AnimatedElement index={1} delay={80}>
          <CaptionText style={styles.sectionTitle}>About</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={2} delay={160}>
          <View style={styles.aboutCard}>
            <View style={styles.appIcon}>
              <Ionicons
                name="pulse"
                size={32}
                color={PALETTE.champagneGold}
              />
            </View>
            <View style={styles.appInfo}>
              <SafeText variant="headline">Recovery Pulse</SafeText>
              <Pressable onPress={handleVersionTap} hitSlop={8}>
                <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
                  Version 1.0.0
                </SafeText>
              </Pressable>
            </View>
          </View>
          <SafeText variant="body" style={styles.description}>
            Track your daily recovery metrics and optimize your training with
            data-driven insights.
          </SafeText>
        </AnimatedCard>

        {/* Recovery Score Info */}
        <AnimatedElement index={3} delay={240}>
          <CaptionText style={styles.sectionTitle}>
            Recovery Score Formula
          </CaptionText>
        </AnimatedElement>

        <AnimatedCard index={4} delay={320}>
          <View style={styles.formulaSection}>
            <FormulaItem
              label="Sleep Quality"
              weight="30%"
              description="Direct impact from 1-10 rating"
            />
            <FormulaItem
              label="Fatigue Level"
              weight="35%"
              description="Inverse (lower fatigue = better)"
            />
            <FormulaItem
              label="Muscle Soreness"
              weight="35%"
              description="Inverse (lower soreness = better)"
            />
          </View>
        </AnimatedCard>

        {/* Score Ranges */}
        <AnimatedElement index={5} delay={400}>
          <CaptionText style={styles.sectionTitle}>Score Ranges</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={6} delay={480}>
          <View style={styles.rangesSection}>
            <ScoreRange
              range="80-100"
              label="Optimal"
              color="rgba(80, 200, 120, 0.9)"
              description="Ready for intense training"
            />
            <ScoreRange
              range="60-79"
              label="Good"
              color="rgba(212, 175, 55, 0.85)"
              description="Moderate training recommended"
            />
            <ScoreRange
              range="40-59"
              label="Moderate"
              color="rgba(255, 179, 71, 0.9)"
              description="Light activity only"
            />
            <ScoreRange
              range="0-39"
              label="Low"
              color="rgba(224, 17, 95, 0.9)"
              description="Focus on recovery"
            />
          </View>
        </AnimatedCard>

        {/* Hidden Laboratory - Developer Options */}
        {labUnlocked && (
          <>
            <AnimatedElement index={7} delay={560}>
              <CaptionText style={styles.sectionTitle}>
                Laboratory
              </CaptionText>
            </AnimatedElement>

            <AnimatedCard index={8} delay={640}>
              <View style={styles.labHeader}>
                <Ionicons
                  name="flask"
                  size={20}
                  color={PALETTE.danger}
                />
                <SafeText variant="bodySmall" color={PALETTE.danger}>
                  Developer Options - Use with caution
                </SafeText>
              </View>
              <View style={styles.buttonGroup}>
                <SapphireButton
                  title="Replay Onboarding"
                  onPress={handleReplayOnboarding}
                  variant="ghost"
                  fullWidth
                />
                <SapphireButton
                  title="Expire Grace Period (Test)"
                  onPress={handleExpireGracePeriod}
                  variant="ghost"
                  fullWidth
                />
                <SapphireButton
                  title="Reset All Data"
                  onPress={handleResetData}
                  variant="secondary"
                  fullWidth
                />
              </View>
            </AnimatedCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

interface FormulaItemProps {
  label: string;
  weight: string;
  description: string;
}

const FormulaItem: React.FC<FormulaItemProps> = ({
  label,
  weight,
  description,
}) => (
  <View style={styles.formulaItem}>
    <View style={styles.formulaHeader}>
      <SafeText variant="title">{label}</SafeText>
      <SafeText variant="caption" color={PALETTE.champagneGold}>
        {weight}
      </SafeText>
    </View>
    <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
      {description}
    </SafeText>
  </View>
);

interface ScoreRangeProps {
  range: string;
  label: string;
  color: string;
  description: string;
}

const ScoreRange: React.FC<ScoreRangeProps> = ({
  range,
  label,
  color,
  description,
}) => (
  <View style={styles.rangeItem}>
    <View style={[styles.rangeIndicator, { backgroundColor: color }]} />
    <View style={styles.rangeInfo}>
      <View style={styles.rangeHeader}>
        <SafeText variant="title">{range}</SafeText>
        <SafeText variant="bodySmall" color={color}>
          {label}
        </SafeText>
      </View>
      <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
        {description}
      </SafeText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginLeft: SPACING.xs,
    marginTop: SPACING.sm,
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    gap: SPACING.xs,
  },
  description: {
    lineHeight: 22,
  },
  formulaSection: {
    gap: SPACING.lg,
  },
  formulaItem: {
    gap: SPACING.xs,
  },
  formulaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangesSection: {
    gap: SPACING.md,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  rangeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginTop: 2,
  },
  rangeInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningText: {
    marginBottom: SPACING.md,
    color: PALETTE.titaniumSilverMuted,
  },
  buttonGroup: {
    gap: SPACING.md,
  },
  labHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(224, 17, 95, 0.3)',
  },
});
