/**
 * Recovery Pulse - Sovereign Paywall
 * Dual Pricing UI with Legal Compliance
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SafeText, HeadlineText, CaptionText } from './SafeText';
import { SapphireButton } from './SapphireButton';
import { PALETTE, RADII, SPACING, GLASS } from '../constants/theme';
import { useSubscription } from '../hooks/useSubscription';

interface SovereignPaywallProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: 'activity' as const, label: 'HRV Analytics' },
  { icon: 'cpu' as const, label: 'AI Recovery Insights' },
  { icon: 'database' as const, label: 'Bio-Data Vault' },
];

const LEGAL_URLS = {
  privacy: 'https://github.com/akaminski23/recovery-pulse/blob/main/docs/PRIVACY_POLICY.md',
  terms: 'https://github.com/akaminski23/recovery-pulse/blob/main/docs/TERMS_OF_USE.md',
};

type PlanType = 'annual' | 'monthly';

export const SovereignPaywall: React.FC<SovereignPaywallProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    annualPrice,
    monthlyPrice,
    subscribeAnnual,
    subscribeMonthly,
    restore,
    error,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');

  const handleSelectPlan = (plan: PlanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = selectedPlan === 'annual'
      ? await subscribeAnnual()
      : await subscribeMonthly();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await restore();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const openPrivacyPolicy = () => {
    Linking.openURL(LEGAL_URLS.privacy);
  };

  const openTermsOfUse = () => {
    Linking.openURL(LEGAL_URLS.terms);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: insets.top + SPACING.lg,
              paddingBottom: insets.bottom + 108,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button */}
          <Pressable
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={16}
          >
            <Feather name="x" size={24} color={PALETTE.subtleWhite} />
          </Pressable>

          {/* Crown Icon */}
          <View style={styles.iconContainer}>
            <Feather
              name="award"
              size={64}
              color={PALETTE.champagneGold}
              style={styles.crownIcon}
            />
          </View>

          {/* Headline */}
          <CaptionText style={styles.sovereignLabel}>
            ACTIVATE SOVEREIGN ACCESS
          </CaptionText>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature) => (
              <View key={feature.label} style={styles.featureRow}>
                <Feather
                  name={feature.icon}
                  size={20}
                  color={PALETTE.champagneGold}
                  style={styles.featureIcon}
                />
                <SafeText variant="body">{feature.label}</SafeText>
              </View>
            ))}
          </View>

          {/* Dual Pricing Cards */}
          <View style={styles.pricingContainer}>
            {/* Annual - Featured */}
            <Pressable
              style={[
                styles.pricingCard,
                selectedPlan === 'annual' && styles.pricingCardSelected,
              ]}
              onPress={() => handleSelectPlan('annual')}
            >
              <View style={styles.featuredBadge}>
                <SafeText variant="caption" style={styles.featuredText}>
                  BEST VALUE
                </SafeText>
              </View>
              <SafeText variant="title" style={styles.planName}>
                Sovereign Annual
              </SafeText>
              <HeadlineText style={styles.planPrice}>
                {annualPrice || '$79.99'}
                <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
                  /year
                </SafeText>
              </HeadlineText>
              <SafeText variant="bodySmall" color={PALETTE.success}>
                7-Day Free Trial
              </SafeText>
              {selectedPlan === 'annual' && (
                <View style={styles.checkmark}>
                  <Feather name="check-circle" size={20} color={PALETTE.champagneGold} />
                </View>
              )}
            </Pressable>

            {/* Monthly */}
            <Pressable
              style={[
                styles.pricingCard,
                styles.pricingCardMonthly,
                selectedPlan === 'monthly' && styles.pricingCardSelected,
              ]}
              onPress={() => handleSelectPlan('monthly')}
            >
              <SafeText variant="title" style={styles.planName}>
                Elite Monthly
              </SafeText>
              <HeadlineText style={styles.planPrice}>
                {monthlyPrice || '$12.99'}
                <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
                  /month
                </SafeText>
              </HeadlineText>
              <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
                No commitment
              </SafeText>
              {selectedPlan === 'monthly' && (
                <View style={styles.checkmark}>
                  <Feather name="check-circle" size={20} color={PALETTE.champagneGold} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Error Message */}
          {error && (
            <SafeText variant="bodySmall" color={PALETTE.danger} style={styles.error}>
              {error}
            </SafeText>
          )}

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={PALETTE.champagneGold} />
            ) : (
              <>
                <SapphireButton
                  title={
                    selectedPlan === 'annual'
                      ? 'START 7-DAY FREE TRIAL'
                      : 'SUBSCRIBE NOW'
                  }
                  onPress={handleSubscribe}
                  variant="primary"
                />

                <SafeText
                  variant="bodySmall"
                  color={PALETTE.titaniumSilverMuted}
                  style={styles.priceText}
                >
                  {selectedPlan === 'annual'
                    ? `Then ${annualPrice || '$79.99'}/year. Cancel anytime.`
                    : 'Cancel anytime.'}
                </SafeText>

                {/* Restore */}
                <Pressable
                  style={styles.restoreButton}
                  onPress={handleRestore}
                  hitSlop={12}
                >
                  <SafeText variant="bodySmall" color={PALETTE.subtleWhite}>
                    Restore Purchases
                  </SafeText>
                </Pressable>
              </>
            )}
          </View>

          {/* Legal Footer */}
          <View style={styles.legalFooter}>
            <Pressable onPress={openPrivacyPolicy} hitSlop={8}>
              <SafeText variant="bodySmall" style={styles.legalLink}>
                Privacy Policy
              </SafeText>
            </Pressable>
            <SafeText variant="bodySmall" style={styles.legalDivider}>
              {' \u2022 '}
            </SafeText>
            <Pressable onPress={openTermsOfUse} hitSlop={8}>
              <SafeText variant="bodySmall" style={styles.legalLink}>
                Terms of Use
              </SafeText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  crownIcon: {
    shadowColor: PALETTE.champagneGoldBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  sovereignLabel: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
    color: PALETTE.champagneGold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderWidth: 0.5,
    borderColor: PALETTE.borderLight,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
    maxWidth: 320,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    width: 24,
  },
  pricingContainer: {
    width: '100%',
    maxWidth: 320,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    padding: SPACING.lg,
    borderWidth: 0.5,
    borderColor: PALETTE.borderLight,
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: PALETTE.champagneGold,
    borderWidth: 1.5,
  },
  pricingCardMonthly: {
    // No featured badge styling
  },
  featuredBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: PALETTE.champagneGold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.badge,
    borderCurve: 'continuous',
  },
  featuredText: {
    color: PALETTE.obsidian,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planName: {
    marginBottom: SPACING.xs,
  },
  planPrice: {
    marginBottom: SPACING.xs,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
  error: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.md,
    maxWidth: 320,
  },
  priceText: {
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  restoreButton: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
  },
  legalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    opacity: 0.4,
  },
  legalLink: {
    color: PALETTE.pureWhite,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    color: PALETTE.pureWhite,
  },
});

export default SovereignPaywall;
