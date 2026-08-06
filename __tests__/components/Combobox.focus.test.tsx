import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Combobox, { type ComboboxOption } from '@/components/Combobox';

const mockViewport = (isAboveMobile: boolean): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: isAboveMobile,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

const OPTIONS: ComboboxOption[] = [
  { value: 'bmw', label: 'BMW' },
  { value: 'audi', label: 'Audi' },
];

const LABELS = {
  placeholder: 'Marka',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
};

const renderCombobox = () =>
  render(<Combobox options={OPTIONS} value={null} onChange={() => {}} labels={LABELS} />);

describe('Combobox otomatik odak', () => {
  it('dar ekranda alt sayfa açılınca arama kutusu ODAKLANMAZ', async () => {
    mockViewport(false);
    const user = userEvent.setup();
    renderCombobox();

    await user.click(screen.getByRole('button', { name: 'Marka' }));

    const search = screen.getByRole('combobox');

    expect(search).toBeInTheDocument();
    expect(search).not.toHaveFocus();
  });

  it('dar ekranda kullanıcı kutuya kendisi dokununca yazabilir', async () => {
    mockViewport(false);
    const user = userEvent.setup();
    renderCombobox();

    await user.click(screen.getByRole('button', { name: 'Marka' }));
    const search = screen.getByRole('combobox');

    await user.click(search);
    await user.keyboard('BM');

    expect(search).toHaveFocus();
    expect(search).toHaveValue('BM');
  });

  it('masaüstü panelinde arama kutusu odaklanmaya devam eder', async () => {
    mockViewport(true);
    const user = userEvent.setup();
    renderCombobox();

    await user.click(screen.getByRole('button', { name: 'Marka' }));

    expect(screen.getByRole('combobox')).toHaveFocus();
  });
});
