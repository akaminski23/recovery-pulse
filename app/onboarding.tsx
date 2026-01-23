/**
 * Recovery Pulse - The Gateway Protocol
 * 3-Screen Luxury Onboarding Flow + Instant Biometric
 *
 * Screen 1: The Brand (The Awakening)
 * Screen 2: The Legacy (The Promise)
 * Screen 3: The Essence (The Value Proposition) + Instant FaceID
 *
 * DAMPED FLUIDITY: damping 24, stiffness 60, zero overshoot
 * DISSOLVE TRANSITION: 800ms fade + staggered dashboard slide-up
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withRepeat,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { PulseLogo } from '../components/PulseLogo';
import { SapphireCard } from '../components/SapphireCard';
import { SafeText } from '../components/SafeText';
import { PALETTE, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// GATEWAY PROTOCOL SPRINGS - Zero overshoot
const GATEWAY_SPRING = {
  damping: 24,
  stiffness: 60,
};

// Storage key for onboarding completion
const ONBOARDING_COMPLETE_KEY = '@recovery_pulse_onboarded';

type OnboardingStep = 'brand' | 'legacy' | 'essence' | 'dissolving' | 'complete';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('brand');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Screen 1: Brand animations
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(1);

  // Screen 2: Legacy animations
  const legacyOpacity = useSharedValue(0);
  const gradientPosition = useSharedValue(0);

  // Screen 3: Essence animations
  const essenceOpacity = useSharedValue(0);
  const essenceButtonScale = useSharedValue(1);

  // Dissolve transition animation
  const dissolveOpacity = useSharedValue(1);

  // ========================================
  // SCREEN 1: THE BRAND (The Awakening)
  // ========================================
  useEffect(() => {
    if (currentStep === 'brand') {
      // Start haptic sequence
      const hapticInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 400);

      // Logo fade in with breathing - use spring for natural motion
      logoOpacity.value = withSpring(0.9, {
        damping: 20,
        stiffness: 40,
      });

      // Breathing scale animation - using spring for organic feel
      logoScale.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 15, stiffness: 20 }),
          withSpring(1.0, { damping: 15, stiffness: 20 })
        ),
        -1,
        false
      );

      // Auto-advance after 3.5s
      const timer = setTimeout(() => {
        clearInterval(hapticInterval);
        setCurrentStep('legacy');
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearInterval(hapticInterval);
      };
    }
  }, [currentStep, logoOpacity, logoScale]);

  // ========================================
  // SCREEN 2: THE LEGACY (The Promise)
  // ========================================
  useEffect(() => {
    if (currentStep === 'legacy') {
      // Cross-fade in - spring for natural motion
      legacyOpacity.value = withSpring(1, GATEWAY_SPRING);

      // Moving gradient animation (slow drift) - spring for organic motion
      gradientPosition.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 30, stiffness: 8 }),
          withSpring(0, { damping: 30, stiffness: 8 })
        ),
        -1,
        false
      );

      // Auto-advance after 3s to Essence
      const timer = setTimeout(() => {
        setCurrentStep('essence');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, legacyOpacity, gradientPosition]);

  // ========================================
  // SCREEN 3: THE ESSENCE (The Value Proposition)
  // ========================================
  useEffect(() => {
    if (currentStep === 'essence') {
      // Cross-fade in - spring for natural motion
      essenceOpacity.value = withSpring(1, GATEWAY_SPRING);
    }
  }, [currentStep, essenceOpacity]);

  const handleContinueToSecurity = useCallback(async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);

    // Haptic feedback - 16ms before animation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Button press animation
    essenceButtonScale.value = withSpring(0.96, GATEWAY_SPRING);

    // Wait 16ms haptic lead time
    await new Promise((resolve) => setTimeout(resolve, 16));

    try {
      // Check if biometrics are available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Check for Face ID support (type 2 = FACIAL_RECOGNITION)
      const hasFaceID = supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      );

      if (!hasHardware || !isEnrolled) {
        // No biometrics available - proceed directly
        triggerDissolveTransition();
        return;
      }

      // BIOMETRIC ENFORCEMENT: Prioritize Face ID
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to Access Vault',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        // This ensures biometric is attempted first
        requireConfirmation: false,
      });

      if (result.success) {
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerDissolveTransition();
      } else {
        // Auth failed or cancelled - reset button
        essenceButtonScale.value = withSpring(1, GATEWAY_SPRING);
        setIsAuthenticating(false);
      }
    } catch (error) {
      // On error, proceed anyway
      triggerDissolveTransition();
    }
  }, [isAuthenticating, essenceButtonScale]);

  // ========================================
  // THE DISSOLVE TRANSITION
  // ========================================
  const triggerDissolveTransition = useCallback(async () => {
    // Save onboarding completion
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');

    // Set dissolving state
    setCurrentStep('dissolving');

    // 800ms fade out with easing
    dissolveOpacity.value = withTiming(0, {
      duration: 800,
      easing: Easing.inOut(Easing.ease),
    });

    // Navigate to dashboard after dissolve completes
    // Dashboard will handle its own staggered slide-up entrance
    setTimeout(() => {
      router.replace('/');
    }, 850);
  }, [dissolveOpacity, router]);

  // ========================================
  // ANIMATED STYLES
  // ========================================
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const legacyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: legacyOpacity.value,
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          gradientPosition.value,
          [0, 1],
          [-SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.3]
        ),
      },
      { rotate: '5deg' },
    ],
  }));

  const essenceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: essenceOpacity.value,
  }));

  const essenceButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: essenceButtonScale.value }],
  }));

  // Dissolve transition - entire screen fades out
  const dissolveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dissolveOpacity.value,
  }));

  // ========================================
  // RENDER
  // ========================================
  return (
    <View style={styles.container}>
      {/* Deep Obsidian Background - Layered for depth */}
      <LinearGradient
        colors={['#0A0B0D', '#050506', '#020202']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Radial effect simulation - vignette layers */}
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />

      {/* ====== SCREEN 1: THE BRAND ====== */}
      {currentStep === 'brand' && (
        <Animated.View style={[styles.screen, logoAnimatedStyle]}>
          <PulseLogo size={180} />
          <SafeText
            variant="caption"
            color={PALETTE.titaniumSilverMuted}
            style={styles.brandSubtitle}
          >
            RECOVERY PULSE
          </SafeText>
        </Animated.View>
      )}

      {/* ====== SCREEN 2: THE LEGACY ====== */}
      {currentStep === 'legacy' && (
        <Animated.View
          style={[styles.screen, legacyAnimatedStyle]}
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(600)}
        >
          {/* Moving Sapphire Light behind text */}
          <Animated.View style={[styles.sapphireLight, gradientAnimatedStyle]}>
            <LinearGradient
              colors={[
                'rgba(212, 175, 55, 0)',
                'rgba(212, 175, 55, 0.08)',
                'rgba(212, 175, 55, 0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sapphireLightGradient}
            />
          </Animated.View>

          {/* Legacy Typography */}
          <SafeText style={styles.legacyText}>YOUR LEGACY,</SafeText>
          <SafeText style={styles.legacyText}>SECURED.</SafeText>
        </Animated.View>
      )}

      {/* ====== SCREEN 3: THE ESSENCE + INSTANT BIOMETRIC ====== */}
      {(currentStep === 'essence' || currentStep === 'dissolving') && (
        <Animated.View
          style={[styles.screen, essenceAnimatedStyle, dissolveAnimatedStyle]}
          entering={FadeIn.duration(800)}
        >
          {/* Headline */}
          <SafeText style={styles.essenceHeadline}>PRECISION</SafeText>
          <SafeText style={styles.essenceHeadline}>RECOVERY</SafeText>

          {/* Body Statement */}
          <SafeText style={styles.essenceBody}>
            Optimize your peak performance through clinical-grade biomarker
            tracking and AI-driven recovery protocols.
          </SafeText>

          {/* CTA Button with 3D Glass border */}
          <Animated.View
            style={[
              styles.essenceButtonContainer,
              { paddingBottom: insets.bottom + 108 },
              essenceButtonAnimatedStyle,
            ]}
          >
            <View style={styles.essenceButtonWrapper}>
              <SapphireCard padding="lg">
                <SafeText
                  variant="title"
                  color={PALETTE.champagneGoldBright}
                  style={styles.essenceButtonText}
                  onPress={handleContinueToSecurity}
                >
                  CONTINUE TO SECURITY
                </SafeText>
              </SapphireCard>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020202',
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Vignette effects for radial simulation
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // Simulate radial with shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.2 },
    shadowOpacity: 0.8,
    shadowRadius: SCREEN_HEIGHT * 0.3,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -SCREEN_HEIGHT * 0.2 },
    shadowOpacity: 0.9,
    shadowRadius: SCREEN_HEIGHT * 0.3,
  },

  // Screen 1: Brand
  brandSubtitle: {
    marginTop: SPACING.xl,
    letterSpacing: 6,
  },

  // Screen 2: Legacy
  sapphireLight: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT,
  },
  sapphireLightGradient: {
    flex: 1,
  },
  legacyText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '200',
    letterSpacing: 4,
    color: 'rgba(212, 175, 55, 0.9)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // Screen 3: Essence
  essenceHeadline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '300',
    letterSpacing: 4,
    color: 'rgba(212, 175, 55, 0.9)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  essenceBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '200',
    color: 'rgba(226, 232, 240, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: SPACING.xl,
  },
  essenceButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  essenceButtonWrapper: {
    // 3D Glass effect - 0.5px white top border
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  essenceButtonText: {
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
