import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';

import DateField, { DateRange } from '@/components/DateField';
import Input from '@/components/Input';

const noop = () => {};
const read = (path: string): string => readFileSync(path, 'utf8');

/*
 * `size="sm"` — ayni seritteki `Select sm`, `Button` SMALL ve girdiler tek yukseklikte (36px).
 * Olcu `input-sm` mixin'inde TEK yerde; bilesenler yalniz sinifi takar.
 */
describe('yoğun ölçü (`size="sm"`)', () => {
  it('`Input` sınıfı takar ve `size`ı yerel öğeye SIZDIRMAZ', () => {
    render(<Input aria-label="Ara" size="sm" />);

    const input = screen.getByRole('textbox', { name: 'Ara' });

    expect(input).toHaveClass('input--sm');
    /* Yerel `size` karakter genisligi; `size="sm"` DOM'a inseydi gecersiz bir nitelik olurdu. */
    expect(input).not.toHaveAttribute('size');
  });

  it('varsayılan `md`: yoğun sınıf YOK', () => {
    render(<Input aria-label="Ara" />);

    expect(screen.getByRole('textbox', { name: 'Ara' })).not.toHaveClass('input--sm');
  });

  it('`DateField` sınıfı takar ve `size`ı sızdırmaz', () => {
    render(<DateField aria-label="Tarih" size="sm" defaultValue="2026-03-01" />);

    const field = screen.getByLabelText('Tarih');

    expect(field).toHaveClass('dateField--sm');
    expect(field).not.toHaveAttribute('size');
  });

  it('`DateRange` ölçüyü İKİ alana da geçirir', () => {
    render(
      <DateRange
        value={{ start: '2026-03-01', end: '2026-03-14' }}
        onChange={noop}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        size="sm"
      />,
    );

    expect(screen.getByLabelText('Başlangıç')).toHaveClass('dateField--sm');
    expect(screen.getByLabelText('Bitiş')).toHaveClass('dateField--sm');
  });

  it('ölçü TEK yerde: `Select`, `Input` ve `DateField` aynı mixin', () => {
    expect(read('src/components/Select/index.module.scss')).toMatch(/@include\s+input-sm;/);
    expect(read('src/components/Input/index.module.scss')).toMatch(/@include\s+input-sm\(true\)/);
    expect(read('src/components/DateField/index.module.scss')).toMatch(
      /@include\s+input-sm\(true\)/,
    );
  });

  it('metin girdisi dar ekranda ve dokunmatikte 16px altına İNMEZ', () => {
    const mixins = read('src/styles/_mixins.scss');
    const block = mixins.slice(mixins.indexOf('@mixin input-sm'));

    expect(block.slice(0, 500)).toMatch(/@include\s+for-mobile[\s\S]*font-size-control/);
    expect(block.slice(0, 500)).toMatch(/@include\s+for-touch[\s\S]*font-size-control/);
  });
});
