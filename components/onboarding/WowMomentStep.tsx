/**
 * Onboarding Step 4: Wow Moment
 * Wavy Bezier line chart (same style as Trends) + stats — auto-advancing
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Circle as SvgCircle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SafeText } from '../SafeText';
import { PALETTE, SPACING, RADII } from '../../constants/theme';
import { getRecoveryStatus } from '../../db/schema';

interface WowMomentStepProps {
  onNext: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCORES = [72, 65, 81, 78, 85, 90, 82];

const STATS = [
  { icon: 'trending-up' as const, value: '79', label: 'Avg Score' },
  { icon: 'flame' as const, value: '7', label: 'Day Streak' },
  { icon: 'trophy' as const, value: '90', label: 'Best Day' },
];

const MESSAGES = [
  'Analyzing your recovery patterns...',
  'Identifying peak performance days...',
  'Building your wellness profile...',
];

// ── Chart constants ──
const CHART_WIDTH = 300;
const CHART_HEIGHT = 160;
const PADDING_LEFT = 12;
const PADDING_RIGHT = 12;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 24;
const GRAPH_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const GRAPH_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const getY = (score: number) =>
  PADDING_TOP + GRAPH_HEIGHT - (score / 100) * GRAPH_HEIGHT;

const getX = (index: number) =>
  PADDING_LEFT + (index / (DAYS.length - 1)) * GRAPH_WIDTH;

/**
 * Bezier curve control point calculation (same as Trends)
 */
const getControlPoints = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  tension: number = 0.35
) => {
  const d01 = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
  const d12 = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  const fa = (tension * d01) / (d01 + d12);
  const fb = tension - fa;
  return {
    cp1x: p1.x - fa * (p2.x - p0.x),
    cp1y: p1.y - fa * (p2.y - p0.y),
    cp2x: p1.x + fb * (p2.x - p0.x),
    cp2y: p1.y + fb * (p2.y - p0.y),
  };
};

