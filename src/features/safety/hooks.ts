import { useContext } from 'react';
import { SafetyContext, type Safety } from './SafetyProvider';

export function useSafety(): Safety {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used inside SafetyProvider');
  return ctx;
}
