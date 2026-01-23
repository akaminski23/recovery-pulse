/**
 * Recovery Pulse - Brand Logo
 * THE GATEWAY PROTOCOL: High-fidelity SVG logo
 *
 * Pulse waveform with champagne gold accent
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PALETTE } from '../constants/theme';

interface PulseLogoProps {
  size?: number;
  color?: string;
}

export const PulseLogo: React.FC<PulseLogoProps> = ({
  size = 120,
  color = PALETTE.champagneGoldBright,
}) => {
  const strokeWidth = size * 0.025;
  const viewBox = '0 0 100 100';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={viewBox}>
        <Defs>
          {/* Gold gradient for the pulse line */}
          <LinearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="rgba(212, 175, 55, 0.3)" />
            <Stop offset="50%" stopColor={color} />
            <Stop offset="100%" stopColor="rgba(212, 175, 55, 0.3)" />
          </LinearGradient>

          {/* Glow gradient */}
          <LinearGradient id="glowGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="rgba(212, 175, 55, 0.4)" />
            <Stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </LinearGradient>
        </Defs>

        {/* Outer ring - subtle */}
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth * 0.5}
          fill="none"
        />

        {/* Inner ring - gold accent */}
        <Circle
          cx="50"
          cy="50"
          r="38"
          stroke="rgba(212, 175, 55, 0.2)"
          strokeWidth={strokeWidth * 0.3}
          fill="none"
        />

        {/* The Pulse - Hero Element */}
        {/* Heartbeat/Recovery pulse waveform */}
        <Path
          d="M 15 50
             L 30 50
             L 35 50
             L 40 35
             L 45 65
             L 50 25
             L 55 70
             L 60 45
             L 65 50
             L 85 50"
          stroke="url(#pulseGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Center dot - the heartbeat origin */}
        <Circle
          cx="50"
          cy="50"
          r={strokeWidth * 1.5}
          fill={color}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
