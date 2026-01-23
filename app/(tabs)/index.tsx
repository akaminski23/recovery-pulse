/**
 * Recovery Pulse - Dashboard (The Pulse)
 * THE BILLIONAIRE PROTOCOL: Living, breathing interface
 *
 * - Staggered entrance animations
 * - Breathing star for empty state
 * - Recovery Ring as hero element
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedCard, AnimatedElement } from '../../components/AnimatedCard';
import { SapphireButton } from '../../components/SapphireButton';
import { SafeText, CaptionText, HeadlineText } from '../../components/SafeText';
import { RecoveryRing } from '../../components/RecoveryRing';
import { BreathingStar } from '../../components/BreathingStar';
import { PremiumGate } from '../../components/PremiumGate';
import { SovereignPaywall } from '../../components/SovereignPaywall';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useAccess } from '../../hooks/useAccess';
import { PALETTE, SPACING } from '../../constants/theme';
import { getRecoveryStatus } from '../../db/schema';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { todayCheckIn, averageScore, hasCheckedInToday } = useCheckIn();
  const { isLocked, isInComplimentaryAccess, graceDaysLeft } = useAccess();
  const [showPaywall, setShowPaywall] = useState(false);

  const today = format(new Date(), 'EEEE, MMMM d');
  const score = todayCheckIn?.recoveryScore ?? 0;

  return (
    <View style={styles.container}>
      <GradientBackground />

      {/* Paywall Modal */}
      <SovereignPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {/* Premium Gate wraps content */}
      <PremiumGate isLocked={isLocked} onUpgrade={() => setShowPaywall(true)}>

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
        {/* Grace Period Banner */}
        {isInComplimentaryAccess && (
          <SafeText variant="bodySmall" style={styles.graceBanner}>
            Complimentary Sovereign Access: {graceDaysLeft} Days Left
          </SafeText>
        )}

        {/* Header - enters first */}
        <AnimatedElement index={0} delay={0}>
          <View style={styles.header}>
            <CaptionText>{today}</CaptionText>
            <HeadlineText>Recovery Pulse</HeadlineText>
          </View>
        </AnimatedElement>

        {/* Main Score Card - enters second */}
        <AnimatedCard index={1} delay={100}>
          {hasCheckedInToday ? (
            <>
              {/* Recovery Ring as HERO element - DAMPED FLUIDITY */}
              <Animated.View
                entering={FadeIn.delay(500).duration(900)}
                style={styles.ringContainer}
              >
                <RecoveryRing score={score} size={220} />
              </Animated.View>

              {/* Metrics row */}
              <View style={styles.metricsRow}>
                <MetricItem
                  label="Sleep"
                  value={`${todayCheckIn?.sleepHours}h`}
                  subValue={`Quality: ${todayCheckIn?.sleepQuality}/10`}
                />
                <MetricItem
                  label="Fatigue"
                  value={`${todayCheckIn?.fatigue}/10`}
                />
                <MetricItem
                  label="Soreness"
                  value={`${todayCheckIn?.soreness}/10`}
                />
              </View>
            </>
          ) : (
            /* Empty State with BREATHING STAR */
            <View style={styles.emptyState}>
              <BreathingStar size={56} />
              <HeadlineText style={styles.emptyTitle}>No check-in yet</HeadlineText>
              <SafeText variant="body" style={styles.emptyText}>
                Complete your daily check-in to see your recovery score
              </SafeText>
              <View style={styles.emptyButton}>
                <SapphireButton
                  title="Check In Now"
                  onPress={() => router.push('/checkin')}
                  variant="primary"
                />
              </View>
            </View>
          )}
        </AnimatedCard>

        {/* Weekly Average - enters third */}
        {averageScore !== null && (
          <AnimatedCard index={2} delay={200}>
            <View style={styles.weeklyCard}>
              <View>
                <CaptionText>7-Day Average</CaptionText>
                <SafeText
                  variant="metric"
                  color={getRecoveryStatus(averageScore).color}
                  style={styles.weeklyScore}
                >
                  {averageScore}
                </SafeText>
              </View>
              <View style={styles.weeklyStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getRecoveryStatus(averageScore).color },
                  ]}
                />
                <SafeText variant="bodySmall">
                  {getRecoveryStatus(averageScore).label}
                </SafeText>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Quick Actions - enters fourth */}
        {hasCheckedInToday && (
          <AnimatedElement index={3} delay={300}>
            <View style={styles.actions}>
              <SapphireButton
                title="Update Check-In"
                onPress={() => router.push('/checkin')}
                variant="secondary"
                fullWidth
              />
              <SapphireButton
                title="View Trends"
                onPress={() => router.push('/trends')}
                variant="ghost"
                fullWidth
              />
            </View>
          </AnimatedElement>
        )}
      </ScrollView>
      </PremiumGate>
    </View>
  );
}

interface MetricItemProps {
  label: string;
  value: string;
  subValue?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, subValue }) => (
  <View style={styles.metricItem}>
    <CaptionText>{label}</CaptionText>
    <SafeText variant="title" color={PALETTE.pureWhite}>
      {value}
    </SafeText>
    {subValue && (
      <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
        {subValue}
      </SafeText>
    )}
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
    gap: SPACING.lg,
  },
  header: {
    gap: SPACING.xs,
  },
  ringContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  metricItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  weeklyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyScore: {
    marginTop: SPACING.xs,
  },
  weeklyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actions: {
    gap: SPACING.md,
  },
  graceBanner: {
    fontSize: 10,
    fontWeight: '200',
    color: PALETTE.champagneGold,
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: SPACING.xs,
  },
});
