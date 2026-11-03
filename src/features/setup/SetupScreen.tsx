import { Body } from '@/ui/Body';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';

export function SetupScreen() {
  return (
    <Screen>
      <Title>{copy.title}</Title>
      <Body muted>{copy.body}</Body>
    </Screen>
  );
}
