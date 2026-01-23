/**
 * Recovery Pulse - Database Queries
 * Typed queries for check-ins
 */

import { eq, desc, gte } from 'drizzle-orm';
import { db } from './client';
import { checkIns, NewCheckIn, CheckIn, calculateRecoveryScore } from './schema';
import { format, subDays } from 'date-fns';

/**
 * Get today's date in ISO format
 */
export const getTodayDate = (): string => format(new Date(), 'yyyy-MM-dd');

/**
 * Create a new check-in
 */
export const createCheckIn = (data: {
  sleepHours: number;
  sleepQuality: number;
  fatigue: number;
  soreness: number;
  notes?: string;
}): CheckIn => {
  const date = getTodayDate();
  const recoveryScore = calculateRecoveryScore(
    data.sleepQuality,
    data.fatigue,
    data.soreness
  );

  const newCheckIn: NewCheckIn = {
    date,
    sleepHours: data.sleepHours,
    sleepQuality: data.sleepQuality,
    fatigue: data.fatigue,
    soreness: data.soreness,
    recoveryScore,
    createdAt: new Date().toISOString(),
    notes: data.notes || null,
  };

  const result = db.insert(checkIns).values(newCheckIn).returning().get();
  return result;
};

/**
 * Get check-in by date
 */
export const getCheckInByDate = (date: string): CheckIn | undefined => {
  return db.select().from(checkIns).where(eq(checkIns.date, date)).get();
};

/**
 * Get today's check-in
 */
export const getTodayCheckIn = (): CheckIn | undefined => {
  return getCheckInByDate(getTodayDate());
};

/**
 * Get last N check-ins
 */
export const getRecentCheckIns = (limit: number = 7): CheckIn[] => {
  return db
    .select()
    .from(checkIns)
    .orderBy(desc(checkIns.date))
    .limit(limit)
    .all();
};

/**
 * Get check-ins for the last N days
 */
export const getCheckInsForDays = (days: number = 7): CheckIn[] => {
  const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');

  return db
    .select()
    .from(checkIns)
    .where(gte(checkIns.date, startDate))
    .orderBy(desc(checkIns.date))
    .all();
};

/**
 * Update an existing check-in
 */
export const updateCheckIn = (
  id: number,
  data: Partial<{
    sleepHours: number;
    sleepQuality: number;
    fatigue: number;
    soreness: number;
    notes: string;
  }>
): CheckIn | undefined => {
  const existing = db.select().from(checkIns).where(eq(checkIns.id, id)).get();

  if (!existing) return undefined;

  const updatedData = {
    sleepHours: data.sleepHours ?? existing.sleepHours,
    sleepQuality: data.sleepQuality ?? existing.sleepQuality,
    fatigue: data.fatigue ?? existing.fatigue,
    soreness: data.soreness ?? existing.soreness,
  };

  const recoveryScore = calculateRecoveryScore(
    updatedData.sleepQuality,
    updatedData.fatigue,
    updatedData.soreness
  );

  return db
    .update(checkIns)
    .set({
      ...updatedData,
      recoveryScore,
      notes: data.notes ?? existing.notes,
    })
    .where(eq(checkIns.id, id))
    .returning()
    .get();
};

/**
 * Delete a check-in
 */
export const deleteCheckIn = (id: number): void => {
  db.delete(checkIns).where(eq(checkIns.id, id)).run();
};

/**
 * Calculate average recovery score for recent check-ins
 */
export const getAverageRecoveryScore = (days: number = 7): number | null => {
  const checkInsData = getCheckInsForDays(days);

  if (checkInsData.length === 0) return null;

  const sum = checkInsData.reduce((acc, c) => acc + c.recoveryScore, 0);
  return Math.round(sum / checkInsData.length);
};
