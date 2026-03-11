/**
 * Onboarding Step 2: How It Works
 * "30 Seconds Each Morning" — 3 feature cards
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SafeText } from '../SafeText';
import { SapphireButton } from '../SapphireButton';
import { PALETTE, SPACING, RADII } from '../../constants/theme';

interface HowItWorksStepProps {
  onNext: () => void;
}

const FEATURES = [
  {
    icon: 'moon' as const,
    title: 'Sleep Quality',
    description: 'Rate how well you slept on a simple 1-10 scale',
    color: '#6C8EEF',
    bgColor: 'rgba(108, 142, 239, 0.15)',
  },
  {
    icon: 'battery-half' as const,
    title: 'Fatigue Level',
    description: 'Log how tired your body feels right now',
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.15)',
  },
  {
    icon: 'fitness' as const,
    title: 'Muscle Soreness',
    description: 'Track soreness from yesterday\'s training',
    color: '#E0115F',
    bgColor: 'rgba(224, 17, 95, 0.15)',
  },
];

export const HowItWorksStep: React.FC<HowItWorksStepProps> = ({ onNext }) => {
  const insets = useSafeAreaInsets();

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
          STEP 1 OF 4
        </SafeText>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.title} numberOfLines={2}>
          30 Seconds{'\n'}Each Morning
        </SafeText>
      </Animated.View>

      {/* Feature Cards */}
      {FEATURES.map((feature, index) => (
        <Animated.View
          key={feature.title}
          entering={FadeInUp.delay(360 + index * 80).springify().damping(20).stiffness(100)}
          style={styles.featureCard}
        >
          <View style={[styles.iconBox, { backgroundColor: feature.bgColor }]}>
            <Ionicons name={feature.icon} size={22} color={feature.color} />
          </View>
          <View style={styles.featureText}>
            <SafeText style={styles.featureTitle} numberOfLines={1}>
              {feature.title}
            </SafeText>
            <SafeText
              style={styles.featureDescription}
              numberOfLines={2}
              adjustsFontSizeToFit={false}
            >
              {feature.description}
            </SafeText>
          </View>
        </Animated.View>
      ))}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA */}
      <Animated.View
        entering={FadeInUp.delay(680).springify().damping(20).stiffness(100)}
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
    marginBottom: SPACING.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: PALETTE.pureWhite,
  },
  featureDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: PALETTE.subtleWhite,
  },
  spacer: {
    flex: 1,
  },
  ctaContainer: {
    alignItems: 'center',
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 48,
  },
});
