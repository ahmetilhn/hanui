import { act, renderHook, waitFor } from '@testing-library/react';

import { THEME_ATTRIBUTE } from '@/helpers/theme.helper';
import useHanuiTokens from '@/hooks/useHanuiTokens';

const root = document.documentElement;

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
  });
  root.removeAttribute(THEME_ATTRIBUTE);
  root.removeAttribute('style');
});

describe('useHanuiTokens', () => {
  it('çözülmüş değeri döner', async () => {
    root.style.setProperty('--hanui-series-1', '#252523');

    const { result } = renderHook(() => useHanuiTokens(['series-1']));

    await waitFor(() => expect(result.current['series-1']).toBe('#252523'));
  });

  it('tanımsız token `currentColor`a düşer — çizim kütüphanesi boş dizeyi siyah boyuyor', async () => {
    const { result } = renderHook(() => useHanuiTokens(['series-2']));

    await waitFor(() => expect(result.current['series-2']).toBe('currentColor'));
  });

  it('tema değişince YENİDEN okur', async () => {
    root.style.setProperty('--hanui-link', '#17704e');
    const { result } = renderHook(() => useHanuiTokens(['link']));
    await waitFor(() => expect(result.current.link).toBe('#17704e'));

    act(() => {
      root.style.setProperty('--hanui-link', '#60d4a1');
      root.setAttribute(THEME_ATTRIBUTE, 'dark');
    });

    await waitFor(() => expect(result.current.link).toBe('#60d4a1'));
  });

  it('her render`da yeni dizi verilse de aboneliği yenilemez', async () => {
    root.style.setProperty('--hanui-border', '#ded8d0');
    const { result, rerender } = renderHook(() => useHanuiTokens(['border']));
    await waitFor(() => expect(result.current.border).toBe('#ded8d0'));

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
