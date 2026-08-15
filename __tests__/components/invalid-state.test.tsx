import { render, screen } from '@testing-library/react';

import Combobox from '@/components/Combobox';
import Select from '@/components/Select';

const OPTIONS = [
  { value: '34', label: 'İstanbul' },
  { value: '06', label: 'Ankara' },
];

/** `Combobox` metinleri ZORUNLU — kütüphane sabit Türkçe dize taşımıyor. */
const LABELS = {
  placeholder: 'İl seçin',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
} as const;

/**
 * HATA DURUMU İKİ KATMANDA DA TAŞINIR.
 *
 * ⚠ Ölçülen asimetri — iki bileşen aynı durumu **ters yarım** olarak
 * uyguluyordu:
 *
 * | bileşen | görsel | duyuru |
 * |---|---|---|
 * | `Combobox` (düğme tetikleyici) | ✓ `--invalid` | `aria-describedby` |
 * | `Select` | **YOK** | ✓ `aria-invalid` |
 *
 * Yani `Select`te ekran okuyucu "geçersiz" diyor, göz gören kullanıcı hiçbir
 * şey görmüyordu.
 *
 * ⚠ `Combobox`ın düğme tetikleyicisinde `aria-invalid` KULLANILMAMASI bir
 * kusur DEĞİL, gerekçeli bir karar: öznitelik `role="button"` üzerinde
 * tanımsızdır ve ekran okuyucular onu yok sayar. Hata metnini `Field` zaten
 * `role="alert"` ile bağlıyor. `Select` ise `role="combobox"` taşıyor —
 * orada `aria-invalid` GEÇERLİ.
 */
describe('geçersiz durum — Select', () => {
  it('`aria-invalid` yazılır — role="combobox" üzerinde geçerli', () => {
    render(<Select label="İl" options={OPTIONS} value="" onChange={() => {}} aria-invalid />);

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('GÖRSEL hata sınıfı da uygulanır — duyuru tek başına yetmez', () => {
    render(<Select label="İl" options={OPTIONS} value="" onChange={() => {}} aria-invalid />);

    expect(screen.getByRole('combobox').className).toMatch(/invalid/);
  });

  it('geçerli durumda hiçbiri yazılmaz', () => {
    render(<Select label="İl" options={OPTIONS} value="" onChange={() => {}} />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toHaveAttribute('aria-invalid', 'true');
    expect(trigger.className).not.toMatch(/invalid/);
  });
});

describe('geçersiz durum — Combobox', () => {
  it('GÖRSEL hata sınıfı uygulanır', () => {
    render(
      <Combobox options={OPTIONS} value={null} onChange={() => {}} labels={LABELS} aria-invalid />,
    );

    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/invalid/);
  });

  it('düğme tetikleyicide `aria-invalid` YAZILMAZ — kararı koruyan iddia', () => {
    render(
      <Combobox options={OPTIONS} value={null} onChange={() => {}} labels={LABELS} aria-invalid />,
    );

    /*
     * ⚠ Bu iddia bir kusuru değil bir KARARI koruyor: `aria-invalid`
     * `role="button"` üzerinde tanımsız ve ekran okuyucular onu yok sayar.
     * "Simetri olsun" diye eklemek, çalışmayan bir öznitelikle uyumlu
     * görünmek olurdu.
     */
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-invalid');
  });
});
