import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Combobox, { type ComboboxOption } from '@/components/Combobox';
import Select from '@/components/Select';

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

describe('Combobox — portallanan panel', () => {
  beforeEach(useDesktopViewport);

  it('panel bileşenin KÖKÜNÜN DIŞINA çizilir', async () => {
    const { container } = render(
      <Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />,
    );

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));

    const listbox = screen.getByRole('listbox');

    expect(listbox).toBeInTheDocument();
    expect(container.firstElementChild?.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it('portallanan panelde seçeneğe tıklamak SEÇER', async () => {
    const onChange = jest.fn();
    render(<Combobox options={OPTIONS} value={null} onChange={onChange} labels={LABELS} />);

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.click(screen.getByRole('option', { name: 'İzmir' }));

    expect(onChange).toHaveBeenCalledWith('izmir');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('arama kutusuna tıklamak paneli KAPATMAZ', async () => {
    render(<Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />);

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    await userEvent.click(screen.getByRole('combobox', { name: LABELS.searchPlaceholder }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('GERÇEKTEN dışarı tıklamak panelı kapatır', async () => {
    render(
      <>
        <button type="button">dışarıdaki düğme</button>
        <Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: LABELS.placeholder }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'dışarıdaki düğme' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('panel kapanınca portal DÜĞÜMÜ de sökülür', async () => {
    render(<Combobox options={OPTIONS} value={null} onChange={jest.fn()} labels={LABELS} />);

    const trigger = screen.getByRole('button', { name: LABELS.placeholder });

    await userEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('Select — portallanan panel', () => {
  beforeEach(useDesktopViewport);

  const SELECT_OPTIONS = [
    { value: 'tr', label: 'Türkiye' },
    { value: 'de', label: 'Almanya' },
  ];

  it('panel bileşenin KÖKÜNÜN DIŞINA çizilir', async () => {
    const { container } = render(
      <Select options={SELECT_OPTIONS} value="tr" onChange={jest.fn()} label="Ülke" />,
    );

    await userEvent.click(screen.getByRole('combobox', { name: /Ülke/ }));

    const listbox = screen.getByRole('listbox');

    expect(container.firstElementChild?.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it('portallanan panelde seçeneğe tıklamak SEÇER', async () => {
    const onChange = jest.fn();
    render(<Select options={SELECT_OPTIONS} value="tr" onChange={onChange} label="Ülke" />);

    await userEvent.click(screen.getByRole('combobox', { name: /Ülke/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Almanya' }));

    expect(onChange).toHaveBeenCalledWith('de');
  });
});
