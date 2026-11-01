import { render, screen } from '@testing-library/react';

import Input from '@/components/Input';

/*
 * jsdom yerlesim hesaplamaz: genislik `getBoundingClientRect` uzerinden taklit edilir. Onek
 * `aria-hidden` oldugu icin metniyle bulunur.
 */
const mockWidth = (width: number) =>
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const isAdornment = /wrapper__(prefix|suffix)/.test(this.className);
    return {
      width: isAdornment ? width : 0,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => ({}),
    } as DOMRect;
  });

describe('Input', () => {
  afterEach(() => jest.restoreAllMocks());

  it('önek genişliğini ölçüp sarmalayıcıya yazar: iç pay öneğe göre', () => {
    mockWidth(8.4);
    render(<Input aria-label="Tutar" prefix="₺" />);
    const wrapper = screen.getByRole('textbox', { name: 'Tutar' }).parentElement!;

    expect(wrapper.style.getPropertyValue('--hanui-input-prefix-width')).toBe('9px');
    expect(wrapper.style.getPropertyValue('--hanui-input-suffix-width')).toBe('');
    expect(screen.getByRole('textbox')).toHaveClass('input--hasPrefix');
  });

  it('sonek de ölçülür; ölçüm yoksa değişken yazılmaz ve CSS ikon ölçüsünü varsayar', () => {
    mockWidth(22);
    const { rerender } = render(<Input aria-label="Ağırlık" suffix="kg" />);
    const wrapper = screen.getByRole('textbox', { name: 'Ağırlık' }).parentElement!;

    expect(wrapper.style.getPropertyValue('--hanui-input-suffix-width')).toBe('22px');

    jest.restoreAllMocks();
    rerender(<Input aria-label="Ağırlık" />);

    expect(wrapper.style.getPropertyValue('--hanui-input-suffix-width')).toBe('');
    expect(screen.getByRole('textbox')).not.toHaveClass('input--hasSuffix');
  });

  it('0 öneki başıboş bir "0" metni basmaz', () => {
    render(<Input aria-label="Adet" prefix={0} />);

    expect(screen.getByRole('textbox', { name: 'Adet' }).parentElement).not.toHaveTextContent('0');
  });
});
