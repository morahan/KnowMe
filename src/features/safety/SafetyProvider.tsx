import { router } from 'expo-router';
import { createContext, useMemo, type ReactNode } from 'react';
import { anyCrisis } from './logic';

export type Safety = {
  /** Shows the crisis card if any text matches. Returns true if it did — then stop, don't save or send. */
  guard: (...texts: (string | null | undefined)[]) => boolean;
  showCrisisCard: () => void;
};

export const SafetyContext = createContext<Safety | null>(null);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const value = useMemo<Safety>(() => {
    const showCrisisCard = () => router.push('/crisis');
    return {
      showCrisisCard,
      guard: (...texts) => {
        if (!anyCrisis(texts)) return false;
        showCrisisCard();
        return true;
      },
    };
  }, []);
  return <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>;
}
