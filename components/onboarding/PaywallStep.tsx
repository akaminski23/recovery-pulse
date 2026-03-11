/**
 * Onboarding Step 5: Inline Paywall
 * Plan selection + trial timeline + escape hatch
 * Apple 3.1.2 compliant
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SafeText } from '../SafeText';
import { PALETTE, SPACING, RADII } from '../../constants/theme';
import { useSubscription } from '../../hooks/useSubscription';

interface PaywallStepProps {
  onComplete: () => void;
}

type PlanType = 'annual' | 'monthly';

const FEATURES = [
  { icon: 'analytics' as const, label: 'Recovery Analytics' },
  { icon: 'bar-chart' as const, label: 'Weekly Trends' },
  { icon: 'shield-checkmark' as const, label: 'Bio-Data Vault' },
];

const TIMELINE = [
  { day: 'Today', label: 'Full access begins', active: true },
  { day: 'Day 5', label: 'Reminder before trial ends', active: false },
  { day: 'Day 7', label: 'Billing starts', active: false },
];

const LEGAL_URLS = {
  privacy: 'https://github.com/akaminski23/recovery-pulse/blob/main/docs/PRIVACY_POLICY.md',
  terms: 'https://github.com/akaminski23/recovery-pulse/blob/main/docs/TERMS_OF_USE.md',
};

export const PaywallStep: React.FC<PaywallStepProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    annualPrice,
    monthlyPrice,
    subscribeAnnual,
    subscribeMonthly,
    restore,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');

  const handleSelectPlan = (plan: PlanType) => {
    Haptics.selectionAsync();
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const success = selectedPlan === 'annual'
      ? await subscribeAnnual()
      : await subscribeMonthly();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await restore();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Step Label */}
      <Animated.View
        entering={FadeInUp.delay(100).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.stepLabel} numberOfLines={1}>
          STEP 4 OF 4
        </SafeText>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.title} numberOfLines={2}>
          Unlock Your{'\n'}Full Potential
        </SafeText>
      </Animated.View>

      {/* Features */}
      <Animated.View
        entering={FadeInUp.delay(300).springify().damping(20).stiffness(100)}
        style={styles.featuresCard}
      >
        {FEATURES.map((feature) => (
          <View key={feature.label} style={styles.featureRow}>
            <Ionicons
              name={feature.icon}
              size={20}
              color={PALETTE.champagneGoldBright}
            />
            <SafeText style={styles.featureLabel} numberOfLines={1}>
              {feature.label}
            </SafeText>
          </View>
        ))}
      </Animated.View>

      {/* Trial Timeline */}
      <Animated.View
        entering={FadeInUp.delay(400).springify().damping(20).stiffness(100)}
        style={styles.timeline}
      >
        {TIMELINE.map((item, index) => (
          <View key={item.day} style={styles.timelineRow}>
            <View style={styles.timelineDotColumn}>
              <View
                style={[
                  styles.timelineDot,
                  item.active && styles.timelineDotActive,
                ]}
              />
              {index < TIMELINE.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <View style={styles.timelineText}>
              <SafeText style={styles.timelineDay} numberOfLines={1}>
                {item.day}
              </SafeText>
              <SafeText style={styles.timelineLabel} numberOfLines={1}>
                {item.label}
              </SafeText>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Plan Cards */}
      <Animated.View
        entering={FadeInUp.delay(500).springify().damping(20).stiffness(100)}
        style={styles.plansRow}
      >
        {/* Annual */}
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'annual' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('annual')}
        >
          <View style={styles.saveBadge}>
            <SafeText style={styles.saveBadgeText} numberOfLines={1}>
              SAVE 49%
            </SafeText>
          </View>
          <SafeText style={styles.planName} numberOfLines={1}>
            Annual
          </SafeText>
          <SafeText style={styles.planPrice} numberOfLines={1}>
            {annualPrice || '$79.99'}
          </SafeText>
          <SafeText style={styles.planPeriod} numberOfLines={1}>
            per year
          </SafeText>
          <SafeText style={styles.planTrial} numberOfLines={1}>
            7-day free trial
          </SafeText>
        </Pressable>

        {/* Monthly */}
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('monthly')}
        >
          <SafeText style={styles.planName} numberOfLines={1}>
            Monthly
          </SafeText>
          <SafeText style={styles.planPrice} numberOfLines={1}>
            {monthlyPrice || '$12.99'}
          </SafeText>
          <SafeText style={styles.planPeriod} numberOfLines={1}>
            per month
          </SafeText>
          <SafeText style={styles.planTrial} numberOfLines={1}>
            7-day free trial
          </SafeText>
        </Pressable>
      </Animated.View>

      {/* CTA */}
      <Animated.View
        entering={FadeInUp.delay(600).springify().damping(20).stiffness(100)}
        style={styles.ctaSection}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={PALETTE.champagneGoldBright} />
        ) : (
          <>
            <Pressable style={styles.ctaButton} onPress={handleSubscribe}>
              <SafeText style={styles.ctaText} numberOfLines={1}>
                START 7-DAY FREE TRIAL
              </SafeText>
            </Pressable>

            {/* Skip */}
            <Pressable
              style={styles.skipButton}
              onPress={handleSkip}
              hitSlop={12}
            >
              <SafeText style={styles.skipText} numberOfLines={1}>
                Maybe later
              </SafeText>
            </Pressable>
          </>
        )}
      </Animated.View>

      {/* Legal Disclosure */}
      <Animated.View
        entering={FadeIn.delay(700)}
        style={styles.legalSection}
      >
        <SafeText style={styles.legalText} numberOfLines={6}>
          Payment will be charged to your Apple ID account at confirmation of
          purchase. Subscription automatically renews unless cancelled at least
          24 hours before the end of the current period. You can manage and
          cancel your subscriptions in App Store &gt; Account &gt; Subscriptions.
        </SafeText>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <Pressable onPress={handleRestore} hitSlop={8}>
            <SafeText style={styles.footerLink} numberOfLines={1}>
              Restore Purchases
            </SafeText>
          </Pressable>
          <SafeText style={styles.footerDivider} numberOfLines={1}>
            {' | '}
          </SafeText>
          <Pressable onPress={() => Linking.openURL(LEGAL_URLS.privacy)} hitSlop={8}>
            <SafeText style={styles.footerLink} numberOfLines={1}>
              Privacy Policy
            </SafeText>
          </Pressable>
          <SafeText style={styles.footerDivider} numberOfLines={1}>
            {' | '}
          </SafeText>
          <Pressable onPress={() => Linking.openURL(LEGAL_URLS.terms)} hitSlop={8}>
            <SafeText style={styles.footerLink} numberOfLines={1}>
              Terms of Use
            </SafeText>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
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
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '200',
    letterSpacing: 1,
    color: PALETTE.pureWhite,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featuresCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: PALETTE.pureWhite,
  },
  timeline: {
    width: '100%',
    maxWidth: 320,
    marginBottom: SPACING.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timelineDotColumn: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  timelineDotActive: {
    backgroundColor: PALETTE.champagneGoldBright,
    borderColor: PALETTE.champagneGoldBright,
    shadowColor: PALETTE.champagneGoldBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  timelineText: {
    flex: 1,
    paddingBottom: SPACING.md,
    gap: 2,
  },
  timelineDay: {
    fontSize: 14,
    fontWeight: '500',
    color: PALETTE.pureWhite,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
  },
  plansRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 320,
    marginBottom: SPACING.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: PALETTE.champagneGoldBright,
    borderWidth: 1.5,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: -4,
    backgroundColor: PALETTE.champagneGoldBright,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.badge,
    borderCurve: 'continuous',
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: PALETTE.obsidian,
  },
  planName: {
    fontSize: 14,
    fontWeight: '500',
    color: PALETTE.pureWhite,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '300',
    color: PALETTE.pureWhite,
    letterSpacing: -0.5,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
  },
  planTrial: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(80, 200, 120, 0.9)',
    marginTop: 4,
  },
  // planNoTrial removed — both plans now show 7-day free trial
  ctaSection: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    width: '100%',
    minHeight: 52,
    backgroundColor: 'rgba(212, 175, 55, 0.85)',
    borderRadius: RADII.button,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
    color: PALETTE.obsidian,
  },
  skipButton: {
    padding: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
  },
  legalSection: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
    color: PALETTE.mutedWhite,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
    textDecorationLine: 'underline',
  },
  footerDivider: {
    fontSize: 12,
    color: PALETTE.mutedWhite,
  },
});
