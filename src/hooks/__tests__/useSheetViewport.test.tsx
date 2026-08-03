import { act, renderHook } from '@testing-library/react';

import useSheetViewport from '../useSheetViewport';

/**
 * Görünen alan ölçümü — iOS'ta klavye altında kalan panelin düzeltmesi.
 *
 * <h3>Neden bir test</h3>
 * Kancanın tuttuğu iki değişken MODÜL DÜZEYİNDE: açık panel sayacı ve
 * animasyon karesi. Modül düzeyi durum, aynı anda iki panel açıldığında
 * (filtre panelinin içindeki bir seçim kutusu) sessizce yanlış davranıyor:
 * üstteki panel kapandığında sayaç sıfırlanmadan dinleyiciler kaldırılırsa
 * alttaki panel ÖLÇÜLMEDEN kalır ve dibinden kırpılır. Testin ölçtüğü şey tam
 * olarak bu sayaç.
 */

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

  /*
   * `innerHeight` YERLESIM gorunum alani: iOS'ta klavye onu hic kucultmez.
   * Fark, ekranin dibinde kullanicinin goremedigi seridin yuksekligi ve panel
   * `position: fixed; bottom: 0` ile tam o seridin ALTINA hizalaniyordu.
   */
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

  /*
   * GERCEK CIHAZDA BILDIRILEN HATA.
   *
   * `visualViewport.height` klavye acilip kapanirken, sayfa arka plandan
   * donerken ve `<dialog>` ust katmana girerken bir kare boyunca absurt kucuk
   * degerler raporluyor. Deger kosulsuz yaziliyordu ve panel o olcuye
   * kilitleniyordu: 120 px olcum → 96 px panel → 57 px baslik + 39 px govde,
   * yani listenin yarim satirinin gorundugu bir kaydirma yarigi.
   *
   * Olcum atlandiginda ONCEKI dogru deger yerinde kalir; hic olcum
   * yapilmadiysa CSS yedegi (`100dvh`) devrede.
   */
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

    /* Ayni panel acikken klavye gecisi: gecici bir kare 90 px raporluyor. */
    mockViewport(90);
    const second = renderHook(() => useSheetViewport());

    expect(readVar(HEIGHT)).toBe('700px');

    act(() => second.unmount());
    act(() => first.unmount());
  });

  /*
   * KARE BAYRAGI TAKILI KALMAMALI.
   *
   * Bayrak yalnizca `requestAnimationFrame` geri cagrisinda sifirlaniyordu ve
   * o geri cagri CALISMAYABILIR (sekme arka planda, iOS ust katman gecisi).
   * Kare hic gelmediginde bayrak dolu kaliyor ve sonraki HER olcum sessizce
   * atlaniyordu — panel, o an ne olculduyse orada donuyordu.
   */
  it('çalışmayan bir kare sonraki ölçümü ENGELLEMEZ', () => {
    const pending: FrameRequestCallback[] = [];
    const originalRequest = window.requestAnimationFrame;
    const originalCancel = window.cancelAnimationFrame;

    /* Kare ISTENIYOR ama hicbir zaman CALISMIYOR. */
    window.requestAnimationFrame = (callback: FrameRequestCallback) => pending.push(callback);
    window.cancelAnimationFrame = () => {};

    try {
      mockViewport(700);
      const first = renderHook(() => useSheetViewport());

      /* Bir `resize` gecici bir kare planliyor; kare hic calismiyor. */
      const viewport = window.visualViewport as unknown as ViewportStub;
      const onResize = viewport.addEventListener.mock.calls.find(
        ([event]) => event === 'resize',
      )?.[1] as () => void;
      onResize();
      expect(pending).toHaveLength(1);

      act(() => first.unmount());

      /* Yeni panel: bayrak takili kalmis olsaydi bu olcum atlanirdi. */
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

  /*
   * Degiskenler SILINIR, sifirlanmaz: yedek deger CSS'te (`var(…, 0px)` /
   * `var(…, 100dvh)`) ve panel kapaliyken dogru olan o.
   */
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

    /* `resize` + `scroll`: iki olay, bir kez. */
    expect(viewport.addEventListener).toHaveBeenCalledTimes(2);

    act(() => inner.unmount());
    expect(viewport.removeEventListener).not.toHaveBeenCalled();
    expect(readVar(HEIGHT)).toBe('500px');

    act(() => outer.unmount());
    expect(viewport.removeEventListener).toHaveBeenCalledTimes(2);
    expect(readVar(HEIGHT)).toBe('');
  });
});
