import { renderHook } from '@testing-library/react';
import { createRef } from 'react';

import usePositioning from '@/hooks/usePositioning';

/**
 * `usePositioning` — kenar seçimi ve KIRPMA.
 *
 * ⚠ Bu kanca bir dönem hiç doğrudan test edilmiyordu (ölçülen: fonksiyon %80,
 * dal %55,6). Aşağıdaki kusur tam da o boşlukta yaşadı ve görünür sonucu
 * "yüzey hiç görünmüyor" idi — ama hiçbir katman hata vermiyordu.
 */

const VIEWPORT = { width: 1024, height: 768 };

const mockViewport = (width: number, height: number): void => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: height });
};

/** Verilen kutuyu döndüren sahte bir eleman. */
const elementWith = (rect: Partial<DOMRect>): HTMLElement => {
  const node = document.createElement('div');
  node.getBoundingClientRect = () =>
    ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, ...rect }) as DOMRect;
  document.body.appendChild(node);
  return node;
};

const positionOf = (anchor: Partial<DOMRect>, surface: Partial<DOMRect>) => {
  const anchorRef = createRef<HTMLElement>() as { current: HTMLElement | null };
  const surfaceRef = createRef<HTMLElement>() as { current: HTMLElement | null };
  anchorRef.current = elementWith(anchor);
  surfaceRef.current = elementWith(surface);

  const { result } = renderHook(() =>
    usePositioning(anchorRef, surfaceRef, { side: 'bottom', align: 'start', isOpen: true }),
  );

  return result.current.style;
};

beforeEach(() => mockViewport(VIEWPORT.width, VIEWPORT.height));

describe('usePositioning — kırpma', () => {
  it('sağ kenardaki tetikleyicinin yüzeyi ekran içinde kalır', () => {
    const style = positionOf(
      { top: 100, left: 1000, width: 24, height: 24, bottom: 124, right: 1024 },
      { width: 200, height: 100 },
    );

    expect(Number(style.left)).toBeLessThanOrEqual(VIEWPORT.width - 200);
    expect(Number(style.left)).toBeGreaterThanOrEqual(0);
  });

  it('YÜZEY VİEWPORT`TAN UZUNSA ekran dışına konumlanmaz', () => {
    /*
     * ⚠ REGRESYON NÖBETÇİSİ — ölçülmüş kusur.
     *
     * `clamp` düz `Math.min(Math.max(v, min), max)` idi. Yüzey görünüm
     * alanından uzun olduğunda `max` (`viewport - surface - padding`) `min`in
     * ALTINA — çoğu zaman negatife — düşüyor ve `Math.min` onu seçiyordu.
     * Sonuç: yüzey ekranın üstüne/soluna, negatif koordinata konumlanıyor ve
     * KULLANICI HİÇBİR ŞEY GÖRMÜYORDU.
     *
     * `Popover`ın `max-height`i yok, yani uzun içerikli bir popover bunu
     * gerçekten üretebiliyordu.
     */
    const style = positionOf(
      { top: 400, left: 100, width: 24, height: 24, bottom: 424, right: 124 },
      { width: 200, height: 2000 }, // 768 piksellik görünüm alanından UZUN
    );

    expect(Number(style.top)).toBeGreaterThanOrEqual(0);
    expect(Number(style.left)).toBeGreaterThanOrEqual(0);
  });

  it('yüzey viewport`tan GENİŞSE de negatif sola kaymaz', () => {
    const style = positionOf(
      { top: 100, left: 100, width: 24, height: 24, bottom: 124, right: 124 },
      { width: 4000, height: 100 },
    );

    expect(Number(style.left)).toBeGreaterThanOrEqual(0);
  });
});
