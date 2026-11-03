import { Linking, Share, StyleSheet, View } from 'react-native';
import { Body } from '@/ui/Body';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { space } from '@/theme';
import { copy } from './copy';

export function MeScreen() {
  return (
    <Screen scroll>
      <Title>{copy.supportTitle}</Title>
      <View style={styles.list}>
        <QuietLink label={copy.lifeline} onPress={() => Linking.openURL('tel:988')} />
        <QuietLink label={copy.samhsa} onPress={() => Linking.openURL('tel:18006624357')} />
        <QuietLink label={copy.quitNow} onPress={() => Linking.openURL('tel:18007848669')} />
        <QuietLink label={copy.tellSomeone} onPress={() => Share.share({ message: copy.tellSomeoneMessage })} />
      </View>

      <Title>{copy.privacyTitle}</Title>
      <Body muted>{copy.privacyBody}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.xs },
});
