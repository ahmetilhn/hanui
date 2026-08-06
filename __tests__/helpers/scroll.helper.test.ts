import { scrollIntoViewIfPossible } from '@/helpers/scroll.helper';

describe('scrollIntoViewIfPossible', () => {
  it('destekleniyorsa çağırır ve seçenekleri geçirir', () => {
    const scrollIntoView = jest.fn();
    const element = { scrollIntoView } as unknown as Element;

    scrollIntoViewIfPossible(element, { block: 'nearest' });

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('ortam desteklemiyorsa ATMAZ', () => {
    const element = {} as Element;

    expect(() => scrollIntoViewIfPossible(element, { block: 'nearest' })).not.toThrow();
  });

  it('öğe yoksa ATMAZ', () => {
    expect(() => scrollIntoViewIfPossible(null)).not.toThrow();
    expect(() => scrollIntoViewIfPossible(undefined)).not.toThrow();
  });
});
