'use client';

import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CaretDownFill, CheckLg, Search, XLg } from 'react-bootstrap-icons';

import { ABOVE_MOBILE_MEDIA_QUERY } from '../../constants/breakpoint.constants';
import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { matchesSearch } from '../../helpers/text.helper';
import { useHanui } from '../../theme/context';
import BottomSheet from '../BottomSheet';
import Spinner from '../Spinner';

import styles from './index.module.scss';

export type ComboboxOption<T extends string = string> = {
  value: T;
  label: string;
  /** İkincil satır: kod, numara, ayırt edici bilgi. */
  description?: string;
  isDisabled?: boolean;
};

/**
 * Bileşenin çizdiği metinler.
 *
 * <p>`placeholder` dışındaki her şey `HanuiProvider labels.combobox`ten de
 * gelebilir; buradaki değer kazanır. `placeholder` ALANI adlandırır
 * ("Şehir seçin", "Marka seçin") ve her çağrı yerinde farklıdır — o yüzden
 * zorunlu kaldı.
 */
export type ComboboxLabels = {
  /** Seçim yokken tetikleyicide ve alt sayfa başlığında görünen metin. */
  placeholder: string;
  /** Arama kutusunun yer tutucusu ve erişilebilir adı. */
  searchPlaceholder?: string;
  /** Liste boşken gösterilen metin. */
  emptyMessage?: string;
  /** Arama sürerken liste yerine gösterilen metin. */
  loadingMessage?: string;
  /** Seçimi kaldıran çarpının erişilebilir adı. */
  clearLabel?: string;
  /** Alt sayfanın kapatma düğmesinin erişilebilir adı. */
  closeLabel?: string;
};

