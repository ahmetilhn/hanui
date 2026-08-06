import { scrollIntoViewIfPossible } from '../scroll.helper';

/** TÜKETİCİ TESTİNİ KIRAN HATANIN NÖBETÇİSİ. */

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
