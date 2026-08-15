import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Combobox, { type ComboboxOption } from '@/components/Combobox';

const LABELS = {
  placeholder: 'Şehir seçin',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
} as const;

const OPTIONS: ComboboxOption[] = [
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'sisli', label: 'Şişli', description: 'IST-34' },
  { value: 'izmir', label: 'İzmir' },
];

const useDesktopViewport = () =>
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

describe('Combobox yerel filtreleme', () => {
  beforeEach(useDesktopViewport);

  it('aksansız yazılan arama aksanlı seçeneği bulur', async () => {
    render(<Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />);

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.type(screen.getByRole('combobox', { name: LABELS.searchPlaceholder }), 'sisli');

    expect(screen.getByText('Şişli')).toBeInTheDocument();
    expect(screen.queryByText('İzmir')).not.toBeInTheDocument();
  });

  it('ikincil satırda da eşleşir', async () => {
    render(<Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />);

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.type(
      screen.getByRole('combobox', { name: LABELS.searchPlaceholder }),
      'IST-34',
    );

    expect(screen.getByText('Şişli')).toBeInTheDocument();
    expect(screen.queryByText('İstanbul')).not.toBeInTheDocument();
  });

  it('sonuç yokken boş mesajı çizilir', async () => {
    render(<Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />);

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.type(
      screen.getByRole('combobox', { name: LABELS.searchPlaceholder }),
      'ankara',
    );

    expect(screen.getByText(LABELS.emptyMessage)).toBeInTheDocument();
  });
});

describe('Combobox sunucu araması', () => {
  beforeEach(useDesktopViewport);

  it('`onSearch` verildiğinde liste YERELDE filtrelenmez', async () => {
    render(
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={jest.fn()}
        labels={LABELS}
        onSearch={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.type(screen.getByRole('combobox', { name: LABELS.searchPlaceholder }), 'zzz');

    expect(screen.getByText('İstanbul')).toBeInTheDocument();
    expect(screen.getByText('Şişli')).toBeInTheDocument();
  });
});

describe('Combobox seçim', () => {
  beforeEach(useDesktopViewport);

  it('seçilen değer tetikleyicide görünür VE erişilebilir adda duyurulur', () => {
    render(<Combobox options={OPTIONS} value="sisli" onChange={jest.fn()} labels={LABELS} />);

    const trigger = screen.getByRole('button', { name: /Şişli/ });

    expect(trigger).toHaveTextContent('Şişli');

    /*
     * ⚠ ASIL İDDİA BU. Eskiden tetikleyici `aria-label={placeholder}` taşıyordu
     * ve `aria-label` elemanın İÇERİĞİNİN yerine geçer — yani bir şehir seçili
     * olsun olmasın ekran okuyucu hep "Şehir seçin, düğme" diyordu ve
     * KULLANICI KENDİ SEÇİMİNİ HİÇ DUYMUYORDU. Bu testin eski hâli
     * `name: LABELS.placeholder` ile sorguladığı için o hatayı SABİTLİYORDU:
     * metin doğruydu, ad yanlıştı, test yeşildi.
     *
     * Bugün ad ARIA APG'nin "select-only combobox" deseniyle kuruluyor —
     * `aria-labelledby="ad değer"` — ve hem etiketi hem seçimi taşıyor.
     */
    expect(trigger).toHaveAccessibleName(expect.stringContaining('Şişli'));
    expect(trigger).toHaveAccessibleName(expect.stringContaining(LABELS.placeholder));
  });

  it('seçim yokken erişilebilir ad YALNIZCA etikettir', () => {
    render(<Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />);

    /*
     * Değer span'i seçim yokken yer tutucuyu taşıyor; ikisini birden bağlamak
     * aynı metni iki kez okuturdu ("Şehir seçin Şehir seçin").
     */
    expect(screen.getByRole('button')).toHaveAccessibleName(LABELS.placeholder);
  });

  it('seçenek tıklanınca `onChange` çağrılır ve panel kapanır', async () => {
    const onChange = jest.fn();
    render(<Combobox options={OPTIONS} value={null} onChange={onChange} labels={LABELS} />);

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.click(screen.getByText('İzmir'));

    expect(onChange).toHaveBeenCalledWith('izmir');
    expect(
      screen.queryByRole('combobox', { name: LABELS.searchPlaceholder }),
    ).not.toBeInTheDocument();
  });

  it('`isSearchHidden` arama kutusunu çizmez', async () => {
    render(
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={jest.fn()}
        labels={LABELS}
        isSearchHidden
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));

    expect(
      screen.queryByRole('combobox', { name: LABELS.searchPlaceholder }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('İstanbul')).toBeInTheDocument();
  });
});
