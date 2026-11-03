import type { ReactNode } from 'react';
import { Body } from '@/ui/Body';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';

type Props = { footer?: ReactNode };

export function PatternsScreen({ footer }: Props) {
  return (
    <Screen scroll>
      <Title>{copy.title}</Title>
      <Body muted>{copy.empty}</Body>
      {footer}
    </Screen>
  );
}
