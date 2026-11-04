import { Alert, Linking } from 'react-native';
import { copy } from './copy';

/**
 * Opens a tel: or sms: link. Where there is no Phone or Messages app (iPad,
 * Wi-Fi-only devices, the simulator) the open fails; show the number instead
 * of doing nothing, so a support tap is never silent.
 */
export function openPhone(url: string, number: string): void {
  const showNumber = () => Alert.alert(copy.noPhoneTitle, copy.noPhoneBody(number));
  // Devices reject; the iOS simulator resolves false for tel: instead.
  Linking.openURL(url)
    .then((opened: unknown) => {
      if (opened === false) showNumber();
    })
    .catch(showNumber);
}
