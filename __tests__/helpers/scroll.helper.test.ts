import { scrollIntoViewIfPossible, scrollWindowToTop } from '@/helpers/scroll.helper';

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

describe('scrollWindowToTop', () => {
  it('pencereyi ANIDA başa alır', () => {
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    scrollWindowToTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    scrollTo.mockRestore();
  });

  it('ortam desteklemiyorsa ATMAZ', () => {
    const original = window.scrollTo;
    Object.defineProperty(window, 'scrollTo', { value: undefined, configurable: true });

    expect(() => scrollWindowToTop()).not.toThrow();

    Object.defineProperty(window, 'scrollTo', { value: original, configurable: true });
  });
});
