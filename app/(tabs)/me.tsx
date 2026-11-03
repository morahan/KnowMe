import { useCallback, useEffect, useState } from 'react';
import { clearDemoData, hasDemoMoments, seedDemoData } from '@/features/demo-data';
import { MeScreen } from '@/features/me';

export default function MeRoute() {
  const [demoOn, setDemoOn] = useState(false);
  const refresh = useCallback(async () => setDemoOn(await hasDemoMoments()), []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <MeScreen
      demoOn={demoOn}
      onLoadDemo={() => {
        void seedDemoData().then(refresh);
      }}
      onClearDemo={() => {
        void clearDemoData().then(refresh);
      }}
    />
  );
}
