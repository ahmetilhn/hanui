import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BottomSheet from '../BottomSheet';
import Button from '../Button';
import ChipGroup from '../ChipGroup';
import Combobox, { type ComboboxOption } from '../Combobox';
import Modal from '../Modal';
import RangeSlider from '../RangeSlider';
import RatingInput from '../RatingInput';
import Select, { type SelectOption } from '../Select';
import TableCheckbox from '../TableCheckbox';
import Tabs from '../Tabs';

/**
 * KLAVYE SÖZLEŞMESİ — WAI-ARIA APG desenlerine göre.
 *
 * <h3>Neden ayrı bir dosya, neden bileşen testlerinin içinde değil</h3>
 * Klavye davranışı bir bileşenin en kolay BOZULAN ve en zor fark edilen
 * yanı: fare ile her şey çalışmaya devam ettiği için gözden kaçar, ve
 * `Escape`in kapatmayı bıraktığı bir kip pencere hiçbir görsel iz bırakmaz.
 * Tuş matrisleri bir arada durduğunda iki bileşen arasındaki AYRIŞMA da
 * görünür oluyor — `Select` ile `Combobox`ın ok tuşu davranışı bugün kopya
 * kod ve tam bu yüzden ayrışmaya açık.
 *
 * <h3>Tarayıcının işi TEST EDİLMEZ</h3>
 * Yerel öğeye devredilen davranış (radyo grubunda ok tuşları,
 * `<input type="range">`te `Home`/`End`) jsdom'da zaten YOK: onu test etmek
 * jsdom'un eksiğini ölçmek olurdu. Bu deseni kullanan bileşenlerde ölçülen
 * şey DEVRİN KENDİSİ — gerçekten yerel öğe mi kullanılıyor, grup adı tek mi,
 * erişilebilir ad yerinde mi. Taklit öğeye dönen bir refactor testi kırar.
 */

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

/** `matches: true` → masaüstü paneli; `false` → alt sayfa. */
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

/** Etkin seçeneğin metni — `aria-activedescendant` hangi satırı işaret ediyor. */
const activeOptionText = (owner: HTMLElement): string | null => {
  const id = owner.getAttribute('aria-activedescendant');
  return id ? (document.getElementById(id)?.textContent ?? null) : null;
};

/**
 * `Combobox` — APG "combobox with listbox popup".
 *
 * | Tuş | Davranış |
 * |---|---|
 * | `ArrowDown` / `ArrowUp` | etkin seçenek bir alt/üst; uçlarda DÖNER |
 * | `Home` / `End` | ilk / son seçenek |
 * | `Enter` | etkin seçeneği seçer ve paneli kapatır |
 * | `Escape` | paneli kapatır, odak tetikleyiciye döner |
 * | `Tab` | paneli kapatır, gezinme sürer |
 */
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

  /*
   * Odagin tetikleyiciye donmesi kapanisi IZLEYEN etkinin isi: `close()`in
   * hemen ardindan `focus()` cagirmak alt sayfada sessizce hicbir sey
   * yapmiyordu (panel hala kipsel, disarisi inert) ve kullanici secimden sonra
   * sayfanin en basina donuyordu.
   */
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

/**
 * `Select` — APG "listbox" + `aria-activedescendant`.
 *
 * | Tuş | Davranış |
 * |---|---|
 * | `ArrowDown` / `ArrowUp` / `Enter` / `Space` (kapalıyken) | paneli açar |
 * | `ArrowDown` / `ArrowUp` | etkin seçenek bir alt/üst; uçlarda DÖNER |
 * | `Home` / `End` | ilk / son seçenek |
 * | `Enter` / `Space` | etkin seçeneği seçer |
 * | `Escape` | kapatır, odak tetikleyicide kalır |
 * | `Tab` | kapatır, gezinme sürer |
 *
 * <p>Odak panel açıkken de TETİKLEYİCİDE kalır (alt sayfada listenin
 * kendisinde): iki ayrı klavye modeli olmasın diye seçenekler tek tek
 * odaklanabilir değil.
 */
describe('Select klavye sözleşmesi', () => {
  beforeEach(() => mockViewport(true));

  const setup = () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Select options={SELECT_OPTIONS} value="a" onChange={onChange} label="Sıralama" />);

    return { user, onChange, trigger: screen.getByRole('combobox', { name: 'Sıralama' }) };
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

    const trigger = screen.getByRole('combobox', { name: 'Sıralama' });
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

/**
 * `Tabs` — APG "tabs with automatic activation".
 *
 * | Tuş | Davranış |
 * |---|---|
 * | `ArrowRight` / `ArrowLeft` | bir sonraki / önceki sekme; uçlarda DÖNER |
 * | `Tab` | sekme çubuğundan panele çıkar (dönen `tabindex`) |
 *
 * <p>Etkinleştirme OTOMATİK: ok tuşu odakla birlikte seçimi de taşır. Panel
 * içeriği hazır ve ucuz olduğu sürece APG'nin önerdiği budur; manuel
 * etkinleştirme (`Enter` ile seçme) pahalı panellerde gerekir ve o seçenek
 * henüz yok.
 */
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

  /*
   * Donen `tabindex`: sekme cubugu Tab sirasinda TEK durak. Her sekme
   * odaklanabilir olsaydi on sekmeli bir cubukta klavye kullanicisi icerige
   * ulasmak icin on kez Tab'a basiyordu.
   */
  it('yalnızca SEÇİLİ sekme sekme sırasında', () => {
    render(<Tabs items={ITEMS} defaultTabId="b" ariaLabel="Görünüm" />);

    expect(screen.getByRole('tab', { name: 'İkinci' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Birinci' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Üçüncü' })).toHaveAttribute('tabindex', '-1');
  });
});

