/**
 * Recovery Pulse - Onboarding Flow Controller
 * 5-step flow: Welcome → How It Works → Your Score → Wow Moment → Paywall
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { WelcomeStep } from '../components/onboarding/WelcomeStep';
import { HowItWorksStep } from '../components/onboarding/HowItWorksStep';
import { YourScoreStep } from '../components/onboarding/YourScoreStep';
import { WowMomentStep } from '../components/onboarding/WowMomentStep';
import { PaywallStep } from '../components/onboarding/PaywallStep';

const ONBOARDING_COMPLETE_KEY = '@recovery_pulse_onboarded';

type Step = 'welcome' | 'howItWorks' | 'yourScore' | 'wowMoment' | 'paywall';

const STEP_ORDER: Step[] = [
  'welcome',
  'howItWorks',
  'yourScore',
  'wowMoment',
  'paywall',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');

  const goToNext = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    router.replace('/');
  }, [router]);

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Animated.View
            key="welcome"
            style={StyleSheet.absoluteFill}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
          >
            <WelcomeStep onNext={goToNext} />
          </Animated.View>
        );
      case 'howItWorks':
        return (
          <Animated.View
            key="howItWorks"
            style={StyleSheet.absoluteFill}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
          >
            <HowItWorksStep onNext={goToNext} />
          </Animated.View>
        );
      case 'yourScore':
        return (
          <Animated.View
            key="yourScore"
            style={StyleSheet.absoluteFill}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
          >
            <YourScoreStep onNext={goToNext} />
          </Animated.View>
        );
      case 'wowMoment':
        return (
          <Animated.View
            key="wowMoment"
            style={StyleSheet.absoluteFill}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
          >
            <WowMomentStep onNext={goToNext} />
          </Animated.View>
        );
      case 'paywall':
        return (
          <Animated.View
            key="paywall"
            style={StyleSheet.absoluteFill}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
          >
            <PaywallStep onComplete={completeOnboarding} />
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Deep background */}
      <LinearGradient
        colors={['#0F1014', '#0A0B0D', '#050506']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
});
