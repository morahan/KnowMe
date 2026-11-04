// Root: theme, db init, safety provider. The only route file allowed to touch db/ and theme/.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrate } from '@/db/client';
import { SafetyProvider } from '@/features/safety';
import { useTheme } from '@/theme';

migrate();

export default function RootLayout() {
  const { colors, scheme } = useTheme();
  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <SafetyProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="in-it" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="crisis" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack>
      </SafetyProvider>
    </SafeAreaProvider>
  );
}
