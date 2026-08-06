import { act, renderHook } from '@testing-library/react';

import { THEME_ATTRIBUTE, THEME_SWITCHING_CLASS } from '@/helpers/theme.helper';
import useHanuiTheme from '@/hooks/useHanuiTheme';

const mockMatchMedia = (prefersDark: boolean) => {
  const listeners = new Set<() => void>();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      dispatchEvent: () => false,
    }),
  });

  return { emit: () => listeners.forEach(listener => listener()), listeners };
};

describe('useHanuiTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    document.documentElement.classList.remove(THEME_SWITCHING_CLASS);
    mockMatchMedia(false);
  });

  it('monte olmadan önce `light` ve `isReady: false`', () => {
    const { result } = renderHook(() => useHanuiTheme());

    expect(result.current.isReady).toBe(true);
    expect(result.current.scheme).toBe('light');
  });

  it('`<html data-hanui-theme>` neyse onu okur', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');

    const { result } = renderHook(() => useHanuiTheme());

    expect(result.current.scheme).toBe('dark');
  });

  it('öznitelik yokken SİSTEM tercihini okur', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useHanuiTheme());

    expect(result.current.scheme).toBe('dark');
  });

  it('geçersiz öznitelik değeri sistem tercihine düşer', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'sepia');
    mockMatchMedia(true);

    const { result } = renderHook(() => useHanuiTheme());

    expect(result.current.scheme).toBe('dark');
  });

  it('`setScheme` özniteliği yazar', () => {
    const { result } = renderHook(() => useHanuiTheme());

    act(() => result.current.setScheme('dark'));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    expect(result.current.scheme).toBe('dark');
  });

  it('`toggle` iki yönde de çalışır', () => {
    const { result } = renderHook(() => useHanuiTheme());

    act(() => result.current.toggle());
    expect(result.current.scheme).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.scheme).toBe('light');
  });

  it('geçiş sınıfı yazılır ve iki kare sonra kaldırılır', async () => {
    const { result } = renderHook(() => useHanuiTheme());

    act(() => result.current.setScheme('dark'));
    expect(document.documentElement).toHaveClass(THEME_SWITCHING_CLASS);

    await act(
      () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0))),
        ),
    );

    expect(document.documentElement).not.toHaveClass(THEME_SWITCHING_CLASS);
  });

  it('AÇIK seçim varken sistem tercihi değişimi görmezden gelinir', () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useHanuiTheme());

    act(() => result.current.setScheme('light'));
    act(() => media.emit());

    expect(result.current.scheme).toBe('light');
  });

  it('seçim yokken sistem tercihi izlenmeye devam eder', () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useHanuiTheme());

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    act(() => media.emit());

    expect(result.current.scheme).toBe('dark');
  });

  describe('`system` tercihi', () => {
    it('öznitelik yokken tercih `system`, çözülmüş şema sistemden gelir', () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useHanuiTheme());

      expect(result.current.preference).toBe('system');
      expect(result.current.scheme).toBe('dark');
    });

    it('`setScheme("system")` özniteliği SİLER', () => {
      const { result } = renderHook(() => useHanuiTheme());

      act(() => result.current.setScheme('dark'));
      expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(true);

      act(() => result.current.setScheme('system'));

      expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
      expect(result.current.preference).toBe('system');
    });

    it('`system`e dönüldüğünde ARADA değişen sistem tercihi görülür', () => {
      const media = mockMatchMedia(false);
      const { result } = renderHook(() => useHanuiTheme());

      act(() => result.current.setScheme('light'));

      mockMatchMedia(true);
      act(() => media.emit());
      expect(result.current.scheme).toBe('light');

      act(() => result.current.setScheme('system'));
      expect(result.current.scheme).toBe('dark');
    });

    it('`toggle` `system` iken ÇÖZÜLMÜŞ değerin tersine geçer', () => {
      mockMatchMedia(true);
      const { result } = renderHook(() => useHanuiTheme());

      expect(result.current.scheme).toBe('dark');

      act(() => result.current.toggle());

      expect(result.current.preference).toBe('light');
      expect(result.current.scheme).toBe('light');
    });
  });

  it('sökülünce sistem dinleyicisi kaldırılır', () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => useHanuiTheme());

    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
