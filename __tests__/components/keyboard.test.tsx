import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/Button';
import ChipGroup from '@/components/ChipGroup';
import Combobox, { type ComboboxOption } from '@/components/Combobox';
import Modal from '@/components/Modal';
import RangeSlider from '@/components/RangeSlider';
import RatingInput from '@/components/RatingInput';
import Select, { type SelectOption } from '@/components/Select';
import TableCheckbox from '@/components/TableCheckbox';
import Tabs from '@/components/Tabs';

const OPTIONS: ComboboxOption[] = [
  { value: 'a', label: 'Birinci' },
  { value: 'b', label: 'İkinci' },
  { value: 'c', label: 'Üçüncü' },
];

const SELECT_OPTIONS: SelectOption[] = OPTIONS.map(({ value, label }) => ({ value, label }));

const COMBOBOX_LABELS = {
  placeholder: 'Seçim',
  searchPlaceholder: 'Ara',
  emptyMessage: 'Sonuç yok',
  loadingMessage: 'Aranıyor',
  clearLabel: 'Temizle',
  closeLabel: 'Kapat',
};

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

const activeOptionText = (owner: HTMLElement): string | null => {
  const id = owner.getAttribute('aria-activedescendant');
  return id ? (document.getElementById(id)?.textContent ?? null) : null;
};

describe('Combobox klavye sözleşmesi', () => {
  beforeEach(() => mockViewport(true));

  const open = async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Combobox options={OPTIONS} value={null} onChange={onChange} labels={COMBOBOX_LABELS} />,
    );

    await user.click(screen.getByRole('button', { name: COMBOBOX_LABELS.placeholder }));
    const input = screen.getByRole('combobox', { name: COMBOBOX_LABELS.searchPlaceholder });

    return { user, input, onChange };
  };

  it('`ArrowDown` etkin seçeneği ilerletir, sonda BAŞA döner', async () => {
    const { user, input } = await open();

    expect(activeOptionText(input)).toContain('Birinci');

    await user.keyboard('{ArrowDown}');
    expect(activeOptionText(input)).toContain('İkinci');

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(activeOptionText(input)).toContain('Birinci');
  });

  it('`ArrowUp` başta SONA döner', async () => {
    const { user, input } = await open();

    await user.keyboard('{ArrowUp}');
    expect(activeOptionText(input)).toContain('Üçüncü');
  });

  it('`Home` ilk, `End` son seçeneğe gider', async () => {
    const { user, input } = await open();

    await user.keyboard('{End}');
    expect(activeOptionText(input)).toContain('Üçüncü');

    await user.keyboard('{Home}');
    expect(activeOptionText(input)).toContain('Birinci');
  });

  it('`Enter` ETKİN seçeneği seçer — imlecin durduğu satırı değil', async () => {
    const { user, input, onChange } = await open();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('b');
    expect(input).not.toBeInTheDocument();
  });

  it('`Escape` paneli kapatır ve odağı TETİKLEYİCİYE geri verir', async () => {
    const { user, input } = await open();

    await user.keyboard('{Escape}');

    expect(input).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: COMBOBOX_LABELS.placeholder })).toHaveFocus();
  });

  it('`Tab` paneli kapatır', async () => {
    const { user, input } = await open();

    await user.keyboard('{Tab}');

    expect(input).not.toBeInTheDocument();
  });

  it('yazmak etkin seçeneği BAŞA çeker — eski satır listede kalmıyor', async () => {
    const { user, input } = await open();

    await user.keyboard('{End}');
    await user.type(input, 'i');

    expect(activeOptionText(input)).toContain('Birinci');
  });
});

