import { act, fireEvent, render } from '@testing-library/react-native';
import { DeviceEventEmitter, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Screen } from './Screen';
import { requestScrollToTop } from './scrollToTop';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderScreen(footerVisibleWithKeyboard = false) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <Screen scroll footer={<Text>ScreenFooter</Text>} footerVisibleWithKeyboard={footerVisibleWithKeyboard}>
        <TextInput placeholder="Note" />
      </Screen>
    </SafeAreaProvider>,
  );
}

const keyboardEvent = {
  endCoordinates: { screenX: 0, screenY: 500, width: 390, height: 344 },
  easing: 'keyboard',
  duration: 250,
};

describe('Screen wide-window layout', () => {
  it('caps the content column at the theme max width, centered', async () => {
    const utils = await renderScreen();
    const scrollers = utils.root!.queryAll(
      (node) => node.props.keyboardShouldPersistTaps === 'handled',
    );
    const flat = (Array.isArray(scrollers[0]!.props.style)
      ? scrollers[0]!.props.style
      : [scrollers[0]!.props.style]
    ) as Record<string, unknown>[];
    expect(flat.some((s) => s.maxWidth === 560 && s.alignSelf === 'center' && s.width === '100%')).toBe(true);
    const footerText = utils.getByText('ScreenFooter');
    expect(footerText).toBeTruthy();
  });
});

describe('Screen scroll-to-top', () => {
  it('scrolls to y=0 when its scrollTopKey is requested, and stops after unmount', async () => {
    const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
    try {
      const utils = await render(
        <SafeAreaProvider initialMetrics={metrics}>
          <Screen scroll scrollTopKey="patterns">
            <Text>Body</Text>
          </Screen>
        </SafeAreaProvider>,
      );
      await act(async () => {
        requestScrollToTop('patterns');
      });
      expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
      await utils.unmount();
      scrollTo.mockClear();
      requestScrollToTop('patterns');
      expect(scrollTo).not.toHaveBeenCalled();
    } finally {
      scrollTo.mockRestore();
    }
  });
});

describe('Screen keyboard handling', () => {
  it('wraps content in a KeyboardAvoidingView with a platform behaviour', async () => {
    const utils = await renderScreen();
    // Walk fibers: KeyboardAvoidingView is a composite, not a host node.
    type FiberLike = {
      type: unknown;
      memoizedProps?: { behavior?: string };
      child: FiberLike | null;
      sibling: FiberLike | null;
    };
    let behavior: string | undefined;
    const stack: FiberLike[] = [utils.root!.unstable_fiber as unknown as FiberLike];
    while (stack.length > 0 && behavior === undefined) {
      const fiber = stack.pop()!;
      if (fiber.type === KeyboardAvoidingView) behavior = fiber.memoizedProps?.behavior;
      if (fiber.sibling) stack.push(fiber.sibling);
      if (fiber.child) stack.push(fiber.child);
    }
    // iOS pads, Android resizes by height; either keeps the focused input visible.
    expect(behavior).toBe(Platform.OS === 'ios' ? 'padding' : 'height');
    const scrollers = utils.root!.queryAll(
      (node) => node.props.keyboardShouldPersistTaps === 'handled',
    );
    expect(scrollers.length).toBeGreaterThan(0);
    expect(scrollers[0]!.props.automaticallyAdjustKeyboardInsets).toBe(true);
  });

  it('on Android hides the footer on keyboardDidShow and restores it on keyboardDidHide', async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    try {
      const utils = await renderScreen();
      expect(utils.getByText('ScreenFooter')).toBeTruthy();
      await act(async () => {
        DeviceEventEmitter.emit('keyboardDidShow', keyboardEvent);
      });
      expect(utils.queryByText('ScreenFooter')).toBeNull();
      await act(async () => {
        DeviceEventEmitter.emit('keyboardDidHide', keyboardEvent);
      });
      expect(utils.getByText('ScreenFooter')).toBeTruthy();
    } finally {
      Object.defineProperty(Platform, 'OS', { value: original, configurable: true });
    }
  });

  it('keeps the footer visible while the keyboard is open when footerVisibleWithKeyboard is set', async () => {
    const utils = await renderScreen(true);
    expect(utils.getByText('ScreenFooter')).toBeTruthy();
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    await act(async () => {
      DeviceEventEmitter.emit(showEvent, keyboardEvent);
    });
    expect(utils.getByText('ScreenFooter')).toBeTruthy();
    await act(async () => {
      DeviceEventEmitter.emit(hideEvent, keyboardEvent);
    });
    expect(utils.getByText('ScreenFooter')).toBeTruthy();
  });

  it('hides the footer while the keyboard is open and restores it on close', async () => {
    const utils = await renderScreen();
    expect(utils.getByText('ScreenFooter')).toBeTruthy();
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    await act(async () => {
      DeviceEventEmitter.emit(showEvent, keyboardEvent);
    });
    expect(utils.queryByText('ScreenFooter')).toBeNull();
    await act(async () => {
      DeviceEventEmitter.emit(hideEvent, keyboardEvent);
    });
    expect(utils.getByText('ScreenFooter')).toBeTruthy();
  });

  it('scrolls the focused input clear of a pinned footer when the keyboard opens', async () => {
    type Box = (x: number, y: number, w: number, h: number) => void;
    const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
    // The scroller still reports full height (avoiding view not settled yet).
    const scrollerBox = jest
      .spyOn(ScrollView.prototype, 'measureInWindow')
      .mockImplementation((...args: unknown[]) => (args[0] as Box)(0, 0, 390, 844));
    const focused = jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureInWindow: (cb: Box) => cb(0, 450, 390, 50),
    } as unknown as ReturnType<typeof TextInput.State.currentlyFocusedInput>);
    try {
      const utils = await renderScreen(true);
      const footer = utils.getByText('ScreenFooter').parent!;
      await act(async () => {
        fireEvent(footer, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 60 } } });
      });
      await act(async () => {
        DeviceEventEmitter.emit('keyboardDidShow', keyboardEvent);
      });
      // Keyboard top 500 minus a 60px footer leaves 440 visible; the input
      // ends at 500, plus space.md (16) breathing room: scroll by 76.
      expect(scrollTo).toHaveBeenCalledWith({ y: 76, animated: true });
    } finally {
      scrollTo.mockRestore();
      scrollerBox.mockRestore();
      focused.mockRestore();
    }
  });
});
