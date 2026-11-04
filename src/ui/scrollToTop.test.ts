import { registerScrollToTop, requestScrollToTop } from './scrollToTop';

describe('scrollToTop registry', () => {
  it('calls the handler registered for a route', () => {
    const handler = jest.fn();
    const unregister = registerScrollToTop('patterns', handler);
    requestScrollToTop('patterns');
    expect(handler).toHaveBeenCalledTimes(1);
    unregister();
  });

  it('is a no-op for a route with no scrollable mounted', () => {
    expect(() => requestScrollToTop('me')).not.toThrow();
  });

  it('stops calling a handler after it unregisters', () => {
    const handler = jest.fn();
    registerScrollToTop('log', handler)();
    requestScrollToTop('log');
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleanup from a replaced handler does not remove the new handler', () => {
    const first = jest.fn();
    const second = jest.fn();
    const unregisterFirst = registerScrollToTop('me', first);
    const unregisterSecond = registerScrollToTop('me', second);
    unregisterFirst();
    requestScrollToTop('me');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    unregisterSecond();
  });
});
