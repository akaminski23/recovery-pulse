/**
 * Recovery Pulse - Theme Constants
 * Billionaire Tier Aesthetic
 */

export const PALETTE = {
  // Primary
  champagneGold: 'rgba(212, 175, 55, 0.85)',
  champagneGoldMuted: 'rgba(212, 175, 55, 0.4)',
  champagneGoldBright: 'rgba(212, 175, 55, 1)',

  // Secondary
  titaniumSilver: 'rgba(164, 196, 211, 0.9)',
  titaniumSilverMuted: 'rgba(164, 196, 211, 0.5)',

  // Neutrals
  pureWhite: 'rgba(255, 255, 255, 0.9)',
  subtleWhite: 'rgba(255, 255, 255, 0.6)',
  mutedWhite: 'rgba(255, 255, 255, 0.3)',

  // Backgrounds
  obsidian: '#050505',
  surface: '#0A0A0A',
  elevated: '#0F0F0F',

  // Semantic
  success: 'rgba(80, 200, 120, 0.9)',
  successMuted: 'rgba(80, 200, 120, 0.4)',
  warning: 'rgba(255, 179, 71, 0.9)',
  warningMuted: 'rgba(255, 179, 71, 0.4)',
  danger: 'rgba(224, 17, 95, 0.9)',
  dangerMuted: 'rgba(224, 17, 95, 0.4)',

  // Borders
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderDark: 'rgba(0, 0, 0, 0.3)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
} as const;

export const GRADIENT_COLORS = ['#0D0E12', '#07080A', '#050505'] as const;
export const GRADIENT_LOCATIONS = [0, 0.5, 1] as const;

export const RADII = {
  badge: 6,
  chip: 8,
  button: 12,
  card: 16,
  cardLarge: 24,
  modal: 20,
  sheet: 24,
  pill: 1000,
} as const;

export const TYPOGRAPHY = {
  displayLarge: {
    fontSize: 34,
    fontWeight: '300' as const,
    letterSpacing: 0.5,
    color: PALETTE.pureWhite,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '300' as const,
    letterSpacing: 0.3,
    color: PALETTE.pureWhite,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
    color: PALETTE.pureWhite,
  },
  title: {
    fontSize: 17,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    color: PALETTE.pureWhite,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: PALETTE.subtleWhite,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: PALETTE.subtleWhite,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: PALETTE.titaniumSilverMuted,
  },
  metric: {
    fontSize: 48,
    fontWeight: '300' as const,
    letterSpacing: -1,
    color: PALETTE.champagneGold,
  },
  sovereignHeadline: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 4,
    color: PALETTE.champagneGold,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const HIT_TARGET = 44;

export const GLASS = {
  blur: 40,
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderTopWidth: 0.5,
  borderTopColor: PALETTE.borderLight,
  borderBottomWidth: 0.5,
  borderBottomColor: PALETTE.borderDark,
  borderLeftWidth: 0.5,
  borderRightWidth: 0.5,
  borderLeftColor: PALETTE.borderSubtle,
  borderRightColor: PALETTE.borderSubtle,
} as const;
