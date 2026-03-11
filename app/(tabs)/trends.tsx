/**
 * Recovery Pulse - Trends Screen
 * THE BILLIONAIRE PROTOCOL: Investment Terminal Aesthetic
 * Precision Line Chart with Bezier Curves
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedCard, AnimatedElement } from '../../components/AnimatedCard';
import { SapphireButton } from '../../components/SapphireButton';
import { SafeText, HeadlineText, CaptionText } from '../../components/SafeText';
import { PremiumGate } from '../../components/PremiumGate';
import { SovereignPaywall } from '../../components/SovereignPaywall';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useAccess } from '../../hooks/useAccess';
import { PALETTE, SPACING, RADII } from '../../constants/theme';
import { getRecoveryStatus } from '../../db/schema';

const GHOST_BARS = [35, 45, 55, 50, 65, 75, 70]; // Ascending pattern suggesting improvement
const GHOST_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GHOST_METRICS = [
  { icon: 'trending-up' as const, label: 'Weekly Avg', value: '—' },
  { icon: 'flame' as const, label: 'Streak', value: '—' },
  { icon: 'trophy' as const, label: 'Best Day', value: '—' },
];

export default function TrendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { recentCheckIns, averageScore } = useCheckIn();
  const { isLocked } = useAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  // Sort by date ascending for chart
  const sortedCheckIns = [...recentCheckIns].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <View style={styles.container}>
      <GradientBackground />

      {/* Paywall Modal */}
      <SovereignPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {/* Premium Gate wraps content */}
      <PremiumGate isLocked={isLocked} onUpgrade={() => setShowPaywall(true)}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedElement index={0} delay={0}>
          <View style={styles.header}>
            <CaptionText>{chartRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}</CaptionText>
            <HeadlineText>Recovery Trends</HeadlineText>
          </View>
        </AnimatedElement>

        {/* Average Card */}
        {averageScore !== null && (
          <AnimatedCard index={1} delay={80}>
            <View style={styles.averageCard}>
              <View>
                <CaptionText>Weekly Average</CaptionText>
                <SafeText
                  variant="metric"
                  color={getRecoveryStatus(averageScore).color}
                >
                  {averageScore}
                </SafeText>
              </View>
              <View style={styles.averageStatus}>
                <SafeText variant="headline">
                  {getRecoveryStatus(averageScore).label}
                </SafeText>
                <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
                  Based on {recentCheckIns.length} check-ins
                </SafeText>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Chart or Empty Preview */}
        {sortedCheckIns.length > 0 ? (
          <>
            <AnimatedCard index={2} delay={160}>
              <View style={styles.chartHeader}>
                <CaptionText style={styles.chartTitle}>Score History</CaptionText>
                <View style={styles.rangeToggle}>
                  <Pressable
                    style={[
                      styles.rangeOption,
                      chartRange === '7d' && styles.rangeOptionActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setChartRange('7d');
                    }}
                    hitSlop={4}
                  >
                    <SafeText
                      variant="bodySmall"
                      numberOfLines={1}
                      style={[
                        styles.rangeText,
                        chartRange === '7d' && styles.rangeTextActive,
                      ]}
                    >
                      7 Days
                    </SafeText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.rangeOption,
                      chartRange === '30d' && styles.rangeOptionActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setChartRange('30d');
                    }}
                    hitSlop={4}
                  >
                    <SafeText
                      variant="bodySmall"
                      numberOfLines={1}
                      style={[
                        styles.rangeText,
                        chartRange === '30d' && styles.rangeTextActive,
                      ]}
                    >
                      30 Days
                    </SafeText>
                  </Pressable>
                </View>
              </View>
              <View style={styles.chartContainer}>
                <RecoveryChart data={sortedCheckIns} range={chartRange} />
              </View>
            </AnimatedCard>

            {/* History List */}
            <AnimatedElement index={3} delay={240}>
              <View style={styles.historySection}>
                <HeadlineText style={styles.sectionTitle}>History</HeadlineText>
                {[...sortedCheckIns].reverse().map((checkIn, idx) => (
                  <AnimatedCard key={checkIn.id} index={idx} delay={320 + idx * 60} padding="md">
                    <HistoryItem checkIn={checkIn} />
                  </AnimatedCard>
                ))}
              </View>
            </AnimatedElement>
          </>
        ) : (
          <>
            {/* Ghost Chart Preview */}
            <AnimatedCard index={2} delay={160}>
              <CaptionText style={styles.chartTitle}>Score History</CaptionText>
              <View style={styles.ghostChartContainer}>
                {GHOST_BARS.map((height, index) => (
                  <Animated.View
                    key={GHOST_DAYS[index]}
                    entering={FadeInUp.delay(300 + index * 60).springify().damping(20).stiffness(100)}
                    style={styles.ghostBarColumn}
                  >
                    <View style={styles.ghostBarTrack}>
                      <View
                        style={[
                          styles.ghostBar,
                          { height: `${height}%` },
                        ]}
                      />
                    </View>
                    <SafeText
                      variant="bodySmall"
                      style={styles.ghostDayLabel}
                      numberOfLines={1}
                    >
                      {GHOST_DAYS[index]}
                    </SafeText>
                  </Animated.View>
                ))}
              </View>
            </AnimatedCard>

            {/* Ghost Metric Cards */}
            <View style={styles.ghostMetricsRow}>
              {GHOST_METRICS.map((metric, index) => (
                <Animated.View
                  key={metric.label}
                  entering={FadeInUp.delay(700 + index * 80).springify().damping(20).stiffness(100)}
                  style={styles.ghostMetricCard}
                >
                  <Ionicons
                    name={metric.icon}
                    size={20}
                    color={PALETTE.champagneGold}
                    style={{ opacity: 0.4 }}
                  />
                  <SafeText variant="headline" style={styles.ghostMetricValue}>
                    {metric.value}
                  </SafeText>
                  <SafeText variant="bodySmall" style={styles.ghostMetricLabel}>
                    {metric.label}
                  </SafeText>
                </Animated.View>
              ))}
            </View>

            {/* CTA */}
            <Animated.View
              entering={FadeInUp.delay(960).springify().damping(20).stiffness(100)}
              style={styles.emptyCta}
            >
              <SafeText variant="body" style={styles.emptyText}>
                Complete your first check-in to start tracking recovery trends
              </SafeText>
              <SapphireButton
                title="Start Check-In"
                onPress={() => router.push('/checkin')}
                variant="primary"
              />
            </Animated.View>
          </>
        )}
      </ScrollView>
      </PremiumGate>
    </View>
  );
}

