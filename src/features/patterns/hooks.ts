import { useCallback, useEffect, useState } from 'react';
import { listMomentsSince } from '@/db/repos/moments';
import type { Moment } from '@/db/schema';
import { daysAgo } from '@/lib/dates';

export function usePatterns() {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const load = useCallback(async () => {
    setMoments(await listMomentsSince(daysAgo(90).toISOString()));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return { moments, reload: load };
}
