/**
 * Recovery Pulse - Database Client
 * Drizzle ORM with expo-sqlite
 */

import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const DATABASE_NAME = 'recovery-pulse.db';

// Open database synchronously
const expoDb = openDatabaseSync(DATABASE_NAME);

// Create Drizzle instance
export const db = drizzle(expoDb, { schema });

// Initialize database tables
export const initDatabase = (): void => {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      sleep_hours REAL NOT NULL,
      sleep_quality INTEGER NOT NULL,
      fatigue INTEGER NOT NULL,
      soreness INTEGER NOT NULL,
      recovery_score INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      notes TEXT
    )
  `);
};

// Reset database (for development)
export const resetDatabase = (): void => {
  expoDb.execSync('DROP TABLE IF EXISTS check_ins');
  initDatabase();
};