export const WowMomentStep: React.FC<WowMomentStepProps> = ({ onNext }) => {
  const insets = useSafeAreaInsets();
  const [messageIndex, setMessageIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // ── Chart data points ──
  const points = useMemo(
    () => SCORES.map((score, i) => ({ x: getX(i), y: getY(score), score })),
    []
  );

  // ── Gradient stops with zone transitions ──
  const gradientStops = useMemo(() => {
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const dataWidth = lastX - firstX;

    const stops: Array<{ offset: number; color: string }> = [];
    const zoneThresholds = [
      { boundary: 80, color: getRecoveryStatus(79).color },
      { boundary: 60, color: getRecoveryStatus(59).color },
      { boundary: 40, color: getRecoveryStatus(39).color },
    ];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const offset = dataWidth > 0 ? (p.x - firstX) / dataWidth : 0;
      stops.push({ offset, color: getRecoveryStatus(p.score).color });

      if (i < points.length - 1) {
        const next = points[i + 1];
        const scoreA = p.score;
        const scoreB = next.score;
        const minS = Math.min(scoreA, scoreB);
        const maxS = Math.max(scoreA, scoreB);

        for (const { boundary, color } of zoneThresholds) {
          if (boundary > minS && boundary < maxS) {
            const t = Math.abs(scoreA - boundary) / Math.abs(scoreA - scoreB);
            const bx = p.x + t * (next.x - p.x);
            const bOffset = dataWidth > 0 ? (bx - firstX) / dataWidth : 0;
            stops.push({ offset: bOffset, color });
          }
        }
      }
    }

    stops.sort((a, b) => a.offset - b.offset);
    return stops;
  }, [points]);

  // ── Bezier path ──
  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const { cp2x, cp2y } = getControlPoints(p0, p1, p2);
      const { cp1x, cp1y } = getControlPoints(p1, p2, p3);
      path += ` C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [points]);

  const fillPath = useMemo(() => {
    if (!linePath) return '';
    const last = points[points.length - 1];
    const first = points[0];
    const bottom = PADDING_TOP + GRAPH_HEIGHT;
    return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [linePath, points]);

  // ── Message cycling + auto-advance ──
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      Haptics.selectionAsync();
      setMessageIndex(1);
    }, 1600));

    timers.push(setTimeout(() => {
      Haptics.selectionAsync();
      setMessageIndex(2);
    }, 3200));

    timers.push(setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResults(true);
    }, 4800));

    timers.push(setTimeout(() => {
      onNext();
    }, 7200));

    return () => timers.forEach(clearTimeout);
  }, [onNext]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
      {/* Step Label */}
      <Animated.View
        entering={FadeInUp.delay(100).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.stepLabel} numberOfLines={1}>
          STEP 3 OF 4
        </SafeText>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(20).stiffness(100)}
      >
        <SafeText style={styles.title} numberOfLines={2}>
          Track Your{'\n'}Progress
        </SafeText>
      </Animated.View>

      {/* Processing Message */}
      <Animated.View
        entering={FadeInUp.delay(400).springify().damping(20).stiffness(100)}
        style={styles.messageContainer}
      >
        <SafeText
          key={messageIndex}
          style={styles.message}
          numberOfLines={1}
        >
          {MESSAGES[messageIndex]}
        </SafeText>
      </Animated.View>

      {/* Wavy Line Chart */}
      <Animated.View
        entering={FadeInUp.delay(600).springify().damping(20).stiffness(100)}
        style={styles.chartCard}
      >
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient
              id="onboardingGradient"
              x1={points[0].x}
              y1={0}
              x2={points[points.length - 1].x}
              y2={0}
              gradientUnits="userSpaceOnUse"
            >
              {gradientStops.map((stop, i) => (
                <Stop
                  key={i}
                  offset={`${stop.offset * 100}%`}
                  stopColor={stop.color}
                />
              ))}
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 50, 100].map((value) => (
            <Line
              key={value}
              x1={PADDING_LEFT}
              y1={getY(value)}
              x2={CHART_WIDTH - PADDING_RIGHT}
              y2={getY(value)}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={0.5}
            />
          ))}

          {/* Atmospheric fill */}
          {fillPath && (
            <Path
              d={fillPath}
              fill="url(#onboardingGradient)"
              opacity={0.12}
            />
          )}

          {/* Bezier curve */}
          {linePath && (
            <Path
              d={linePath}
              stroke="url(#onboardingGradient)"
              strokeWidth={2.5}
              strokeOpacity={0.9}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data dots */}
          {points.map((p, i) => {
            const { color } = getRecoveryStatus(p.score);
            return (
              <SvgCircle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill={color}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={1}
              />
            );
          })}

          {/* Day labels */}
          {DAYS.map((day, i) => (
            <SvgText
              key={day}
              x={getX(i)}
              y={CHART_HEIGHT - 4}
              fill="rgba(255, 255, 255, 0.4)"
              fontSize={10}
              fontWeight="400"
              textAnchor="middle"
            >
              {day}
            </SvgText>
          ))}
        </Svg>
      </Animated.View>

      {/* Stats Row — appears after analysis */}
      {showResults && (
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeIn.delay(index * 120).springify().damping(20).stiffness(100)}
              style={styles.statCard}
            >
              <Ionicons
                name={stat.icon}
                size={20}
                color={PALETTE.champagneGoldBright}
              />
              <SafeText style={styles.statValue} numberOfLines={1}>
                {stat.value}
              </SafeText>
              <SafeText style={styles.statLabel} numberOfLines={1}>
                {stat.label}
              </SafeText>
            </Animated.View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: PALETTE.titaniumSilverMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '200',
    letterSpacing: 1,
    color: PALETTE.pureWhite,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  messageContainer: {
    minHeight: 20,
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: 14,
    fontWeight: '300',
    color: PALETTE.champagneGold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  chartCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.card,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 340,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADII.button,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: PALETTE.pureWhite,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: PALETTE.subtleWhite,
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
});