interface ChartProps {
  data: Array<{
    date: string;
    recoveryScore: number;
  }>;
  range: '7d' | '30d';
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const; // getDay(): 0=Sun

/**
 * Bezier curve control point calculation for smooth lines
 */
const getControlPoints = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  tension: number = 0.3
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

/**
 * Recovery Chart - Dual Mode Precision Line Chart
 * 7d: Day-of-week slots (M-S) | 30d: Date-proportional positioning
 */
const RecoveryChart: React.FC<ChartProps> = ({ data, range }) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 48, 360);
  const chartHeight = 180;
  const paddingLeft = 28;
  const paddingRight = 28;
  const paddingTop = 28;
  const paddingBottom = 22;
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const maxScore = 100;

  const getY = (score: number) =>
    paddingTop + graphHeight - (score / maxScore) * graphHeight;

  // ── 7-DAY MODE: Fixed day-of-week slots ──
  const weekData = useMemo(() => {
    if (range !== '7d') return null;

    const today = startOfDay(new Date());
    const todayDow = today.getDay(); // 0=Sun, 1=Mon...
    // Find this week's Monday
    const monday = subDays(today, todayDow === 0 ? 6 : todayDow - 1);

    const slots: Array<{ score: number | null; date: string; isToday: boolean; isFuture: boolean }> = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday.getTime() + i * 86400000);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const checkIn = data.find((d) => d.date === dateStr);
      slots.push({
        score: checkIn ? checkIn.recoveryScore : null,
        date: dateStr,
        isToday: dateStr === format(today, 'yyyy-MM-dd'),
        isFuture: targetDate > today,
      });
    }

    const getX = (index: number) => paddingLeft + (index / 6) * graphWidth;
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const pts = slots
      .map((d, i) => ({ ...d, index: i }))
      .filter((d): d is typeof d & { score: number } => d.score !== null)
      .map((d) => ({
        date: d.date,
        score: d.score,
        x: getX(d.index),
        y: getY(d.score),
      }));

    const labels = dayLabels.map((label, index) => ({
      x: getX(index),
      text: label,
      bright: slots[index]?.isToday
        ? true
        : slots[index]?.score !== null,
      isToday: slots[index]?.isToday ?? false,
      isFuture: slots[index]?.isFuture ?? false,
    }));

    return { points: pts, xLabels: labels };
  }, [data, range, graphWidth, graphHeight]);

  // ── 30-DAY MODE: Date-proportional positioning ──
  const monthData = useMemo(() => {
    if (range !== '30d') return null;

    const today = startOfDay(new Date());
    const cutoff = subDays(today, 30);

    const filtered = data
      .filter((d) => parseISO(d.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (filtered.length === 0) {
      return { points: [] as Array<{ date: string; score: number; x: number; y: number }>, xLabels: [] as Array<{ x: number; text: string; bright: boolean }> };
    }

    if (filtered.length === 1) {
      const d = filtered[0];
      const cx = paddingLeft + graphWidth / 2;
      return {
        points: [{ date: d.date, score: d.recoveryScore, x: cx, y: getY(d.recoveryScore) }],
        xLabels: [{ x: cx, text: format(parseISO(d.date), 'MMM d'), bright: true }],
      };
    }

    const earliest = startOfDay(parseISO(filtered[0].date));
    const latest = startOfDay(parseISO(filtered[filtered.length - 1].date));
    const rangeDays = Math.max((latest.getTime() - earliest.getTime()) / 86400000, 1);

    const dateToX = (dateStr: string) => {
      const d = startOfDay(parseISO(dateStr));
      const offset = (d.getTime() - earliest.getTime()) / 86400000;
      return paddingLeft + (offset / rangeDays) * graphWidth;
    };

    const pts = filtered.map((d) => ({
      date: d.date,
      score: d.recoveryScore,
      x: dateToX(d.date),
      y: getY(d.recoveryScore),
    }));

    let labels: Array<{ x: number; text: string; bright: boolean }>;

    if (filtered.length <= 7) {
      labels = filtered.map((d) => ({
        x: dateToX(d.date),
        text: format(parseISO(d.date), 'MMM d'),
        bright: true,
      }));
    } else {
      const count = 5;
      labels = Array.from({ length: count }, (_, i) => {
        const offsetDays = (rangeDays * i) / (count - 1);
        const date = new Date(earliest.getTime() + offsetDays * 86400000);
        return {
          x: paddingLeft + (i / (count - 1)) * graphWidth,
          text: format(date, 'MMM d'),
          bright: false,
        };
      });
    }

    return { points: pts, xLabels: labels };
  }, [data, range, graphWidth, graphHeight]);

  // ── Select active dataset ──
  const { points, xLabels } = range === '7d'
    ? (weekData ?? { points: [], xLabels: [] })
    : (monthData ?? { points: [], xLabels: [] });

  // ── Dynamic color gradient with intermediate zone transitions ──
  const gradientStops = useMemo(() => {
    if (points.length === 0) {
      const c = 'rgba(80, 200, 120, 0.9)';
      return [{ offset: 0, color: c }, { offset: 1, color: c }];
    }
    if (points.length === 1) {
      const c = getRecoveryStatus(points[0].score).color;
      return [{ offset: 0, color: c }, { offset: 1, color: c }];
    }

    const stops: Array<{ offset: number; color: string }> = [];
    const yellowColor = getRecoveryStatus(65).color;
    // Zone boundaries: add yellow stops at green/yellow (80) and yellow/red (50)
    const zoneThresholds = [
      { boundary: 80, color: yellowColor },
      { boundary: 50, color: yellowColor },
    ];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const offset = graphWidth > 0
        ? Math.max(0, Math.min(1, (p.x - paddingLeft) / graphWidth))
        : 0;
      stops.push({ offset, color: getRecoveryStatus(p.score).color });

      // Add intermediate stops at zone boundaries between consecutive points
      if (i < points.length - 1) {
        const next = points[i + 1];
        const scoreA = p.score;
        const scoreB = next.score;
        const xA = p.x;
        const xB = next.x;
        const minScore = Math.min(scoreA, scoreB);
        const maxScore = Math.max(scoreA, scoreB);

        for (const { boundary, color } of zoneThresholds) {
          if (boundary > minScore && boundary < maxScore) {
            const t = Math.abs(scoreA - boundary) / Math.abs(scoreA - scoreB);
            const bx = xA + t * (xB - xA);
            const bOffset = graphWidth > 0
              ? Math.max(0, Math.min(1, (bx - paddingLeft) / graphWidth))
              : 0;
            stops.push({ offset: bOffset, color });
          }
        }
      }
    }

    stops.sort((a, b) => a.offset - b.offset);
    return stops;
  }, [points, graphWidth]);

  // ── Bezier path generation ──
  const generatePath = () => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    if (points.length === 2) {
      path += ` L ${points[1].x} ${points[1].y}`;
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const { cp2x, cp2y } = getControlPoints(p0, p1, p2, 0.35);
        const { cp1x, cp1y } = getControlPoints(p1, p2, p3, 0.35);

        path += ` C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${p2.x} ${p2.y}`;
      }
    }

    return path;
  };

  const generateFillPath = () => {
    const linePath = generatePath();
    if (!linePath) return '';

    const last = points[points.length - 1];
    const first = points[0];
    const bottom = paddingTop + graphHeight;

    return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  };

  const linePath = generatePath();
  const fillPath = generateFillPath();
  const showAnchors = points.length <= 5;
  const showTooltips = points.length <= 12;
  const compact = points.length > 15;

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Defs>
        {/* Dynamic gradient — transitions between score colors */}
        <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((stop, i) => (
            <Stop
              key={i}
              offset={`${stop.offset * 100}%`}
              stopColor={stop.color}
            />
          ))}
        </LinearGradient>
      </Defs>

      {/* Precision grid lines */}
      {[0, 25, 50, 75, 100].map((value) => (
        <Line
          key={value}
          x1={paddingLeft}
          y1={getY(value)}
          x2={chartWidth - paddingRight}
          y2={getY(value)}
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth={0.5}
        />
      ))}

      {/* Atmospheric fill — score colors at low opacity */}
      {fillPath && <Path d={fillPath} fill="url(#scoreGradient)" opacity={0.15} />}

      {/* Bezier curve line — dynamic score colors */}
      {linePath && (
        <Path
          d={linePath}
          stroke="url(#scoreGradient)"
          strokeWidth={2}
          strokeOpacity={0.9}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Data point nodes */}
      {points.map((point) => {
        const { color } = getRecoveryStatus(point.score);
        const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const r = colorMatch ? colorMatch[1] : '80';
        const g = colorMatch ? colorMatch[2] : '200';
        const b = colorMatch ? colorMatch[3] : '120';

        return (
          <G key={point.date}>
            {showAnchors && (
              <Line
                x1={point.x}
                y1={point.y + 20}
                x2={point.x}
                y2={paddingTop + graphHeight}
                stroke={`rgba(${r}, ${g}, ${b}, 0.15)`}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            )}

            {/* Soft halo */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={compact ? 7 : 10}
              fill={`rgba(${r}, ${g}, ${b}, 0.12)`}
            />

            {/* Solid core */}
            <Circle cx={point.x} cy={point.y} r={compact ? 3 : 4} fill={color} />

            {/* Center highlight */}
            <Circle cx={point.x} cy={point.y} r={1.5} fill="rgba(255, 255, 255, 0.8)" />

            {/* Score tooltip */}
            {showTooltips && (
              <SvgText
                x={point.x}
                y={point.y - 16}
                fontSize={10}
                fontWeight="200"
                fill={color}
                textAnchor="middle"
              >
                {point.score}
              </SvgText>
            )}
          </G>
        );
      })}

      {/* X-axis labels */}
      {xLabels.map((label, index) => {
        const isToday = 'isToday' in label && label.isToday;
        const isFuture = 'isFuture' in label && label.isFuture;

        return (
          <SvgText
            key={`label-${index}`}
            x={label.x}
            y={chartHeight - 6}
            fontSize={range === '7d' ? 11 : 10}
            fontWeight={isToday ? '500' : '200'}
            fill={
              isToday
                ? PALETTE.champagneGold
                : label.bright
                  ? 'rgba(255, 255, 255, 0.6)'
                  : isFuture
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.25)'
            }
            textAnchor="middle"
          >
            {label.text}
          </SvgText>
        );
      })}
    </Svg>
  );
};

