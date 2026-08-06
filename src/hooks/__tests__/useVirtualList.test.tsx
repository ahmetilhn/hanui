import { act, renderHook } from '@testing-library/react';

import useVirtualList from '../useVirtualList';

/** SANALLAŞTIRMA nöbetçisi. */

/** Ölçülebilir bir kaydırma kutusu: jsdom düzen yapmıyor, ölçüler elle verilir. */
const attach = (
  ref: { current: HTMLElement | null },
  { clientHeight = 400, scrollTop = 0 } = {},
) => {
  const node = document.createElement('div');
  Object.defineProperty(node, 'clientHeight', { value: clientHeight, configurable: true });
  node.scrollTop = scrollTop;
  document.body.appendChild(node);
  ref.current = node;
  return node;
};

describe('useVirtualList', () => {
  /*
   * OLCUM YOKKEN TAM LISTE. Kutu daha olculmemisken (ilk kare, `display: none`)
   * `clientHeight` 0 doner; sifir satir cizilseydi liste bir kare boyunca BOS
   * gorunuyor ve ekran okuyucu o karede "0 secenek" diyordu.
   */
  it('ölçüm yokken TÜM listeyi çizer', () => {
    const { result } = renderHook(() => useVirtualList(1121));

    expect(result.current.range.start).toBe(0);
    expect(result.current.range.end).toBe(1121);
  });

  it('kapalıyken sanallaştırmaz', () => {
    const { result } = renderHook(() => useVirtualList(1121, { isEnabled: false }));

    act(() => {
      attach(result.current.scrollRef);
      result.current.measure();
    });

    expect(result.current.range.end).toBe(1121);
  });

  it('yalnızca görünen aralığı çizer', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40, overscan: 6 }));

    act(() => {
      attach(result.current.scrollRef, { clientHeight: 400 });
      result.current.measure();
    });

    /* 400 / 40 = 10 gorunur satir + 6 overscan. */
    expect(result.current.range.start).toBe(0);
    expect(result.current.range.end).toBe(16);
  });

  /*
   * Kaydirma cubugu GERCEK boyda olmali: `totalHeight` cizilen satirlardan
   * hesaplansaydi 1121 ogelik bir liste 16 satirlik bir cubuk gosterirdi ve
   * kullanici listenin bittigini sanardi.
   */
  it('`totalHeight` TÜM listeyi yansıtır', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40 }));

    act(() => {
      attach(result.current.scrollRef);
      result.current.measure();
    });

    expect(result.current.range.totalHeight).toBe(1121 * 40);
  });

  it('kaydırıldığında aralık ve boşluk kayar', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40, overscan: 6 }));

    act(() => {
      const node = attach(result.current.scrollRef, { clientHeight: 400 });
      node.scrollTop = 4000; /* 100. satir */
      result.current.measure();
    });

    expect(result.current.range.start).toBe(94);
    expect(result.current.range.offset).toBe(94 * 40);
  });

  /* Ustte overscan kadar satir kalmali: hizli kaydirmada ust kenarda bir kare
     bosluk gorunuyordu. */
  it('aralık listenin dışına TAŞMAZ', () => {
    const { result } = renderHook(() => useVirtualList(20, { rowHeight: 40, overscan: 6 }));

    act(() => {
      const node = attach(result.current.scrollRef, { clientHeight: 400 });
      node.scrollTop = 10_000;
      result.current.measure();
    });

    expect(result.current.range.end).toBe(20);
    expect(result.current.range.start).toBeGreaterThanOrEqual(0);
  });

  /*
   * `scrollIntoView` CIZILMEMIS bir satirda calismaz — klavyeyle listenin
   * dibine giden kullanici icin konum ONCE hesaplanmali.
   */
  it('`scrollToIndex` çizilmemiş satırın konumunu hesaplar', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40 }));

    let node!: HTMLElement;
    act(() => {
      node = attach(result.current.scrollRef, { clientHeight: 400 });
      result.current.measure();
    });

    act(() => result.current.scrollToIndex(500));

    /* Satirin ALTI gorunur alanin altina denk gelir: 501 * 40 - 400. */
    expect(node.scrollTop).toBe(501 * 40 - 400);
  });

  it('`scrollToIndex` yukarı doğru da çalışır', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40 }));

    let node!: HTMLElement;
    act(() => {
      node = attach(result.current.scrollRef, { clientHeight: 400 });
      node.scrollTop = 4000;
      result.current.measure();
    });

    act(() => result.current.scrollToIndex(10));

    expect(node.scrollTop).toBe(400);
  });
});
