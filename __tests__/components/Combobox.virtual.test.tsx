import { useEffect, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Combobox from '@/components/Combobox';

const measureLists = (height = 400) =>
  Object.defineProperty(HTMLUListElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => height,
  });

const options = (count: number, withDescription = false) =>
  Array.from({ length: count }, (_, index) => ({
    value: `v${index}`,
    label: `Seçenek ${index}`,
    ...(withDescription ? { description: `Kod ${index}` } : {}),
  }));

const LABELS = {
  placeholder: 'Marka seçin',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
} as const;

const open = () => fireEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));

const renderBox = (list: ReturnType<typeof options>) =>
  render(<Combobox options={list} value={null} onChange={() => {}} labels={LABELS} />);

beforeEach(() => {
  measureLists();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('Combobox — sanallaştırma', () => {
  it('uzun listede yalnızca görünen dilimi çizer', () => {
    renderBox(options(1121));
    open();

    const drawn = screen.getAllByRole('option');

    expect(drawn.length).toBeLessThan(60);
    expect(drawn.length).toBeGreaterThan(0);
  });

  it('`aria-setsize` çizilen sayıyı değil GERÇEK sayıyı bildirir', () => {
    renderBox(options(1121));
    open();

    const [first] = screen.getAllByRole('option');

    expect(first).toHaveAttribute('aria-setsize', '1121');
    expect(first).toHaveAttribute('aria-posinset', '1');
  });

  it('kısa listede tüm seçenekler çizilir', () => {
    renderBox(options(12));
    open();

    expect(screen.getAllByRole('option')).toHaveLength(12);
  });

  it('kısa listede `aria-setsize` YAZILMAZ — tarayıcı zaten doğru sayar', () => {
    renderBox(options(12));
    open();

    expect(screen.getAllByRole('option')[0]).not.toHaveAttribute('aria-setsize');
  });

  it('açıklamalı seçenek varsa sanallaştırma DEVREYE GİRMEZ', () => {
    renderBox(options(200, true));
    open();

    expect(screen.getAllByRole('option')).toHaveLength(200);
  });

  it('süzülüp kısalan liste tam çizilir', () => {
    renderBox(options(1121));
    open();

    fireEvent.change(screen.getByRole('combobox', { name: LABELS.searchPlaceholder }), {
      target: { value: 'Seçenek 100' },
    });

    const drawn = screen.getAllByRole('option');
    expect(drawn.length).toBeLessThan(VIRTUAL_THRESHOLD_GUARD);
    expect(drawn[0]).not.toHaveAttribute('aria-setsize');
  });

  it('mount SONRASI gelen seçenekler açılışta çizilir', () => {
    const Async = () => {
      const [list, setList] = useState<ReturnType<typeof options>>([]);
      useEffect(() => setList(options(12)), []);
      return <Combobox options={list} value={null} onChange={() => {}} labels={LABELS} />;
    };

    render(<Async />);
    open();

    expect(screen.getAllByRole('option')).toHaveLength(12);
  });

  it('mount SONRASI gelen UZUN liste açılışta çizilir', () => {
    const Async = () => {
      const [list, setList] = useState<ReturnType<typeof options>>([]);
      useEffect(() => setList(options(1121)), []);
      return <Combobox options={list} value={null} onChange={() => {}} labels={LABELS} />;
    };

    render(<Async />);
    open();

    const drawn = screen.getAllByRole('option');
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn.length).toBeLessThan(60);
  });
});

const VIRTUAL_THRESHOLD_GUARD = 80;