/**
 * `ChipGroup` (tek seçim) — APG "radio group".
 *
 * | Tuş | Davranış |
 * |---|---|
 * | `ArrowRight` / `ArrowDown` | bir sonraki seçenek; uçlarda DÖNER |
 * | `ArrowLeft` / `ArrowUp` | bir önceki seçenek |
 *
 * <p>Çoklu seçimde ok tuşu YOK: orada her cip bağımsız bir onay kutusu ve
 * `Tab` ile gezilir — ok tuşuyla gezmek seçimi de değiştirirdi.
 */
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

/**
 * `Modal` / `BottomSheet` — yerel `<dialog>` + `showModal()`.
 *
 * | Tuş | Davranış |
 * |---|---|
 * | `Escape` | kapatır (`isDismissable={false}` iken KAPATMAZ) |
 * | `Tab` | odak panelin içinde döner (tarayıcı: `showModal()`) |
 *
 * <p>Odak tuzağı ve arka planın etkileşime kapanması TARAYICIDAN gelir; bu
 * yüzden burada ölçülen şey `<dialog>` kullanımının kendisi ve `cancel`
 * olayının React durumuna bağlanması. `cancel` yakalanmadığında pencere
 * kapanıyor ama `isOpen` `true` kalıyor ve bir daha açılamıyordu.
 */
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

  /*
   * ODAK KAPATMA DUGMESINE GITMEZ.
   *
   * `showModal()` odagi DOM sirasindaki ilk odaklanabilir ogeye tasiyor ve o
   * neredeyse her zaman basliktaki carpi: ekran okuyucu pencereyi "Kapat,
   * dugme" diye aciyordu — kullanicinin duydugu ilk sey, pencerenin ne oldugu
   * degil ondan nasil kacilacagi.
   */
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

  /*
   * Odak, pencereyi ACAN ogeye doner. Donmezse `<body>`ye duser ve klavye
   * kullanicisi sayfanin en basina gider — yirmi kez Tab'ladigi bir listede
   * secim yapan kullanici, secimden sonra yeniden yirmi kez Tab'liyordu.
   */
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

  /*
   * `showModal()` odagi panelin ILK odaklanabilir ogesine tasiyor. O oge bir
   * metin alani oldugunda telefonda ekran klavyesi kullanici istemeden
   * aciliyor, panel yari yukseklige sikisiyordu (bkz. `helpers/focus.helper`).
   */
  it('BottomSheet: odak metin alanına DÜŞMEZ', () => {
    render(
      <BottomSheet title="Seçim" closeLabel="Kapat" onClose={jest.fn()}>
        <input aria-label="Ara" />
      </BottomSheet>,
    );

    expect(screen.getByRole('textbox', { name: 'Ara' })).not.toHaveFocus();
  });
});

/**
 * `RangeSlider` — iki yerel `<input type="range">`.
 *
 * | Tuş | Davranış (tarayıcıdan) |
 * |---|---|
 * | `ArrowRight` / `ArrowUp` | bir adım artırır |
 * | `ArrowLeft` / `ArrowDown` | bir adım azaltır |
 * | `Home` / `End` | ölçeğin ucuna gider |
 * | `PageUp` / `PageDown` | büyük adım |
 *
 * <p>Yukarıdakiler yerel öğeden gelir ve jsdom'da yok. Burada ölçülen iki şey
 * KÜTÜPHANEYE ait: kulpların birbirini geçmemesi ve pahalı işin (`onCommit`)
 * tuş BIRAKILDIĞINDA çalışması.
 */
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

  /*
   * Kaydirirken her adimda adres cubuguna yazmak, tek surukleme icin onlarca
   * gezinme kaydi birakip geri tusunu kullanilamaz hale getiriyordu.
   */
  it('`onCommit` tuş BIRAKILDIĞINDA çalışır, her adımda değil', () => {
    const { low, onCommit } = setup();

    fireEvent.change(low, { target: { value: '30' } });
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.keyUp(low, { key: 'ArrowRight' });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});

/**
 * `RatingInput` — beş yerel `<input type="radio">`.
 *
 * | Tuş | Davranış (tarayıcıdan) |
 * |---|---|
 * | `ArrowRight` / `ArrowDown` | bir sonraki yıldız |
 * | `ArrowLeft` / `ArrowUp` | bir önceki yıldız |
 * | `Tab` | grubu tek durak olarak geçer |
 *
 * <p>Ok tuşu gezinmesi RADYO GRUBUNUN kendisinden gelir ve jsdom onu
 * uygulamıyor. Ölçülen şey devrin geçerliliği: beş gerçek radyo, TEK grup adı
 * ve her birinin okunabilir bir adı. Yıldızlar `<span>`e dönerse test kırılır.
 */
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

/**
 * `TableCheckbox` — satır seçimi.
 *
 * | Tuş | Davranış |
 * |---|---|
 * | `Space` | seçimi değiştirir (yerel onay kutusu) |
 *
 * <p>Kutu yerel: `Space`, `indeterminate` durumu ve form gönderimine katılma
 * platformdan geliyor. Erişilebilir ad ZORUNLU — bir tabloda on beş kutu
 * "onay kutusu" diye okunduğunda hangisinin hangi satır olduğu kayboluyordu.
 */
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
