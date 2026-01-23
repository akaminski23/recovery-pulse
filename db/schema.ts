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
 * Recovery Score Formula (0-100)
 *
 * Components:
 * - Sleep Quality (30%): Direct 1-10 scale
 * - Fatigue Inverse (35%): 10 - fatigue (lower fatigue = better)
 * - Soreness Inverse (35%): 10 - soreness (lower soreness = better)
 */
export const calculateRecoveryScore = (
  sleepQuality: number,
  fatigue: number,
  soreness: number
): number => {
  const validSleep = clamp(sleepQuality, 1, 10);
  const validFatigue = clamp(fatigue, 1, 10);
  const validSoreness = clamp(soreness, 1, 10);

  const sleepComponent = validSleep * 0.3;
  const fatigueComponent = (10 - validFatigue) * 0.35;
  const sorenessComponent = (10 - validSoreness) * 0.35;

  const raw = (sleepComponent + fatigueComponent + sorenessComponent) * 10;
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