type Props<T extends string> = {
  options: ComboboxOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  labels: ComboboxLabels;
  /**
   * Verilirse arama <strong>sunucuda</strong> yapılır: bileşen listeyi kendisi
   * filtrelemez, yazılanı 300 ms bekleyip buraya bildirir. Verilmezse
   * filtreleme yerelde ve aksan duyarsız yapılır.
   */
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  /** Seçimi kaldıran çarpı düğmesi gösterilir. */
  isClearable?: boolean;
  /**
   * Arama kutusu GİZLENİR.
   *
   * <p>Az sayıda, sabit seçenekli listelerde arama bir işe yaramıyor: altı
   * satırı taramak yazmaktan hızlı ve kutu açılışta odağı çalıp mobilde
   * klavyeyi açıyordu. Ok tuşlarıyla gezinme ve `Escape` yine çalışır.
   */
  isSearchHidden?: boolean;
  /** Tetikleyicinin solundaki ikon. */
  icon?: ReactNode;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Aranabilir seçim kutusu.
 *
 * <h3>Neden yerel `<select>` değil</h3>
 * Yerel açılır liste 20 seçeneğe kadar iyidir. Binlerce seçenekli bir listede
 * kullanıcı harf harf yazarak (ve yalnızca baştan eşleşerek) arıyor, mobilde
 * ise metrelerce süren bir tekerlek çeviriyor. Aranabilir liste, seçeneği
 * <em>yazarak</em> bulmayı mümkün kılar.
 *
 * <h3>Arama kutusu listenin İÇİNDE</h3>
 * Arama alanını listenin dışına koymak kullanıcıya iki ayrı alan gösteriyor
 * ve hangisinin seçimi belirlediği anlaşılmıyordu. Tek tetikleyici, tek
 * panel: masaüstünde panel açılınca odak doğrudan arama kutusuna gider,
 * yazılır, Enter'a basılır. Dar ekranda odak VERİLMEZ — bkz. aşağıdaki not.
 *
 * <h3>Yerel mi sunucu araması mı</h3>
 * `onSearch` verilmezse bileşen elindeki listeyi aksan duyarsız filtreler.
 * Verilirse filtrelemeyi <em>yapmaz</em> — sunucudan gelen liste zaten
 * filtrelenmiştir; ikinci kez filtrelemek sunucunun daha akıllı eşleşmesini
 * (eş anlamlı, kod eşleşmesi) bozardı.
 *
 * <h3>Seçilenin etiketi listeden düşse de korunur</h3>
 * Sunucu aramasında kullanıcı yeni bir arama yaptığında seçili kayıt gelen
 * listede olmayabilir. Etiket son bilinen değerden hatırlanır; aksi hâlde
 * tetikleyici seçim varken yer tutucuya dönüyordu.
 *
 * <h3>Dar ekranda arama kutusu ODAKLANMAZ</h3>
 * Alt sayfa açılırken kutuya odaklanmak ekran klavyesini kullanıcı istemeden
 * açıyordu: panel yarı yüksekliğe sıkışıyor, liste birkaç satıra iniyor ve
 * seçim yapmak için önce klavyeyi kapatmak gerekiyordu. Telefonda liste
 * taranarak kullanılır; yazmak isteyen kutuya kendisi dokunur.
 *
 * <h3>ARIA</h3>
 * Tetikleyici `aria-haspopup="listbox"`, panel içindeki arama alanı
 * `role="combobox"` + `aria-activedescendant`. Masaüstünde odak arama
 * kutusundan ayrılmaz; ok tuşları yalnızca <em>etkin</em> seçeneği değiştirir.
 * Odağı seçeneklere taşımak, yazmaya devam etmeyi imkânsız kılıyordu.
 *
 * <h3>Klavye (APG: combobox with listbox popup)</h3>
 * <table>
 *   <tr><td>`ArrowDown` / `ArrowUp`</td><td>etkin seçenek bir alt/üst; uçlarda DÖNER</td></tr>
 *   <tr><td>`Home` / `End`</td><td>ilk / son seçenek</td></tr>
 *   <tr><td>`Enter`</td><td>etkin seçeneği seçer, paneli kapatır</td></tr>
 *   <tr><td>`Escape`</td><td>kapatır, odak tetikleyiciye döner</td></tr>
 *   <tr><td>`Tab`</td><td>kapatır, gezinme sürer</td></tr>
 *   <tr><td>yazmak</td><td>filtreler ve etkin seçeneği başa çeker</td></tr>
 * </table>
 * Nöbetçi: `components/__tests__/keyboard.test.tsx`.
 */
const Combobox = <T extends string>({
  options,
  value,
  onChange,
  labels,
  isSearchHidden,
  onSearch,
  isLoading,
  isDisabled,
  isClearable,
  icon,
  id,
  className,
  testId,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
}: Props<T>) => {
  const { labels: config } = useHanui();

  /*
   * Metinler TEMBEL cozulur: cizilmeyen bir ogenin metnini istemek yanlis
   * alarm uretiyordu — `isSearchHidden` iken arama kutusu hic yok ama toplu
   * cozumleme yine de "eksik metin" diye uyariyordu.
   */
  const text = {
    get search() {
      return resolveLabel(
        'Combobox.searchPlaceholder',
        labels.searchPlaceholder,
        config?.combobox?.searchPlaceholder,
      );
    },
    get empty() {
      return resolveLabel(
        'Combobox.emptyMessage',
        labels.emptyMessage,
        config?.combobox?.emptyMessage,
      );
    },
    get loading() {
      return resolveLabel(
        'Combobox.loadingMessage',
        labels.loadingMessage,
        config?.combobox?.loadingMessage,
      );
    },
    get clear() {
      return resolveLabel('Combobox.clearLabel', labels.clearLabel, config?.combobox?.clearLabel);
    },
  };

  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listboxId = `${baseId}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /*
   * Panel NEREDE acilir: masaustunde tetikleyicinin altinda, dar ekranda
   * ekranin dibinde bir alt sayfada. Karar ACILIRKEN verilir — sunucuda ekran
   * genisligi bilinmiyor, ilk boyamada verilecek karar yanlis olurdu.
   */
  const [openMode, setOpenMode] = useState<'popover' | 'sheet' | null>(null);
  const isOpen = openMode !== null;
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Sunucu araması sırasında seçili kayıt listeden düşebilir; etiketi
  // hatırlarız ki tetikleyici yer tutucuya dönmesin.
  const [cachedLabel, setCachedLabel] = useState<string | null>(null);

  const visibleOptions = useMemo(() => {
    // Sunucu araması: gelen liste zaten filtrelidir, tekrar filtrelenmez.
    if (onSearch || query.trim() === '') return options;

    const needle = query.trim();
    return options.filter(
      option =>
        matchesSearch(option.label, needle) ||
        (option.description ? matchesSearch(option.description, needle) : false),
    );
  }, [options, query, onSearch]);

  const selectedOption = options.find(option => option.value === value) ?? null;

  useEffect(() => {
    if (selectedOption) setCachedLabel(selectedOption.label);
    else if (value === null) setCachedLabel(null);
  }, [selectedOption, value]);

  const displayLabel = selectedOption?.label ?? cachedLabel;

  /*
   * `onSearch` her render'da yeni bir kapanis olabilir; bagimliliga koymak
   * sonsuz dongu uretir. Referansta tutulup etkiden cikarilir.
   */
  const searchRef = useRef(onSearch);
  searchRef.current = onSearch;

  useEffect(() => {
    if (!isOpen || !searchRef.current) return;

    // Her tuşta istek atmamak için 300 ms beklenir.
    const timer = window.setTimeout(() => searchRef.current?.(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query, isOpen]);

  const close = useCallback(() => {
    setOpenMode(null);
    setQuery('');
  }, []);

  const open = useCallback(() => {
    if (isDisabled) return;
    setOpenMode(window.matchMedia(ABOVE_MOBILE_MEDIA_QUERY).matches ? 'popover' : 'sheet');
    setQuery('');
    // Panel açılınca etkin seçenek seçili olan olur; kullanıcı listeyi baştan
    // taramak zorunda kalmaz.
    const index = options.findIndex(option => option.value === value);
    setActiveIndex(index >= 0 ? index : 0);
  }, [isDisabled, options, value]);

  /*
   * Disari tiklamada kapanir. `mousedown` kullanilir: `click` beklerken
   * kullanici surukleyerek secim yaparsa panel kapanmiyordu.
   *
   * YALNIZCA masaustu panelinde. Alt sayfa govdeye tasindigi icin `rootRef`
   * onu ICERMIYOR: dinleyici acik kalsaydi panelin icindeki her dokunus
   * "disari tiklama" sayilip sayfayi kapatirdi. Orada bu isi perde yapiyor.
   */
  useEffect(() => {
    if (openMode !== 'popover') return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMode, close]);

  /*
   * Odak arama kutusuna YALNIZCA masaustu panelinde verilir.
   *
   * Alt sayfada (dar ekran) odaklamak, kullanici yazmak istemedigi halde
   * ekran klavyesini aciyordu: panel yari yuksekluge sikisiyor, uzun listeden
   * ucu besi goruntude kaliyor ve secim yapmak icin once klavyeyi kapatmak
   * gerekiyordu. Masaustunde ekran klavyesi YOK; oradaki odak yazarak
   * aramanin ve ok tuslariyla gezinmenin tek dayanagi.
   *
   * `preventScroll` duruyor: iOS odaklanan kutuyu gorunur kilmak icin SAYFAYI
   * kaydiriyor ve arkadaki liste baska bir yere atliyordu.
   */
  useEffect(() => {
    if (openMode === 'popover') inputRef.current?.focus({ preventScroll: true });
  }, [openMode]);

  // Etkin seçenek görünür alanın dışına çıkmamalı.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen, visibleOptions.length]);

  const selectOption = (option: ComboboxOption<T>) => {
    if (option.isDisabled) return;
    setCachedLabel(option.label);
    onChange(option.value);
    close();
  };

  /*
   * Kapaninca odak TETIKLEYICIYE doner.
   *
   * Odagi `close()`in hemen ardindan vermek alt sayfada ise yaramiyordu:
   * panel o an hala kipsel ve `showModal()` disaridaki her ogeyi inert
   * birakiyor — `focus()` sessizce hicbir sey yapmiyor, panel kalkinca da
   * odak `<body>`ye dusuyordu. Kullanici secim yaptiktan sonra sayfanin en
   * basina donuyordu.
   */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const lastIndex = visibleOptions.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(current => (current >= lastIndex ? 0 : current + 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(current => (current <= 0 ? lastIndex : current - 1));
        break;

      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;

      case 'Enter': {
        event.preventDefault();
        const option = visibleOptions[activeIndex];
        if (option) selectOption(option);
        break;
      }

      case 'Escape':
        event.preventDefault();
        // Odagi geri vermek kapanisi izleyen etkinin isi (bkz. `wasOpenRef`).
        close();
        break;

      case 'Tab':
        // Tab paneli kapatır ama varsayılan gezinme sürer.
        close();
        break;

      default:
        break;
    }
  };

  const clearSelection = () => {
    onChange(null);
    setCachedLabel(null);
  };

  /*
   * Arama ve liste IKI YERDE ayni: masaustu panelinde ve alt sayfada. Ayri
   * ayri yazilsalardi biri guncellenip digeri unutulurdu.
   */
  const search = isSearchHidden ? null : (
    <div className={styles.combobox__search}>
      <Search aria-hidden className={styles.combobox__searchIcon} />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        className={styles.combobox__searchInput}
        value={query}
        placeholder={text.search}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded
        aria-controls={listboxId}
        aria-activedescendant={
          visibleOptions[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined
        }
        aria-label={text.search}
        onChange={event => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleInputKeyDown}
      />
      {isLoading && <Spinner size="sm" label="" />}
    </div>
  );

  const renderList = (isSheet: boolean) => (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      className={cx(styles.combobox__list, isSheet && styles['combobox__list--sheet'])}
    >
      {visibleOptions.map((option, index) => {
        const isActive = index === activeIndex;
        const isChosen = option.value === value;

        return (
          <li key={option.value}>
            <div
              id={`${baseId}-option-${index}`}
              role="option"
              data-index={index}
              aria-selected={isChosen}
              aria-disabled={option.isDisabled}
              className={cx(
                styles.combobox__option,
                isActive && styles['combobox__option--active'],
                isChosen && styles['combobox__option--selected'],
                option.isDisabled && styles['combobox__option--disabled'],
              )}
              // Fare imleci seçeneğin üstündeyken etkin seçenek de oraya
              // taşınır; iki ayrı vurgu kullanıcıyı şaşırtıyordu.
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(option)}
            >
              <span className={styles.combobox__optionText}>
                <span className={styles.combobox__optionLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.combobox__optionDescription}>{option.description}</span>
                )}
              </span>

              {isChosen && <CheckLg aria-hidden className={styles.combobox__check} />}
            </div>
          </li>
        );
      })}

      {visibleOptions.length === 0 && (
        <li className={styles.combobox__empty}>{isLoading ? text.loading : text.empty}</li>
      )}
    </ul>
  );

  return (
    <div ref={rootRef} className={cx(styles.combobox, className)} data-testid={testId}>
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        className={cx(
          styles.combobox__trigger,
          !displayLabel && styles['combobox__trigger--empty'],
          isOpen && styles['combobox__trigger--open'],
          isInvalid && styles['combobox__trigger--invalid'],
          isClearable && displayLabel && !isDisabled && styles['combobox__trigger--clearable'],
        )}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={labels.placeholder}
        /*
          Hata `aria-invalid` ile DEGIL `aria-describedby` ile duyurulur:
          `aria-invalid`, `role="button"` uzerinde tanimsizdir ve ekran
          okuyucular onu yok sayar. `Field` hata metnini zaten `role="alert"`
          ile bagliyor; buradaki gorev yalnizca gorsel.
        */
        aria-describedby={describedBy}
        onClick={() => (isOpen ? close() : open())}
      >
        {icon && (
          <span className={styles.combobox__leadingIcon} aria-hidden>
            {icon}
          </span>
        )}

        <span className={styles.combobox__value}>{displayLabel ?? labels.placeholder}</span>

        {/* Dolu caret — gerekcesi `Select` ile ayni. */}
        <CaretDownFill
          aria-hidden
          className={cx(styles.combobox__chevron, isOpen && styles['combobox__chevron--open'])}
        />
      </button>

      {/*
        TEMİZLEME DÜĞMESİ TETİKLEYİCİNİN İÇİNDE DEĞİL, KARDEŞİ.

        Önce `<button>`ın içinde `role="button" tabIndex={0}` taşıyan bir
        `<span>` olarak duruyordu; dosyadaki yorum "DOM'da kardeş" diyordu ama
        kod öyle değildi. Eksen taraması bunu `nested-interactive` olarak
        bildirdi ve sonucu somut: iç içe etkileşimli öğede ekran okuyucular
        yalnızca dıştaki düğmeyi duyurur, içteki çarpıya klavyeyle ulaşılsa bile
        adı okunmaz — yani "seçimi temizle" eylemi destek teknolojisi
        kullanıcısı için YOK. Kardeş olarak çizilip tetikleyicinin üzerine
        konumlandırılıyor; görsel yer aynı, ağaçtaki yeri doğru.
      */}
      {isClearable && displayLabel && !isDisabled && (
        <button
          type="button"
          className={styles.combobox__clear}
          aria-label={text.clear}
          onClick={clearSelection}
        >
          <XLg aria-hidden />
        </button>
      )}

      {/* Masaüstü: tetikleyiciye yapışan panel. */}
      {openMode === 'popover' && (
        <div className={styles.combobox__panel}>
          {search}
          {renderList(false)}
        </div>
      )}

      {/*
        Dar ekran: alt sayfa. Yapışkan panel telefonda klavye açılınca sıkışıyor
        ve uzun listenin alt ucu ekranın dışında kalıyordu; arama kutusu da
        tetikleyiciyle klavyenin arasına hapsoluyordu. Arama `toolbar`
        yuvasında: başlığın altında sabit kalır, liste altında kayar.
      */}
      {openMode === 'sheet' && (
        <BottomSheet
          title={labels.placeholder}
          closeLabel={labels.closeLabel ?? config?.close}
          onClose={close}
          toolbar={search ?? undefined}
        >
          {renderList(true)}
        </BottomSheet>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(Combobox) as typeof Combobox;
