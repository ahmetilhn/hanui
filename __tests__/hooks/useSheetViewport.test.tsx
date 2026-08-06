import { act, renderHook } from '@testing-library/react';

import useSheetViewport from '@/hooks/useSheetViewport';

type ViewportStub = {
  height: number;
  offsetTop: number;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
};

const INSET = '--hanui-sheet-inset-bottom';
const HEIGHT = '--hanui-sheet-height';

const mockViewport = (height: number, offsetTop = 0): ViewportStub => {
  const stub: ViewportStub = {
    height,
    offsetTop,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  Object.defineProperty(window, 'visualViewport', {
    writable: true,
    configurable: true,
    value: stub,
  });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

  return stub;
};

const readVar = (name: string) => document.documentElement.style.getPropertyValue(name);

describe('useSheetViewport', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(INSET);
    document.documentElement.style.removeProperty(HEIGHT);
  });

  it('`visualViewport` yoksa sessizce çıkar', () => {
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    expect(() => renderHook(() => useSheetViewport())).not.toThrow();
    expect(readVar(HEIGHT)).toBe('');
  });

  it('kapanan şeridi ölçüp değişkenlere yazar', () => {
    mockViewport(500, 40);

    renderHook(() => useSheetViewport());

    expect(readVar(INSET)).toBe('260px');
    expect(readVar(HEIGHT)).toBe('500px');
  });

  it('şerit yokken sıfır yazar — eksiye düşmez', () => {
    mockViewport(800);

    renderHook(() => useSheetViewport());

    expect(readVar(INSET)).toBe('0px');
  });

  it('ABSÜRT küçük ölçüm YAZILMAZ', () => {
    mockViewport(80);

    renderHook(() => useSheetViewport());

    expect(readVar(HEIGHT)).toBe('');
    expect(readVar(INSET)).toBe('');
  });

  it('absürt ölçüm ÖNCEKİ doğru değeri bozmaz', () => {
    mockViewport(700);
    const first = renderHook(() => useSheetViewport());

    expect(readVar(HEIGHT)).toBe('700px');

    mockViewport(90);
    const second = renderHook(() => useSheetViewport());

    expect(readVar(HEIGHT)).toBe('700px');

    act(() => second.unmount());
    act(() => first.unmount());
  });

  it('çalışmayan bir kare sonraki ölçümü ENGELLEMEZ', () => {
    const pending: FrameRequestCallback[] = [];
    const originalRequest = window.requestAnimationFrame;
    const originalCancel = window.cancelAnimationFrame;

    window.requestAnimationFrame = (callback: FrameRequestCallback) => pending.push(callback);
    window.cancelAnimationFrame = () => {};

    try {
      mockViewport(700);
      const first = renderHook(() => useSheetViewport());

      const viewport = window.visualViewport as unknown as ViewportStub;
      const onResize = viewport.addEventListener.mock.calls.find(
        ([event]) => event === 'resize',
      )?.[1] as () => void;
      onResize();
      expect(pending).toHaveLength(1);

      act(() => first.unmount());

      mockViewport(500);
      renderHook(() => useSheetViewport());

      expect(readVar(HEIGHT)).toBe('500px');
    } finally {
      window.requestAnimationFrame = originalRequest;
      window.cancelAnimationFrame = originalCancel;
    }
  });

  it('`isActive: false` iken ölçmez ve dinleyici kurmaz', () => {
    const viewport = mockViewport(500);

    renderHook(() => useSheetViewport(false));

    expect(viewport.addEventListener).not.toHaveBeenCalled();
    expect(readVar(HEIGHT)).toBe('');
  });

  it('sökülünce değişkenler SİLİNİR', () => {
    mockViewport(500);

    const { unmount } = renderHook(() => useSheetViewport());
    act(() => unmount());

    expect(readVar(HEIGHT)).toBe('');
    expect(readVar(INSET)).toBe('');
  });

  it('iki panel açıkken TEK dinleyici kurulur ve ilki kapanınca kaldırılmaz', () => {
    const viewport = mockViewport(500);

    const outer = renderHook(() => useSheetViewport());
    const inner = renderHook(() => useSheetViewport());

    expect(viewport.addEventListener).toHaveBeenCalledTimes(2);

    act(() => inner.unmount());
    expect(viewport.removeEventListener).not.toHaveBeenCalled();
    expect(readVar(HEIGHT)).toBe('500px');

    act(() => outer.unmount());
    expect(viewport.removeEventListener).toHaveBeenCalledTimes(2);
    expect(readVar(HEIGHT)).toBe('');
  });
});
