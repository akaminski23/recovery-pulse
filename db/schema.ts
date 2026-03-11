/**
 * Recovery Pulse - Database Schema
 * Drizzle ORM + SQLite
 */

import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';

export const checkIns = sqliteTable('check_ins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(), // ISO format: YYYY-MM-DD

  // Sleep metrics
  sleepHours: real('sleep_hours').notNull(),
  sleepQuality: integer('sleep_quality').notNull(), // 1-10

  // Body metrics
  fatigue: integer('fatigue').notNull(), // 1-10 (10 = exhausted)
  soreness: integer('soreness').notNull(), // 1-10 (10 = very sore)

  // Calculated
  recoveryScore: integer('recovery_score').notNull(), // 0-100

  // Metadata
  createdAt: text('created_at').notNull(),
  notes: text('notes'),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;

/**
 * Clamp value to range
 */
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Sleep Duration score (0-10).
 * Fully linear from 4h (0) to 10h (10).
 * Every hour adds ~1.67 to raw score (~2.5 points to final).
 * No plateau — every step on the slider changes the score.
 */
const sleepDurationScore = (hours: number): number => {
  return Math.max(0, Math.min(10, (hours - 4) * (10 / 6)));
};

/**
 * Recovery Score Formula (0-100)
 *
 * Components:
 * - Sleep Duration (15%): Bell curve peaking at 8h
 * - Sleep Quality (25%): Direct 1-10 scale
 * - Fatigue Inverse (30%): 10 - fatigue (lower fatigue = better)
 * - Soreness Inverse (30%): 10 - soreness (lower soreness = better)
 */
export const calculateRecoveryScore = (
  sleepQuality: number,
  fatigue: number,
  soreness: number,
  sleepHours?: number
): number => {
  const validSleep = clamp(sleepQuality, 1, 10);
  const validFatigue = clamp(fatigue, 1, 10);
  const validSoreness = clamp(soreness, 1, 10);

  // Normalize all to 0-10 scale (sliders are 1-10, so map 1→0, 10→10)
  const normalizedQuality = ((validSleep - 1) / 9) * 10;
  const normalizedFatigue = ((10 - validFatigue) / 9) * 10;
  const normalizedSoreness = ((10 - validSoreness) / 9) * 10;

  const durationComponent = sleepHours != null
    ? sleepDurationScore(clamp(sleepHours, 4, 10)) * 0.15
    : normalizedQuality * 0.15;
  const sleepComponent = normalizedQuality * 0.25;
  const fatigueComponent = normalizedFatigue * 0.30;
  const sorenessComponent = normalizedSoreness * 0.30;

  const raw = (durationComponent + sleepComponent + fatigueComponent + sorenessComponent) * 10;
  return Math.round(Math.max(0, Math.min(100, raw)));
};

/**
 * Get recovery status label based on score
 */
export const getRecoveryStatus = (
  score: number
): { label: string; color: string } => {
  if (score >= 80) return { label: 'Optimal', color: 'rgba(80, 200, 120, 0.9)' };
  if (score >= 60) return { label: 'Good', color: 'rgba(212, 175, 55, 0.85)' };
  if (score >= 40) return { label: 'Moderate', color: 'rgba(255, 179, 71, 0.9)' };
  return { label: 'Low', color: 'rgba(224, 17, 95, 0.9)' };
};
