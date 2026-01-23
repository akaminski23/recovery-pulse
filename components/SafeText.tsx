/**
 * Recovery Pulse - Safe Text Component
 * Text with overflow protection and typography variants
 */

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { TYPOGRAPHY } from '../constants/theme';

type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'headline'
  | 'title'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'metric';

interface SafeTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export const SafeText: React.FC<SafeTextProps> = ({
  variant = 'body',
  style,
  color,
  numberOfLines = 2,
  children,
  ...props
}) => {
  const variantStyle = TYPOGRAPHY[variant] as TextStyle;
  const colorStyle = color ? { color } : {};

  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
      style={[variantStyle, colorStyle, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Convenience exports for specific text types
export const DisplayText: React.FC<Omit<SafeTextProps, 'variant'>> = (props) => (
  <SafeText variant="displayLarge" numberOfLines={1} {...props} />
);

export const HeadlineText: React.FC<Omit<SafeTextProps, 'variant'>> = (props) => (
  <SafeText variant="headline" numberOfLines={1} {...props} />
);

export const BodyText: React.FC<Omit<SafeTextProps, 'variant'>> = (props) => (
  <SafeText variant="body" {...props} />
);

export const CaptionText: React.FC<Omit<SafeTextProps, 'variant'>> = (props) => (
  <SafeText variant="caption" numberOfLines={1} {...props} />
);

export const MetricText: React.FC<Omit<SafeTextProps, 'variant'>> = (props) => (
  <SafeText variant="metric" numberOfLines={1} {...props} />
);
