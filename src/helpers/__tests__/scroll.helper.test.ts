import { scrollIntoViewIfPossible } from '../scroll.helper';

/**
 * TÜKETİCİ TESTİNİ KIRAN HATANIN NÖBETÇİSİ.
 *
 * <p>Bulunduğu yer gerçek: `hanparca-frontend`in `LoginContainer` testi
 * `E.scrollIntoView is not a function` ile düşüyordu. Kırılan yer tüketicinin
 * kodu, sebebi ise `Tabs`ın seçili sekmeyi görünüre kaydırma girişimiydi —
 * jsdom `scrollIntoView`u uygulamıyor. Kütüphane, çizildiği her test
 * ortamında AYAKTA kalmak zorunda.
 */

describe('scrollIntoViewIfPossible', () => {
  it('destekleniyorsa çağırır ve seçenekleri geçirir', () => {
    const scrollIntoView = jest.fn();
    const element = { scrollIntoView } as unknown as Element;

    scrollIntoViewIfPossible(element, { block: 'nearest' });

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  /* jsdom'da `scrollIntoView` TANIMSIZ: cagri bir `TypeError` atiyordu. */
  it('ortam desteklemiyorsa ATMAZ', () => {
    const element = {} as Element;

    expect(() => scrollIntoViewIfPossible(element, { block: 'nearest' })).not.toThrow();
  });

  it('öğe yoksa ATMAZ', () => {
    expect(() => scrollIntoViewIfPossible(null)).not.toThrow();
    expect(() => scrollIntoViewIfPossible(undefined)).not.toThrow();
  });
});
