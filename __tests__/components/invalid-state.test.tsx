import { render, screen } from '@testing-library/react';

import Combobox from '@/components/Combobox';
import Select from '@/components/Select';

const OPTIONS = [
  { value: '34', label: 'İstanbul' },
  { value: '06', label: 'Ankara' },
];

const LABELS = {
  placeholder: 'İl seçin',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
} as const;

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

/*
 * 6.0: tetikleyici `role="combobox"` — `aria-invalid` bu rolde tanımlı ve YAZILIR. 5.x'te
 * tetikleyici düğmeydi, `aria-invalid` düğmede tanımsız olduğu için yazılmıyordu ve form hatasında
 * ilk hatalı alan bulunamıyordu (handijit.com D-12).
 */
describe('geçersiz durum — Combobox', () => {
  it('tetikleyici `role="combobox"`: `aria-invalid`, `aria-expanded` ve `aria-controls` taşır', () => {
    render(
      <Combobox options={OPTIONS} value={null} onChange={() => {}} labels={LABELS} aria-invalid />,
    );

    const trigger = screen.getByRole('combobox', { name: LABELS.placeholder });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');
    expect(trigger.className).toMatch(/invalid/);
  });

  it('geçerli durumda `aria-invalid` yazılmaz; `required` → `aria-required`', () => {
    render(
      <Combobox options={OPTIONS} value={null} onChange={() => {}} labels={LABELS} required />,
    );

    const trigger = screen.getByRole('combobox', { name: LABELS.placeholder });
    expect(trigger).not.toHaveAttribute('aria-invalid');
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });

  it('arama kutusu metin kutusudur — sayfada tek combobox', async () => {
    render(<Combobox options={OPTIONS} value={null} onChange={() => {}} labels={LABELS} />);

    screen.getByRole('combobox', { name: LABELS.placeholder }).click();

    expect(
      await screen.findByRole('textbox', { name: LABELS.searchPlaceholder }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });
});
