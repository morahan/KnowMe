import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Body } from '@/ui/Body';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { space } from '@/theme';
import { copy } from './copy';
import { openPhone } from './openPhone';

export function CrisisScreen() {
  return (
    <Screen
      footer={
        <View style={styles.actions}>
          <PrimaryButton label={copy.call988} onPress={() => openPhone('tel:988', '988')} />
          <QuietLink label={copy.text988} onPress={() => openPhone('sms:988', '988')} />
          <QuietLink label={copy.call911} onPress={() => openPhone('tel:911', '911')} />
          <QuietLink label={copy.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        </View>
      }
    >
      <View style={styles.message}>
        <Title>{copy.title}</Title>
        <Body muted>{copy.body}</Body>
        <Label>{copy.lifeline}</Label>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { gap: space.md },
  actions: { gap: space.sm },
});
