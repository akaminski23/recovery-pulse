/**
 * Recovery Pulse - Settings Screen
 * THE BILLIONAIRE PROTOCOL: Unified list rows with tinted icons
 * Hidden "Laboratory" unlocked by tapping Version 5 times
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Share,
  Linking,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedCard, AnimatedElement } from '../../components/AnimatedCard';
import { SapphireButton } from '../../components/SapphireButton';
import { SafeText, HeadlineText, CaptionText } from '../../components/SafeText';
import { SovereignPaywall } from '../../components/SovereignPaywall';
import { useHaptic } from '../../hooks/useHaptic';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useGracePeriod } from '../../hooks/useGracePeriod';
import { useAccess } from '../../hooks/useAccess';
import { resetDatabase } from '../../db/client';
import { useCheckIn } from '../../hooks/useCheckIn';
import { getRecentCheckIns } from '../../db/queries';
import { PALETTE, SPACING, RADII } from '../../constants/theme';

const LAB_TAP_THRESHOLD = 5;
const REMINDER_ENABLED_KEY = 'reminder_enabled';
const REMINDER_HOUR_KEY = 'reminder_hour';
const REMINDER_MINUTE_KEY = 'reminder_minute';

const LEGAL_URLS = {
  privacy: 'https://github.com/akaminski23/recovery-pulse/blob/main/docs/PRIVACY_POLICY.md',
  terms: 'https://github.com/akaminski23/recovery-pulse/blob/main/docs/TERMS_OF_USE.md',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trigger } = useHaptic();
  const { refresh, recentCheckIns } = useCheckIn();
  const { resetOnboarding } = useOnboarding();
  const { resetGracePeriod } = useGracePeriod();
  const { isPro, isTrialing, isInComplimentaryAccess, graceDaysLeft } = useAccess();

  // Laboratory
  const [labTapCount, setLabTapCount] = useState(0);
  const [labUnlocked, setLabUnlocked] = useState(__DEV__);
  const [showPaywall, setShowPaywall] = useState(false);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load reminder preferences
  useEffect(() => {
    const loadPrefs = async () => {
      const enabled = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
      const hour = await AsyncStorage.getItem(REMINDER_HOUR_KEY);
      const minute = await AsyncStorage.getItem(REMINDER_MINUTE_KEY);
      if (enabled === 'true') setReminderEnabled(true);
      if (hour) setReminderHour(parseInt(hour, 10));
      if (minute) setReminderMinute(parseInt(minute, 10));
    };
    loadPrefs();
  }, []);

  // ── Handlers ──

  const handleVersionTap = useCallback(() => {
    if (__DEV__) return;
    const newCount = labTapCount + 1;
    setLabTapCount(newCount);
    if (newCount >= LAB_TAP_THRESHOLD && !labUnlocked) {
      trigger('success');
      setLabUnlocked(true);
    } else if (newCount >= LAB_TAP_THRESHOLD - 2) {
      trigger('light');
    }
  }, [labTapCount, labUnlocked, trigger]);

  const scheduleReminder = useCallback(async (hour: number, minute: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recovery Check-In',
        body: 'How are you feeling today? Log your recovery.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }, []);

  const handleReminderToggle = useCallback(async (value: boolean) => {
    Haptics.selectionAsync();
    setReminderEnabled(value);
    await AsyncStorage.setItem(REMINDER_ENABLED_KEY, value ? 'true' : 'false');

    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in Settings to receive daily reminders.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => { setReminderEnabled(false); AsyncStorage.setItem(REMINDER_ENABLED_KEY, 'false'); } },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      await scheduleReminder(reminderHour, reminderMinute);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [reminderHour, reminderMinute, scheduleReminder]);

  const handleTimeChange = useCallback(async (_event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) {
      const hour = date.getHours();
      const minute = date.getMinutes();
      setReminderHour(hour);
      setReminderMinute(minute);
      await AsyncStorage.setItem(REMINDER_HOUR_KEY, String(hour));
      await AsyncStorage.setItem(REMINDER_MINUTE_KEY, String(minute));
      if (reminderEnabled) {
        await scheduleReminder(hour, minute);
      }
    }
  }, [reminderEnabled, scheduleReminder]);

  const handleManageSubscription = () => {
    Haptics.selectionAsync();
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const handleExportHistory = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const allCheckIns = getRecentCheckIns(365);

    if (allCheckIns.length === 0) {
      Alert.alert('No Data', 'Complete at least one check-in before exporting.');
      return;
    }

    const header = 'Date,Sleep Hours,Sleep Quality,Fatigue,Soreness,Recovery Score,Notes\n';
    const rows = allCheckIns
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((c) =>
        `${c.date},${c.sleepHours},${c.sleepQuality},${c.fatigue},${c.soreness},${c.recoveryScore},"${(c.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');

    const csv = header + rows;
    const file = new File(Paths.cache, 'recovery-pulse-history.csv');
    file.write(csv);
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your check-in history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDatabase();
            refresh();
            trigger('warning');
            Alert.alert('Data Reset', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
  };

  const handleShareApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: 'Track your daily recovery with Recovery Pulse — optimize your training with data-driven insights.',
      url: 'https://apps.apple.com/app/recovery-pulse/id6758175991',
    });
  };

  const handleFeedback = () => {
    Haptics.selectionAsync();
    Linking.openURL('mailto:support@recoverypulse.app?subject=Recovery%20Pulse%20Feedback');
  };

  const handleShowPaywall = () => {
    trigger('medium');
    setShowPaywall(true);
  };

  const handleExpireGracePeriod = async () => {
    Alert.alert(
      'Expire Grace Period',
      'This will reset your first launch date to 8 days ago, simulating an expired grace period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Expire',
          style: 'destructive',
          onPress: async () => {
            await resetGracePeriod();
            trigger('warning');
            Alert.alert('Grace Period', 'Grace period has been reset. Restart the app to see the effect.');
          },
        },
      ]
    );
  };

  const handleReplayOnboarding = async () => {
    trigger('medium');
    await resetOnboarding();
    router.replace('/onboarding');
  };

  const reminderTimeStr = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

  let staggerIndex = 0;

  return (
    <View style={styles.container}>
      <GradientBackground />

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
        <AnimatedElement index={staggerIndex++} delay={0}>
          <View style={styles.header}>
            <CaptionText>Configuration</CaptionText>
            <HeadlineText>Settings</HeadlineText>
          </View>
        </AnimatedElement>

        {/* ── SUBSCRIPTION ── */}
        <AnimatedElement index={staggerIndex++} delay={80}>
          <CaptionText style={styles.sectionTitle}>Subscription</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={160}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionIcon}>
              <Ionicons name="diamond" size={28} color={PALETTE.champagneGold} />
            </View>
            <View style={styles.subscriptionInfo}>
              <SafeText variant="headline" numberOfLines={1}>Recovery Pulse Pro</SafeText>
              <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted} numberOfLines={1}>
                {isPro
                  ? 'Active Subscription'
                  : isTrialing
                  ? 'Free Trial Active'
                  : isInComplimentaryAccess
                  ? `Complimentary Access: ${graceDaysLeft} days left`
                  : 'Unlock full access'}
              </SafeText>
            </View>
          </View>
          {!isPro && (
            <SapphireButton
              title="View Plans & Subscribe"
              onPress={handleShowPaywall}
              variant="primary"
              fullWidth
            />
          )}
          {isPro && (
            <SettingsRow
              icon="card"
              iconColor={PALETTE.champagneGold}
              label="Manage Subscription"
              onPress={handleManageSubscription}
            />
          )}
        </AnimatedCard>

        {/* ── PREFERENCES ── */}
        <AnimatedElement index={staggerIndex++} delay={240}>
          <CaptionText style={styles.sectionTitle}>Preferences</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={320}>
          <SettingsRow
            icon="notifications"
            iconColor="rgba(0, 245, 255, 0.9)"
            label="Daily Reminder"
            rightElement={
              <Switch
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: 'rgba(255,255,255,0.08)', true: 'rgba(0, 245, 255, 0.4)' }}
                thumbColor={reminderEnabled ? 'rgba(0, 245, 255, 0.9)' : 'rgba(255,255,255,0.6)'}
              />
            }
          />
          {reminderEnabled && (
            <>
              <View style={styles.rowDivider} />
              <SettingsRow
                icon="time"
                iconColor="rgba(0, 245, 255, 0.9)"
                label="Reminder Time"
                value={reminderTimeStr}
                onPress={() => setShowTimePicker(!showTimePicker)}
              />
              {showTimePicker && (
                <DateTimePicker
                  value={new Date(2026, 0, 1, reminderHour, reminderMinute)}
                  mode="time"
                  is24Hour
                  display="spinner"
                  onChange={handleTimeChange}
                  themeVariant="dark"
                  style={styles.timePicker}
                />
              )}
            </>
          )}
        </AnimatedCard>

        {/* ── RECOVERY MODEL ── */}
        <AnimatedElement index={staggerIndex++} delay={400}>
          <CaptionText style={styles.sectionTitle}>Recovery Model</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={480}>
          <View style={styles.rangesSection}>
            <ScoreRange range="80-100" label="Optimal" color="rgba(80, 200, 120, 0.9)" description="Ready for intense training" />
            <ScoreRange range="60-79" label="Good" color="rgba(212, 175, 55, 0.85)" description="Moderate training recommended" />
            <ScoreRange range="40-59" label="Moderate" color="rgba(255, 179, 71, 0.9)" description="Light activity only" />
            <ScoreRange range="0-39" label="Low" color="rgba(224, 17, 95, 0.9)" description="Focus on recovery" />
          </View>
          <View style={styles.modelDivider} />
          <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted} style={styles.formulaLabel} numberOfLines={1}>
            Score is calculated from:
          </SafeText>
          <View style={styles.formulaChips}>
            <FormulaChip label="Sleep" weight="40%" />
            <FormulaChip label="Fatigue" weight="30%" />
            <FormulaChip label="Soreness" weight="30%" />
          </View>
        </AnimatedCard>

        {/* ── DATA ── */}
        <AnimatedElement index={staggerIndex++} delay={560}>
          <CaptionText style={styles.sectionTitle}>Data</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={640}>
          <SettingsRow
            icon="download"
            iconColor="rgba(80, 200, 120, 0.9)"
            label="Export History"
            subtitle={`${recentCheckIns.length} check-ins`}
            onPress={handleExportHistory}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="trash"
            iconColor={PALETTE.danger}
            label="Reset All Data"
            labelColor={PALETTE.danger}
            onPress={handleResetData}
          />
        </AnimatedCard>

        {/* ── SUPPORT ── */}
        <AnimatedElement index={staggerIndex++} delay={720}>
          <CaptionText style={styles.sectionTitle}>Support</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={800}>
          <SettingsRow
            icon="star"
            iconColor={PALETTE.champagneGold}
            label="Rate Recovery Pulse"
            onPress={handleRateApp}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="share"
            iconColor="rgba(0, 245, 255, 0.9)"
            label="Share with Friends"
            onPress={handleShareApp}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="mail"
            iconColor="rgba(255, 255, 255, 0.7)"
            label="Send Feedback"
            onPress={handleFeedback}
          />
        </AnimatedCard>

        {/* ── LEGAL ── */}
        <AnimatedElement index={staggerIndex++} delay={880}>
          <CaptionText style={styles.sectionTitle}>Legal</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={960}>
          <SettingsRow
            icon="shield-checkmark"
            iconColor="rgba(80, 200, 120, 0.9)"
            label="Privacy Policy"
            onPress={() => { Haptics.selectionAsync(); Linking.openURL(LEGAL_URLS.privacy); }}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="document-text"
            iconColor="rgba(255, 255, 255, 0.7)"
            label="Terms of Use"
            onPress={() => { Haptics.selectionAsync(); Linking.openURL(LEGAL_URLS.terms); }}
          />
        </AnimatedCard>

        {/* ── ABOUT ── */}
        <AnimatedElement index={staggerIndex++} delay={1040}>
          <CaptionText style={styles.sectionTitle}>About</CaptionText>
        </AnimatedElement>

        <AnimatedCard index={staggerIndex++} delay={1120}>
          <View style={styles.aboutCard}>
            <View style={styles.appIcon}>
              <Ionicons name="pulse" size={32} color={PALETTE.champagneGold} />
            </View>
            <View style={styles.appInfo}>
              <SafeText variant="headline" numberOfLines={1}>Recovery Pulse</SafeText>
              <Pressable onPress={handleVersionTap} hitSlop={8}>
                <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted} numberOfLines={1}>
                  Version 1.0.0
                </SafeText>
              </Pressable>
            </View>
          </View>
          <SafeText variant="body" style={styles.description} numberOfLines={3}>
            Track your daily recovery metrics and optimize your training with
            data-driven insights.
          </SafeText>
        </AnimatedCard>

        {/* ── LABORATORY (hidden) ── */}
        {labUnlocked && (
          <>
            <AnimatedElement index={staggerIndex++} delay={1200}>
              <CaptionText style={styles.sectionTitle}>Laboratory</CaptionText>
            </AnimatedElement>

            <AnimatedCard index={staggerIndex++} delay={1280}>
              <View style={styles.labHeader}>
                <Ionicons name="flask" size={20} color={PALETTE.danger} />
                <SafeText variant="bodySmall" color={PALETTE.danger} numberOfLines={1}>
                  Developer Options - Use with caution
                </SafeText>
              </View>
              <View style={styles.buttonGroup}>
                <SapphireButton title="Replay Onboarding" onPress={handleReplayOnboarding} variant="ghost" fullWidth />
                <SapphireButton title="Show Paywall" onPress={handleShowPaywall} variant="ghost" fullWidth />
                <SapphireButton title="Expire Grace Period (Test)" onPress={handleExpireGracePeriod} variant="ghost" fullWidth />
              </View>
            </AnimatedCard>
          </>
        )}
      </ScrollView>

      <SovereignPaywall visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

