/**
 * Recovery Pulse - Premium Gate
 * Blur overlay for locked content
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { HeadlineText, SafeText } from './SafeText';
import { SapphireButton } from './SapphireButton';
import { PALETTE, SPACING, RADII } from '../constants/theme';

interface PremiumGateProps {
  children: React.ReactNode;
  isLocked: boolean;
  onUpgrade: () => void;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  isLocked,
  onUpgrade,
}) => {
  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade();
  };

  return (
    <View style={styles.container}>
      {children}

      {isLocked && (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={40} style={styles.blur} tint="dark">
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Feather
                  name="lock"
                  size={32}
                  color={PALETTE.champagneGold}
                />
              </View>

              <HeadlineText style={styles.title}>
                Upgrade to View Insights
              </HeadlineText>

              <SafeText
                variant="bodySmall"
                color={PALETTE.titaniumSilverMuted}
                style={styles.description}
              >
                Unlock detailed trends, analytics, and AI insights
              </SafeText>

              <SapphireButton
                title="Upgrade Now"
                onPress={handleUpgrade}
                variant="primary"
              />
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: PALETTE.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});

export default PremiumGate;
