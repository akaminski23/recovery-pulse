/**
 * Recovery Pulse - Sapphire Glass Card
 * 3D depth simulation with expo-blur
 */

import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { RADII, GLASS, SPACING } from '../constants/theme';

interface SapphireCardProps {
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  intensity?: number;
  padding?: keyof typeof SPACING | number;
}

export const SapphireCard: React.FC<PropsWithChildren<SapphireCardProps>> = ({
  children,
  style,
  innerStyle,
  intensity = GLASS.blur,
  padding = 'lg',
}) => {
  const paddingValue = typeof padding === 'number' ? padding : SPACING[padding];

  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.blur, style]}>
      <View style={[styles.inner, { padding: paddingValue }, innerStyle]}>
        {children}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blur: {
    borderRadius: RADII.cardLarge,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  inner: {
    backgroundColor: GLASS.backgroundColor,
    // 3D Depth - lighter top, darker bottom
    borderTopWidth: GLASS.borderTopWidth,
    borderTopColor: GLASS.borderTopColor,
    borderBottomWidth: GLASS.borderBottomWidth,
    borderBottomColor: GLASS.borderBottomColor,
    borderLeftWidth: GLASS.borderLeftWidth,
    borderRightWidth: GLASS.borderRightWidth,
    borderLeftColor: GLASS.borderLeftColor,
    borderRightColor: GLASS.borderRightColor,
  },
});
