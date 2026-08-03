import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Combobox, { type ComboboxLabels, type ComboboxOption } from '../Combobox';

const LABELS: ComboboxLabels = {
  placeholder: 'Şehir seçin',
  searchPlaceholder: 'Ara…',
  emptyMessage: 'Sonuç bulunamadı',
  loadingMessage: 'Aranıyor…',
  clearLabel: 'Seçimi temizle',
  closeLabel: 'Kapat',
};

const OPTIONS: ComboboxOption[] = [
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'sisli', label: 'Şişli', description: 'IST-34' },
  { value: 'izmir', label: 'İzmir' },
];

/* Panel yalnizca `>640px`te acilir; alt sayfa jsdom'da `<dialog>` saplamasina
   dayaniyor ve testin konusu filtreleme, kabuk degil. */
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

  /*
   * Sunucudan gelen liste ZATEN filtrelenmis; ikinci kez filtrelemek sunucunun
   * daha akilli eslesmesini (es anlamli, kod eslesmesi) bozardi.
   */
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

    /* Hicbiri "zzz" ile eslesmiyor ama liste dokunulmadan duruyor. */
    expect(screen.getByText('İstanbul')).toBeInTheDocument();
    expect(screen.getByText('Şişli')).toBeInTheDocument();
  });
});

describe('Combobox seçim', () => {
  beforeEach(useDesktopViewport);

  it('seçilen değer tetikleyicide görünür', () => {
    render(<Combobox options={OPTIONS} value="sisli" onChange={jest.fn()} labels={LABELS} />);

    expect(screen.getByRole('button', { name: LABELS.placeholder })).toHaveTextContent('Şişli');
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
