import { createEvent, fireEvent, renderHook } from '@testing-library/react';

import { pushModal, resetModalStack } from '@/helpers/focus.helper';
import useDismissOnEscape from '@/hooks/useDismissOnEscape';

const press = (key: string): Event => {
  const event = createEvent.keyDown(document, { key });
  fireEvent(document, event);
  return event;
};

describe('useDismissOnEscape', () => {
  afterEach(() => resetModalStack());

  it('en üstteki yüzey kapanır ve tuşu İŞARETLER', () => {
    const onDismiss = jest.fn();
    renderHook(() => useDismissOnEscape(true, onDismiss));

    const event = press('Escape');

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('üstünde başka bir yüzey varken ne kapanır ne işaretler', () => {
    const onDismiss = jest.fn();
    renderHook(() => useDismissOnEscape(true, onDismiss));
    const { pop } = pushModal();

    const event = press('Escape');

    expect(onDismiss).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    pop();
  });

  it('kapalıyken dinlemez', () => {
    const onDismiss = jest.fn();
    renderHook(() => useDismissOnEscape(false, onDismiss));

    const event = press('Escape');

    expect(onDismiss).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('başka tuşa dokunmaz', () => {
    const onDismiss = jest.fn();
    renderHook(() => useDismissOnEscape(true, onDismiss));

    const event = press('Enter');

    expect(onDismiss).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
