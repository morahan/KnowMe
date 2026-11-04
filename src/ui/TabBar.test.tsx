import { fireEvent, render } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { registerScrollToTop } from './scrollToTop';
import { TabBar } from './TabBar';

function makeProps(index = 0, defaultPrevented = false): BottomTabBarProps {
  const routes = [
    { key: 'index-key', name: 'index' },
    { key: 'log-key', name: 'log' },
    { key: 'patterns-key', name: 'patterns' },
    { key: 'me-key', name: 'me' },
  ];
  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: { title: { index: 'Today', log: 'Log', patterns: 'Patterns', me: 'Me' }[route.name] },
        route,
        navigation: {},
        render: () => null,
      },
    ]),
  );
  return {
    state: {
      stale: false,
      type: 'tab',
      key: 'tab-key',
      index,
      routeNames: routes.map((r) => r.name),
      routes,
      history: [],
      preloadedRouteKeys: [],
    },
    descriptors: descriptors as BottomTabBarProps['descriptors'],
    emitter: {
      emit: jest.fn(() => ({ defaultPrevented })),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    } as unknown as BottomTabBarProps['emitter'],
    navigateToTab: jest.fn(),
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as BottomTabBarProps;
}

describe('TabBar', () => {
  it('marks only the focused tab as selected with its label', async () => {
    const utils = await render(<TabBar {...makeProps(1)} />);
    expect(utils.getByLabelText('Log').props.accessibilityState).toEqual({ selected: true });
    expect(utils.getByLabelText('Today').props.accessibilityState).toEqual({ selected: false });
    expect(utils.getByLabelText('Patterns').props.accessibilityState).toEqual({ selected: false });
    expect(utils.getByLabelText('Me').props.accessibilityState).toEqual({ selected: false });
    for (const label of ['Today', 'Log', 'Patterns', 'Me']) {
      expect(utils.getByText(label)).toBeTruthy();
    }
  });

  it('navigates on press and emits tabPress', async () => {
    const props = makeProps(0);
    const utils = await render(<TabBar {...props} />);
    fireEvent.press(utils.getByLabelText('Patterns'));
    expect(props.emitter.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'patterns-key',
      canPreventDefault: true,
    });
    expect(props.navigateToTab).toHaveBeenCalledWith('patterns-key');
  });

  it('scrolls to the top when an unfocused tab is pressed', async () => {
    const onScrollTop = jest.fn();
    const unregister = registerScrollToTop('patterns', onScrollTop);
    const props = makeProps(0);
    const utils = await render(<TabBar {...props} />);
    fireEvent.press(utils.getByLabelText('Patterns'));
    expect(onScrollTop).toHaveBeenCalledTimes(1);
    expect(props.navigateToTab).toHaveBeenCalledWith('patterns-key');
    // Scroll happens before the switch, so the page is at the top when shown.
    expect(onScrollTop.mock.invocationCallOrder[0]!).toBeLessThan(
      (props.navigateToTab as jest.Mock).mock.invocationCallOrder[0]!,
    );
    unregister();
  });

  it('scrolls to the top when the focused tab is pressed again', async () => {
    const onScrollTop = jest.fn();
    const unregister = registerScrollToTop('index', onScrollTop);
    const props = makeProps(0);
    const utils = await render(<TabBar {...props} />);
    fireEvent.press(utils.getByLabelText('Today'));
    expect(onScrollTop).toHaveBeenCalledTimes(1);
    expect(props.navigateToTab).not.toHaveBeenCalled();
    unregister();
  });

  it('neither scrolls nor navigates when tabPress is prevented', async () => {
    const onScrollTop = jest.fn();
    const unregister = registerScrollToTop('patterns', onScrollTop);
    const props = makeProps(0, true);
    const utils = await render(<TabBar {...props} />);
    fireEvent.press(utils.getByLabelText('Patterns'));
    expect(onScrollTop).not.toHaveBeenCalled();
    expect(props.navigateToTab).not.toHaveBeenCalled();
    unregister();
  });

  it('does not navigate when the focused tab is pressed', async () => {
    const props = makeProps(0);
    const utils = await render(<TabBar {...props} />);
    fireEvent.press(utils.getByLabelText('Today'));
    expect(props.navigateToTab).not.toHaveBeenCalled();
  });

  it('gives every tab at least the minimum touch target', async () => {
    const utils = await render(<TabBar {...makeProps(0)} />);
    for (const label of ['Today', 'Log', 'Patterns', 'Me']) {
      const style = utils.getByLabelText(label).props.style;
      const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flat.minHeight).toBeGreaterThanOrEqual(48);
      expect(flat.minWidth).toBeGreaterThanOrEqual(48);
    }
  });
});
