/**
 * Recovery Pulse - Database Hook
 * Initialize and manage database connection
 */

import { useEffect, useState } from 'react';
import { initDatabase } from '../db/client';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      initDatabase();
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Database initialization failed'));
    }
  }, []);

  return {
    isReady,
    error,
  };
};