describe('Select klavye sözleşmesi', () => {
  beforeEach(() => mockViewport(true));

  const setup = () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Select options={SELECT_OPTIONS} value="a" onChange={onChange} label="Sıralama" />);

    /*
     * ⚠ Ad artik REGEX ile araniyor. `Select`/`Combobox` tetikleyicisinin
     * erisilebilir adi bir donem YALNIZCA etiketti (`aria-label`) ve o
     * `aria-label` secili degeri MASKELIYORDU — ekran okuyucu secimi hic
     * duymuyordu. Bugun ARIA APG'nin "select-only combobox" desenine uygun
     * olarak ad `aria-labelledby="etiket deger"` ile kuruluyor, yani
     * "Siralama Fiyat" gibi. Tam esitlik iddiasi eski/hatali bicimi
     * sabitlerdi.
     */
    return { user, onChange, trigger: screen.getByRole('combobox', { name: /Sıralama/ }) };
  };

  it.each(['{ArrowDown}', '{ArrowUp}', '{Enter}', ' '])('`%s` paneli açar', async key => {
    const { user, trigger } = setup();

    trigger.focus();
    await user.keyboard(key);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('etkin seçenek SEÇİLİ olandan başlar — liste baştan taranmaz', async () => {
    const user = userEvent.setup();
    render(<Select options={SELECT_OPTIONS} value="c" onChange={jest.fn()} label="Sıralama" />);

    const trigger = screen.getByRole('combobox', { name: /Sıralama/ });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(activeOptionText(trigger)).toContain('Üçüncü');
  });

  it('ok tuşları uçlarda DÖNER', async () => {
    const { user, trigger } = setup();

    trigger.focus();
    await user.keyboard('{Enter}{ArrowUp}');
    expect(activeOptionText(trigger)).toContain('Üçüncü');

    await user.keyboard('{ArrowDown}');
    expect(activeOptionText(trigger)).toContain('Birinci');
  });

  it('`Home` / `End` uçlara gider', async () => {
    const { user, trigger } = setup();

    trigger.focus();
    await user.keyboard('{Enter}{End}');
    expect(activeOptionText(trigger)).toContain('Üçüncü');

    await user.keyboard('{Home}');
    expect(activeOptionText(trigger)).toContain('Birinci');
  });

  it('`Enter` etkin seçeneği seçer ve kapatır', async () => {
    const { user, onChange, trigger } = setup();

    trigger.focus();
    await user.keyboard('{Enter}{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('b');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('`Escape` seçim YAPMADAN kapatır', async () => {
    const { user, onChange, trigger } = setup();

    trigger.focus();
    await user.keyboard('{Enter}{ArrowDown}{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});

describe('Tabs klavye sözleşmesi', () => {
  const ITEMS = [
    { id: 'a', label: 'Birinci', content: 'A içeriği' },
    { id: 'b', label: 'İkinci', content: 'B içeriği' },
    { id: 'c', label: 'Üçüncü', content: 'C içeriği' },
  ];

  it('`ArrowRight` bir sonraki sekmeyi seçer ve ODAĞI da taşır', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} ariaLabel="Görünüm" />);

    screen.getByRole('tab', { name: 'Birinci' }).focus();
    await user.keyboard('{ArrowRight}');

    const second = screen.getByRole('tab', { name: 'İkinci' });
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('B içeriği');
  });

  it('uçlarda döner: sonuncudan `ArrowRight` ilkine gider', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} defaultTabId="c" ariaLabel="Görünüm" />);

    screen.getByRole('tab', { name: 'Üçüncü' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Birinci' })).toHaveAttribute('aria-selected', 'true');
  });

  it('`ArrowLeft` ilkinden sonuncuya döner', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} ariaLabel="Görünüm" />);

    screen.getByRole('tab', { name: 'Birinci' }).focus();
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Üçüncü' })).toHaveAttribute('aria-selected', 'true');
  });

  it('yalnızca SEÇİLİ sekme sekme sırasında', () => {
    render(<Tabs items={ITEMS} defaultTabId="b" ariaLabel="Görünüm" />);

    expect(screen.getByRole('tab', { name: 'İkinci' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Birinci' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Üçüncü' })).toHaveAttribute('tabindex', '-1');
  });
});

