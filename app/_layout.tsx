/**
 * Recovery Pulse - Root Layout
 * THE GATEWAY PROTOCOL: Database init + onboarding check
 */

import React, { useEffect } from 'react';
import { Stack, Redirect, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';
import { useOnboarding } from '../hooks/useOnboarding';
import { initializePurchases } from '../services/purchases';
import { PALETTE } from '../constants/theme';
import { GradientBackground } from '../components/GradientBackground';
import { SafeText } from '../components/SafeText';

export default function RootLayout() {
  const { isReady: dbReady, error } = useDatabase();
  const { isLoading: onboardingLoading, hasCompletedOnboarding } = useOnboarding();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Initialize RevenueCat
  useEffect(() => {
    initializePurchases();
  }, []);

  // Wait for both database and onboarding check
  const isLoading = !dbReady || onboardingLoading;

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <GradientBackground />
        <SafeText variant="headline" color={PALETTE.danger}>
          Database Error
        </SafeText>
        <SafeText variant="body">{error.message}</SafeText>
      </View>
    );
  }

  if (isLoading || !navigationState?.key) {
    return (
      <View style={styles.loadingContainer}>
        <GradientBackground />
        <ActivityIndicator size="large" color={PALETTE.champagneGold} />
      </View>
    );
  }

  // Check if we're on the onboarding screen
  const isOnboardingScreen = segments[0] === 'onboarding';

  // Redirect logic
  if (!hasCompletedOnboarding && !isOnboardingScreen) {
    return <Redirect href="/onboarding" />;
  }

  if (hasCompletedOnboarding && isOnboardingScreen) {
    return <Redirect href="/" />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: PALETTE.obsidian },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: PALETTE.obsidian,
  },
});
