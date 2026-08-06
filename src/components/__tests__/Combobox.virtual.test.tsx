import { useEffect, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Combobox from '../Combobox';

/** SANALLAŞTIRMA NÖBETÇİSİ. */

/* jsdom düzen yapmıyor: `clientHeight` elle verilir, yoksa kanca ölçüm
   yokken tam listeye düşer ve sanallaştırma hiç sınanmazdı. */
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
  /* `popover` kipi: alt sayfada kaydiran oge liste degil sayfanin govdesi. */
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

  /*
   * EKRAN OKUYUCU GERCEK SAYIYI DUYMALI. Cizilmeyen satirlar yuzunden "16
   * secenekten 3." deniyordu; dogrusu "1121 secenekten 3.". 1121 ogelik bir
   * listede nerede oldugunu bilmeyen kullanici listeyi terk ediyor.
   */
  it('`aria-setsize` çizilen sayıyı değil GERÇEK sayıyı bildirir', () => {
    renderBox(options(1121));
    open();

    const [first] = screen.getAllByRole('option');

    expect(first).toHaveAttribute('aria-setsize', '1121');
    expect(first).toHaveAttribute('aria-posinset', '1');
  });

  /*
   * KISA LISTE SANALLASTIRILMAZ: kirk satirda kazanc yok, yalnizca bir olcum
   * katmani eklenirdi.
   */
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

  /*
   * ACIKLAMALI SECENEK DAHA UZUN. Karisik bir listede tek bir `rowHeight` her
   * satiri yanlis konumlandirirdi: satirlar ust uste biner ya da boslukta
   * durur. Bu durumda liste TAM cizilir — eski davranis.
   */
  it('açıklamalı seçenek varsa sanallaştırma DEVREYE GİRMEZ', () => {
    renderBox(options(200, true));
    open();

    expect(screen.getAllByRole('option')).toHaveLength(200);
  });

  /* Süzme sonrası liste kısalırsa sanallaştırma kendiliğinden düşer. */
  it('süzülüp kısalan liste tam çizilir', () => {
    renderBox(options(1121));
    open();

    fireEvent.change(screen.getByRole('combobox', { name: LABELS.searchPlaceholder }), {
      target: { value: 'Seçenek 100' },
    });

    /* "Seçenek 100" ile başlayan on bir eşleşme (100, 1000-1009). */
    const drawn = screen.getAllByRole('option');
    expect(drawn.length).toBeLessThan(VIRTUAL_THRESHOLD_GUARD);
    expect(drawn[0]).not.toHaveAttribute('aria-setsize');
  });

  /* SECENEKLER SONRADAN GELIYORSA DA CIZILIR */
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

  /* Ayni kirilmanin sanallastirilan hali: uzun liste de bos kalmamali. */
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

/* Esik degistiginde bu testin niyeti de degismeli; sabit burada TEKRAR
   yazilmiyor, yalnizca "esigin altinda kaldi" olculuyor. */
const VIRTUAL_THRESHOLD_GUARD = 80;
