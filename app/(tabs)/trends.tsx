/**
 * Recovery Pulse - Trends Screen
 * THE BILLIONAIRE PROTOCOL: Investment Terminal Aesthetic
 * Precision Line Chart with Bezier Curves
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Path,
  Line,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
            <CaptionText>Last 7 Days</CaptionText>
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
              <CaptionText style={styles.chartTitle}>Score History</CaptionText>
              <View style={styles.chartContainer}>
                <RecoveryChart data={sortedCheckIns} />
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

/**
 * DAY LABELS - Investment Terminal Style
 */
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

interface ChartProps {
  data: Array<{
    date: string;
    recoveryScore: number;
  }>;
}

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
 * Recovery Chart - Precision Line Chart
 * Bezier curves, gradient stroke, atmospheric fill
 */
const RecoveryChart: React.FC<ChartProps> = ({ data }) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 48, 360);
  const chartHeight = 180;
  // Generous padding to prevent glow clipping
  const paddingLeft = 28;
  const paddingRight = 28;
  const paddingTop = 28; // Room for tooltip above node
  const paddingBottom = 20; // Reduced - labels closer to chart
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const maxScore = 100;

  // Map data to last 7 days (fill gaps with null)
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const result: Array<{ dayIndex: number; score: number | null; date: string }> = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = subDays(today, i);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const dayOfWeek = targetDate.getDay();
      // Convert Sunday (0) to 6, Monday (1) to 0, etc.
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const checkIn = data.find((d) => d.date === dateStr);
      result.push({
        dayIndex,
        score: checkIn ? checkIn.recoveryScore : null,
        date: dateStr,
      });
    }

    return result;
  }, [data]);

  // Points with actual data
  const dataPoints = chartData
    .map((d, i) => ({ ...d, index: i }))
    .filter((d) => d.score !== null) as Array<{
    index: number;
    score: number;
    date: string;
  }>;

  // Calculate pixel positions
  const getX = (index: number) =>
    paddingLeft + (index / 6) * graphWidth;
  const getY = (score: number) =>
    paddingTop + graphHeight - (score / maxScore) * graphHeight;

  // Generate smooth Bezier path
  const generatePath = () => {
    if (dataPoints.length === 0) return '';
    if (dataPoints.length === 1) return ''; // Single point handled separately

    const points = dataPoints.map((d) => ({
      x: getX(d.index),
      y: getY(d.score),
    }));

    let path = `M ${points[0].x} ${points[0].y}`;

    if (points.length === 2) {
      // Simple line for 2 points
      path += ` L ${points[1].x} ${points[1].y}`;
    } else {
      // Bezier curves for 3+ points
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

  // Generate fill path (close to bottom)
  const generateFillPath = () => {
    const linePath = generatePath();
    if (!linePath) return '';

    const lastPoint = dataPoints[dataPoints.length - 1];
    const firstPoint = dataPoints[0];

    return `${linePath} L ${getX(lastPoint.index)} ${paddingTop + graphHeight} L ${getX(firstPoint.index)} ${paddingTop + graphHeight} Z`;
  };

  const linePath = generatePath();
  const fillPath = generateFillPath();

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Defs>
        {/* Line Gradient: Emerald → Champagne Gold */}
        <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(80, 200, 120, 0.9)" />
          <Stop offset="50%" stopColor="rgba(212, 175, 55, 0.85)" />
          <Stop offset="100%" stopColor="rgba(80, 200, 120, 0.9)" />
        </LinearGradient>

        {/* Atmospheric Fill Gradient */}
        <LinearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(80, 200, 120, 0.12)" />
          <Stop offset="100%" stopColor="rgba(80, 200, 120, 0)" />
        </LinearGradient>

      </Defs>

      {/* Surgical precision grid lines - barely visible */}
      {[0, 25, 50, 75, 100].map((value) => {
        const y = getY(value);
        return (
          <Line
            key={value}
            x1={paddingLeft}
            y1={y}
            x2={chartWidth - paddingRight}
            y2={y}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Atmospheric fill under line */}
      {fillPath && (
        <Path d={fillPath} fill="url(#fillGradient)" />
      )}

      {/* Bezier curve line */}
      {linePath && (
        <Path
          d={linePath}
          stroke="url(#lineGradient)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Data point nodes - LUMINOUS NODE PROTOCOL */}
      {dataPoints.map((point) => {
        const x = getX(point.index);
        const y = getY(point.score);
        const { color } = getRecoveryStatus(point.score);
        const showAnchor = dataPoints.length <= 3; // Show for sparse data

        // Extract RGB from color for glow layers
        const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const r = colorMatch ? colorMatch[1] : '80';
        const g = colorMatch ? colorMatch[2] : '200';
        const b = colorMatch ? colorMatch[3] : '120';

        return (
          <G key={point.date}>
            {/* PRECISION ANCHORING - Blueprint-style vertical drop line */}
            {showAnchor && (
              <Line
                x1={x}
                y1={y + 26}
                x2={x}
                y2={chartHeight - 6}
                stroke="rgba(74, 222, 128, 0.2)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            )}

            {/* LAYER 3: Atmospheric mist (24px, 0.05 opacity) */}
            <Circle
              cx={x}
              cy={y}
              r={24}
              fill={`rgba(${r}, ${g}, ${b}, 0.05)`}
            />

            {/* LAYER 2: Soft halo (12px, 0.15 opacity) */}
            <Circle
              cx={x}
              cy={y}
              r={12}
              fill={`rgba(${r}, ${g}, ${b}, 0.15)`}
            />

            {/* LAYER 1: Solid core (4px) */}
            <Circle cx={x} cy={y} r={4} fill={color} />

            {/* Center highlight */}
            <Circle cx={x} cy={y} r={1.5} fill="rgba(255, 255, 255, 0.8)" />

            {/* TYPOGRAPHIC CONTEXT - Floating score tooltip */}
            <SvgText
              x={x}
              y={y - 16}
              fontSize={10}
              fontWeight="200"
              fill={color}
              textAnchor="middle"
            >
              {point.score}
            </SvgText>
          </G>
        );
      })}

      {/* X-axis labels - All 7 days */}
      {DAY_LABELS.map((label, index) => {
        const x = getX(index);
        const hasData = chartData[index]?.score !== null;

        return (
          <SvgText
            key={`day-${index}`}
            x={x}
            y={chartHeight - 8}
            fontSize={11}
            fontWeight="200"
            fill={hasData ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.25)'}
            textAnchor="middle"
          >
            {label}
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
  chartTitle: {
    marginBottom: SPACING.sm,
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
