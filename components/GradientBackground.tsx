/**
 * Recovery Pulse - Deep Gradient Background
 * Creates 3D depth illusion with layered gradients
 *
 * THE BILLIONAIRE PROTOCOL: Background must have DEPTH, not be flat
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Deep Background with multiple gradient layers
 * Creates illusion of radial gradient using vertical + vignette layers
 */
export const GradientBackground: React.FC = () => (
  <View style={StyleSheet.absoluteFill}>
    {/* Base layer - vertical gradient (lighter top, darker bottom) */}
    <LinearGradient
      colors={['#0F1014', '#0A0B0D', '#050506']}
      locations={[0, 0.4, 1]}
      style={StyleSheet.absoluteFill}
    />

    {/* Center spotlight effect - subtle lighter area in upper portion */}
    <LinearGradient
      colors={[
        'rgba(20, 22, 28, 0.8)',
        'rgba(12, 14, 18, 0.4)',
        'rgba(5, 5, 6, 0)',
      ]}
      locations={[0, 0.3, 0.7]}
      style={[StyleSheet.absoluteFill, styles.spotlight]}
    />

    {/* Vignette effect - darker edges */}
    <View style={styles.vignetteTop} />
    <View style={styles.vignetteBottom} />
  </View>
);

const styles = StyleSheet.create({
  spotlight: {
    opacity: 0.6,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // Top shadow creates depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 80 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