interface HistoryItemProps {
  checkIn: {
    id: number;
    date: string;
    recoveryScore: number;
    sleepHours: number;
    sleepQuality: number;
    fatigue: number;
    soreness: number;
  };
}

const HistoryItem: React.FC<HistoryItemProps> = ({ checkIn }) => {
  const { color } = getRecoveryStatus(checkIn.recoveryScore);
  const formattedDate = format(parseISO(checkIn.date), 'EEEE, MMM d');

  return (
    <>
      <View style={styles.historyHeader}>
        <SafeText variant="title">{formattedDate}</SafeText>
        <SafeText variant="headline" color={color}>
          {checkIn.recoveryScore}
        </SafeText>
      </View>
      <View style={styles.historyDetails}>
        <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
          Sleep: {checkIn.sleepHours}h ({checkIn.sleepQuality}/10)
        </SafeText>
        <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted}>
          Fatigue: {checkIn.fatigue}/10 • Soreness: {checkIn.soreness}/10
        </SafeText>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  header: {
    gap: SPACING.xs,
  },
  averageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averageStatus: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  chartTitle: {
    marginBottom: 0,
  },
  rangeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADII.chip,
    borderCurve: 'continuous',
    padding: 2,
    gap: 2,
  },
  rangeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.chip - 2,
    borderCurve: 'continuous',
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 0.5,
  },
  rangeTextActive: {
    color: PALETTE.champagneGold,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    // Allow glow to breathe - no overflow clipping
    overflow: 'visible',
  },
  ghostChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: SPACING.sm,
  },
  ghostBarColumn: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ghostBarTrack: {
    width: 20,
    height: 110,
    justifyContent: 'flex-end',
    borderRadius: 10,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  ghostBar: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderCurve: 'continuous',
  },
  ghostDayLabel: {
    fontSize: 11,
    color: PALETTE.mutedWhite,
    letterSpacing: 0.5,
  },
  ghostMetricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ghostMetricCard: {
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
  ghostMetricValue: {
    fontSize: 24,
    fontWeight: '300',
    color: PALETTE.mutedWhite,
  },
  ghostMetricLabel: {
    fontSize: 11,
    color: PALETTE.mutedWhite,
    letterSpacing: 0.5,
  },
  emptyCta: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    color: PALETTE.subtleWhite,
  },
  historySection: {
    gap: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  historyDetails: {
    gap: SPACING.xs,
  },
});
