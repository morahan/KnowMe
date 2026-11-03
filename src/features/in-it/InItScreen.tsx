import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BreathCircle } from '@/ui/BreathCircle';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { copy } from './copy';

export function InItScreen() {
  return (
    <Screen footer={<QuietLink label={copy.close} onPress={() => router.back()} />}>
      <View style={styles.center}>
        <BreathCircle inLabel={copy.breatheIn} outLabel={copy.breatheOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
