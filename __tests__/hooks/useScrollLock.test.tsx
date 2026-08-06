import { act, renderHook } from '@testing-library/react';

import useScrollLock from '@/hooks/useScrollLock';

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.documentElement.style.removeProperty('scrollbar-gutter');
  });

  it('kilitler ve sökülünce ÖNCEKİ değere döner', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useScrollLock());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => unmount());
    expect(document.body.style.overflow).toBe('auto');
  });

  it('`isLocked: false` iken hiçbir şeye dokunmaz', () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('iç içe iki panelde kilit SON kapanışta açılır', () => {
    const outer = renderHook(() => useScrollLock());
    const inner = renderHook(() => useScrollLock());

    expect(document.body.style.overflow).toBe('hidden');

    act(() => inner.unmount());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => outer.unmount());
    expect(document.body.style.overflow).toBe('');
  });

  it('sökme sırası TERS olduğunda da kilit erken açılmaz', () => {
    const outer = renderHook(() => useScrollLock());
    const inner = renderHook(() => useScrollLock());

    act(() => outer.unmount());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => inner.unmount());
    expect(document.body.style.overflow).toBe('');
  });

  it('önceki satır içi dolgu kilit kalkınca geri gelir', () => {
    document.body.style.paddingRight = '4px';

    const { unmount } = renderHook(() => useScrollLock());
    act(() => unmount());

    expect(document.body.style.paddingRight).toBe('4px');
  });
});