describe('ChipGroup klavye sözleşmesi', () => {
  const OPTIONS_ = [
    { value: 'a', label: 'Birinci' },
    { value: 'b', label: 'İkinci' },
    { value: 'c', label: 'Üçüncü' },
  ];

  it('tek seçimde ok tuşu seçimi taşır ve uçlarda döner', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChipGroup label="Süzgeç" options={OPTIONS_} value="c" onChange={onChange} />);

    screen.getByRole('radio', { name: /Üçüncü/ }).focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('çoklu seçimde ok tuşu seçimi DEĞİŞTİRMEZ', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ChipGroup isMultiple label="Süzgeç" options={OPTIONS_} value={['a']} onChange={onChange} />,
    );

    screen.getAllByRole('button')[0].focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('kip pencere klavye sözleşmesi', () => {
  const cancel = (dialog: HTMLElement) =>
    fireEvent(dialog, new Event('cancel', { cancelable: true }));

  it('Modal: `Escape` kapanışı ÇAĞIRANA bildirir', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen onClose={onClose} title="Başlık" closeLabel="Kapat">
        Gövde
      </Modal>,
    );

    cancel(screen.getByRole('dialog', { hidden: true }));

    expect(onClose).toHaveBeenCalled();
  });

  it('Modal: `isDismissable={false}` iken `Escape` KAPATMAZ', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen onClose={onClose} title="Başlık" isDismissable={false}>
        Gövde
      </Modal>,
    );

    cancel(screen.getByRole('dialog', { hidden: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('BottomSheet: `Escape` kapanışı çağırana bildirir', () => {
    const onClose = jest.fn();
    render(
      <BottomSheet title="Seçim" closeLabel="Kapat" onClose={onClose}>
        Gövde
      </BottomSheet>,
    );

    cancel(screen.getByRole('dialog', { hidden: true }));

    expect(onClose).toHaveBeenCalled();
  });

  it('Modal: odak İLK ANLAMLI öğeye gider, kapatma düğmesine değil', () => {
    render(
      <Modal
        isOpen
        onClose={jest.fn()}
        title="Adresi sil"
        closeLabel="Kapat"
        footer={
          <>
            <Button>Vazgeç</Button>
            <Button>Sil</Button>
          </>
        }
      >
        Gövde
      </Modal>,
    );

    expect(screen.getByRole('button', { name: 'Vazgeç' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Kapat' })).not.toHaveFocus();
  });

  it('Modal: kapanınca odak AÇAN öğeye döner', () => {
    const Harness = ({ isOpen }: { isOpen: boolean }) => (
      <>
        <button type="button">Aç</button>
        <Modal isOpen={isOpen} onClose={jest.fn()} title="Başlık" closeLabel="Kapat">
          Gövde
        </Modal>
      </>
    );

    const { rerender } = render(<Harness isOpen={false} />);
    const opener = screen.getByRole('button', { name: 'Aç' });
    opener.focus();

    rerender(<Harness isOpen />);
    expect(opener).not.toHaveFocus();

    rerender(<Harness isOpen={false} />);
    expect(opener).toHaveFocus();
  });

  it('BottomSheet: odak metin alanına DÜŞMEZ', () => {
    render(
      <BottomSheet title="Seçim" closeLabel="Kapat" onClose={jest.fn()}>
        <input aria-label="Ara" />
      </BottomSheet>,
    );

    expect(screen.getByRole('textbox', { name: 'Ara' })).not.toHaveFocus();
  });
});

describe('RangeSlider klavye sözleşmesi', () => {
  const setup = () => {
    const onChange = jest.fn();
    const onCommit = jest.fn();

    render(
      <RangeSlider
        min={0}
        max={100}
        value={[20, 80]}
        onChange={onChange}
        onCommit={onCommit}
        label="Fiyat"
        minLabel="En az"
        maxLabel="En çok"
      />,
    );

    return {
      onChange,
      onCommit,
      low: screen.getByRole('slider', { name: 'Fiyat — En az' }),
      high: screen.getByRole('slider', { name: 'Fiyat — En çok' }),
    };
  };

  it('kulplar YEREL aralık girdisi — klavye desteği platformdan gelir', () => {
    const { low, high } = setup();

    for (const handle of [low, high]) expect(handle).toHaveAttribute('type', 'range');
  });

  it('alt kulp üst değeri GEÇEMEZ', () => {
    const { low, onChange } = setup();

    fireEvent.change(low, { target: { value: '95' } });

    expect(onChange).toHaveBeenCalledWith([80, 80]);
  });

  it('üst kulp alt değerin ALTINA inemez', () => {
    const { high, onChange } = setup();

    fireEvent.change(high, { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith([20, 20]);
  });

  it('`onCommit` tuş BIRAKILDIĞINDA çalışır, her adımda değil', () => {
    const { low, onCommit } = setup();

    fireEvent.change(low, { target: { value: '30' } });
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.keyUp(low, { key: 'ArrowRight' });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});

describe('RatingInput klavye sözleşmesi', () => {
  const LABELS = {
    ratingLabels: { 1: 'Çok kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Çok iyi' } as const,
    formatStarCount: (star: number) => `${star} yıldız`,
  };

  it('beş GERÇEK radyo, tek grupta', () => {
    render(<RatingInput value={4} onChange={jest.fn()} label="Puan" {...LABELS} />);

    const radios = screen.getAllByRole('radio');

    expect(radios).toHaveLength(5);
    expect(new Set(radios.map(radio => radio.getAttribute('name'))).size).toBe(1);
  });

  it('seçili yıldız `value` ile eşleşir ve adı okunur', () => {
    render(<RatingInput value={4} onChange={jest.fn()} label="Puan" {...LABELS} />);

    expect(screen.getByRole('radio', { name: /4 yıldız — İyi/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /5 yıldız — Çok iyi/ })).not.toBeChecked();
  });

  it('bir yıldız seçmek `onChange`i çağırır', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RatingInput value={null} onChange={onChange} label="Puan" {...LABELS} />);
    await user.click(screen.getByRole('radio', { name: /3 yıldız/ }));

    expect(onChange).toHaveBeenCalledWith(3);
  });
});

describe('TableCheckbox klavye sözleşmesi', () => {
  it('`Space` seçimi değiştirir', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <table>
        <tbody>
          <tr>
            <td>
              <TableCheckbox label="Satırı seç" onChange={onChange} />
            </td>
          </tr>
        </tbody>
      </table>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Satırı seç' });
    checkbox.focus();
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalled();
    expect(checkbox).toBeChecked();
  });
});
