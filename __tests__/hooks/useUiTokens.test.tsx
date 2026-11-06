import { act, renderHook, waitFor } from '@testing-library/react';

import { THEME_ATTRIBUTE } from '@/helpers/theme.helper';
import useUiTokens from '@/hooks/useUiTokens';

const root = document.documentElement;

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
  });
  root.removeAttribute(THEME_ATTRIBUTE);
  root.removeAttribute('style');
});

describe('useUiTokens', () => {
  it('çözülmüş değeri döner', async () => {
    root.style.setProperty('--ui-series-1', '#252523');

    const { result } = renderHook(() => useUiTokens(['series-1']));

    await waitFor(() => expect(result.current['series-1']).toBe('#252523'));
  });

  it('tanımsız token `currentColor`a düşer — çizim kütüphanesi boş dizeyi siyah boyuyor', async () => {
    const { result } = renderHook(() => useUiTokens(['series-2']));

    await waitFor(() => expect(result.current['series-2']).toBe('currentColor'));
  });

  it('tema değişince YENİDEN okur', async () => {
    root.style.setProperty('--ui-link', '#17704e');
    const { result } = renderHook(() => useUiTokens(['link']));
    await waitFor(() => expect(result.current.link).toBe('#17704e'));

    act(() => {
      root.style.setProperty('--ui-link', '#60d4a1');
      root.setAttribute(THEME_ATTRIBUTE, 'dark');
    });

    await waitFor(() => expect(result.current.link).toBe('#60d4a1'));
  });

  it('her render`da yeni dizi verilse de aboneliği yenilemez', async () => {
    root.style.setProperty('--ui-border', '#ded8d0');
    const { result, rerender } = renderHook(() => useUiTokens(['border']));
    await waitFor(() => expect(result.current.border).toBe('#ded8d0'));

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
