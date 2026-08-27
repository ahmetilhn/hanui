import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { HanuiProvider, Select } from '../../src';
import { LABELS } from '../fixtures/labels';

const OPTIONS = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'de', label: 'Almanya' },
  { value: 'fr', label: 'Fransa' },
];

const Harness = ({ initial = '' }: { initial?: string }) => {
  const [value, setValue] = useState(initial);

  return (
    <HanuiProvider labels={LABELS}>
      <Select label="Ülke" options={OPTIONS} value={value} onChange={setValue} />
    </HanuiProvider>
  );
};

describe('Select', () => {
  it('seçim YOKKEN erişilebilir ad YALNIZCA alan adıdır', () => {
    render(<Harness />);

    expect(screen.getByRole('combobox')).toHaveAccessibleName('Ülke');
  });

  it('seçim YAPILINCA ad SEÇİLİ DEĞERİ de taşır', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Almanya' }));

    expect(screen.getByRole('combobox')).toHaveAccessibleName('Ülke Almanya');
  });

  it('seçenek listesi `listbox` → `option` SAHİPLİK zincirini korur', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox'));

    const listbox = screen.getByRole('listbox');
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(OPTIONS.length);
    options.forEach(option => expect(listbox).toContainElement(option));
  });

  it('seçili seçenek `aria-selected` taşır — TEK tane', async () => {
    const user = userEvent.setup();
    render(<Harness initial="fr" />);

    await user.click(screen.getByRole('combobox'));

    const selected = screen.getAllByRole('option', { selected: true });

    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent('Fransa');
  });

  it('seçim uygulanır ve panel KAPANIR', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Fransa' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Fransa');
  });

  it('PASİF durumda açılmaz', async () => {
    const user = userEvent.setup();
    render(
      <HanuiProvider labels={LABELS}>
        <Select label="Ülke" options={OPTIONS} value="" onChange={() => {}} isDisabled />
      </HanuiProvider>,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('`aria-invalid` GEÇERLİ bir rolde taşınır', () => {
    render(
      <HanuiProvider labels={LABELS}>
        <Select label="Ülke" options={OPTIONS} value="" onChange={() => {}} aria-invalid />
      </HanuiProvider>,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
});