// ── Reusable Settings Row ──

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  subtitle?: string;
  value?: string;
  labelColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  label,
  subtitle,
  value,
  labelColor,
  onPress,
  rightElement,
}) => {
  const content = (
    <View style={styles.settingsRow}>
      <View style={[styles.rowIcon, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <SafeText variant="body" color={labelColor} numberOfLines={1}>
          {label}
        </SafeText>
        {subtitle && (
          <SafeText variant="caption" color={PALETTE.titaniumSilverMuted} numberOfLines={1}>
            {subtitle}
          </SafeText>
        )}
      </View>
      {rightElement || (
        <View style={styles.rowRight}>
          {value && (
            <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted} numberOfLines={1}>
              {value}
            </SafeText>
          )}
          {onPress && (
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.rowPressed}>
        {content}
      </Pressable>
    );
  }
  return content;
};

// ── Sub-components ──

const FormulaChip: React.FC<{ label: string; weight: string }> = ({ label, weight }) => (
  <View style={styles.formulaChip}>
    <SafeText variant="bodySmall" color={PALETTE.pureWhite} numberOfLines={1}>{label}</SafeText>
    <SafeText variant="caption" color={PALETTE.champagneGold} numberOfLines={1}>{weight}</SafeText>
  </View>
);

interface ScoreRangeProps {
  range: string;
  label: string;
  color: string;
  description: string;
}

const ScoreRange: React.FC<ScoreRangeProps> = ({ range, label, color, description }) => (
  <View style={styles.rangeItem}>
    <View style={[styles.rangeIndicator, { backgroundColor: color }]} />
    <View style={styles.rangeInfo}>
      <View style={styles.rangeHeader}>
        <SafeText variant="title" numberOfLines={1}>{range}</SafeText>
        <SafeText variant="bodySmall" color={color} numberOfLines={1}>{label}</SafeText>
      </View>
      <SafeText variant="bodySmall" color={PALETTE.titaniumSilverMuted} numberOfLines={1}>
        {description}
      </SafeText>
    </View>
  </View>
);

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginLeft: SPACING.xs,
    marginTop: SPACING.sm,
  },

  // Subscription
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  subscriptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
    gap: SPACING.xs,
  },

  // Settings Row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 44,
    paddingVertical: SPACING.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 48,
  },

  // Time picker
  timePicker: {
    height: 160,
    marginTop: -SPACING.sm,
  },

  // Recovery Model
  rangesSection: {
    gap: SPACING.md,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  rangeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginTop: 2,
  },
  rangeInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: SPACING.md,
  },
  formulaLabel: {
    marginBottom: SPACING.sm,
  },
  formulaChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formulaChip: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    borderCurve: 'continuous',
  },

  // About
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    gap: SPACING.xs,
  },
  description: {
    lineHeight: 22,
  },

  // Laboratory
  labHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(224, 17, 95, 0.3)',
  },
  buttonGroup: {
    gap: SPACING.md,
  },
});
