/**
 * Recovery Pulse - Mercury Loading Skeletons
 * Titanium Silver pulsing placeholders
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { PALETTE, RADII, SPACING } from '../constants/theme';

const MERCURY_COLOR = PALETTE.titaniumSilver;
const MERCURY_SPRING = {
  damping: 28,
  stiffness: 80,
  mass: 1.2,
};

interface MercurySkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base Mercury Skeleton with pulsing animation
 */
const MercurySkeleton: React.FC<MercurySkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = RADII.chip,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withSpring(0.7, MERCURY_SPRING),
        withSpring(0.3, MERCURY_SPRING)
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          borderCurve: 'continuous',
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * Card Skeleton - Full card placeholder
 */
export const MercuryCardSkeleton: React.FC<{ delay?: number }> = ({
  delay = 0,
}) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(400).springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <MercurySkeleton width={80} height={12} />
        <MercurySkeleton width={40} height={12} />
      </View>
      <MercurySkeleton width="100%" height={48} style={styles.cardContent} />
      <View style={styles.cardFooter}>
        <MercurySkeleton width="60%" height={14} />
      </View>
    </Animated.View>
  );
};

/**
 * Text Skeleton - Text line placeholder
 */
export const MercuryTextSkeleton: React.FC<{
  width?: DimensionValue;
  height?: number;
  delay?: number;
}> = ({ width = '100%', height = 16, delay = 0 }) => {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(400).springify()}>
      <MercurySkeleton width={width} height={height} borderRadius={RADII.badge} />
    </Animated.View>
  );
};

/**
 * Ring Skeleton - Circular placeholder for recovery ring
 */
export const MercuryRingSkeleton: React.FC<{
  diameter?: number;
  delay?: number;
}> = ({ diameter = 220, delay = 0 }) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(400).springify()}
      style={styles.ringContainer}
    >
      <MercurySkeleton
        width={diameter}
        height={diameter}
        borderRadius={diameter / 2}
      />
    </Animated.View>
  );
};

/**
 * Metric Skeleton - Large metric number placeholder
 */
export const MercuryMetricSkeleton: React.FC<{ delay?: number }> = ({
  delay = 0,
}) => {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(400).springify()}>
      <MercurySkeleton width={80} height={48} borderRadius={RADII.button} />
    </Animated.View>
  );
};

/**
 * List Item Skeleton - For history items
 */
export const MercuryListItemSkeleton: React.FC<{ delay?: number }> = ({
  delay = 0,
}) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(400).springify()}
      style={styles.listItem}
    >
      <View style={styles.listItemHeader}>
        <MercurySkeleton width={120} height={16} />
        <MercurySkeleton width={40} height={20} />
      </View>
      <MercurySkeleton width="80%" height={12} style={styles.listItemDetail} />
    </Animated.View>
  );
};

/**
 * Full Screen Loading - Complete skeleton layout
 */
export const MercuryFullScreenLoading: React.FC = () => {
  return (
    <View style={styles.fullScreen}>
      <MercuryTextSkeleton width={100} height={12} delay={0} />
      <MercuryTextSkeleton width={200} height={24} delay={50} />
      <MercuryRingSkeleton delay={100} />
      <MercuryCardSkeleton delay={150} />
      <MercuryCardSkeleton delay={200} />
    </View>
  );
};

/**
 * Fade in wrapper for content after loading
 */
export const MercuryFadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(400).springify()}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: MERCURY_COLOR,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    padding: SPACING.lg,
    borderWidth: 0.5,
    borderColor: PALETTE.borderLight,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    marginVertical: SPACING.sm,
  },
  cardFooter: {},
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    padding: SPACING.md,
    borderWidth: 0.5,
    borderColor: PALETTE.borderLight,
    gap: SPACING.sm,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemDetail: {
    marginTop: SPACING.xs,
  },
  fullScreen: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.lg,
  },
});

export default MercurySkeleton;
