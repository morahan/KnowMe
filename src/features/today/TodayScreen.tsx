import { router } from 'expo-router';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Body } from '@/ui/Body';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';

export function TodayScreen() {
  return (
    <Screen footer={<PrimaryButton label={copy.imInIt} onPress={() => router.push('/in-it')} />}>
      <Title>{copy.title}</Title>
      <Body muted>{copy.empty}</Body>
    </Screen>
  );
}
