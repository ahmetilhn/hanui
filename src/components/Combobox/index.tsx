'use client';

import {
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
import useListboxNavigation from '../../hooks/useListboxNavigation';
import usePositioning from '../../hooks/usePositioning';
import useVirtualList from '../../hooks/useVirtualList';
import { useHanui } from '../../theme/context';
import BottomSheet from '../BottomSheet';
import Spinner from '../Spinner';

import styles from './index.module.scss';

/** Sanallaştırmanın devreye girdiği eşik. */
const VIRTUAL_THRESHOLD = 80;

/** Seçenek satırının yüksekliği (`--sheet` dışında). */
const OPTION_HEIGHT = 40;

export type ComboboxOption<T extends string = string> = {
  value: T;
  label: string;
  /** İkincil satır: kod, numara, ayırt edici bilgi. */
  description?: string;
  isDisabled?: boolean;
};

/** Bileşenin çizdiği metinler. */
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
  /** Arama kutusu GİZLENİR. */
  isSearchHidden?: boolean;
  /** Tetikleyicinin solundaki ikon. */
  icon?: ReactNode;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Aranabilir seçim kutusu. */
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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * Panel NEREDE acilir: masaustunde tetikleyicinin altinda, dar ekranda
   * ekranin dibinde bir alt sayfada. Karar ACILIRKEN verilir — sunucuda ekran
   * genisligi bilinmiyor, ilk boyamada verilecek karar yanlis olurdu.
   */
  const [openMode, setOpenMode] = useState<'popover' | 'sheet' | null>(null);
  const isOpen = openMode !== null;
  const [query, setQuery] = useState('');

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
    /* Panel acilinca etkin secenek SECILI olan olur (kancanin `initialIndex`i);
       kullanici listeyi bastan taramak zorunda kalmaz. */
    setQuery('');
  }, [isDisabled]);

  /*
   * Disari tiklamada kapanir. `mousedown` kullanilir: `click` beklerken
   * kullanici surukleyerek secim yaparsa panel kapanmiyordu.
   */
  useEffect(() => {
    if (openMode !== 'popover') return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMode, close]);

  /* Odak arama kutusuna YALNIZCA masaustu panelinde verilir. */
  useEffect(() => {
    if (openMode === 'popover') inputRef.current?.focus({ preventScroll: true });
  }, [openMode]);

  const selectOption = (option: ComboboxOption<T>) => {
    if (option.isDisabled) return;
    setCachedLabel(option.label);
    onChange(option.value);
    close();
  };

  /* Kapaninca odak TETIKLEYICIYE doner. */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  /* KLAVYE MODELI `useListboxNavigation`da — `Select`le AYNI kanca. */
  /* PANEL SABIT KONUMLU, MUTLAK DEGIL */
  const positioning = usePositioning(triggerRef, panelRef, {
    side: 'bottom',
    align: 'start',
    isOpen: isOpen && openMode === 'popover',
  });

  const { activeIndex, setActiveIndex, listRef, handleKeyDown } =
    useListboxNavigation<HTMLUListElement>({
      count: visibleOptions.length,
      isOpen,
      initialIndex: Math.max(
        options.findIndex(option => option.value === value),
        0,
      ),
      onSelect: index => {
        const option = visibleOptions[index];
        if (option) selectOption(option);
      },
      /* Odagi geri vermek kapanisi izleyen etkinin isi (bkz. `wasOpenRef`). */
      onClose: close,
    });

  /* SANALLASTIRMA — ve UC kosulu birden. */
  const hasDescriptions = visibleOptions.some(option => Boolean(option.description));
  const isVirtual =
    openMode === 'popover' && !hasDescriptions && visibleOptions.length > VIRTUAL_THRESHOLD;

  const { scrollRef, range, scrollToIndex } = useVirtualList(visibleOptions.length, {
    rowHeight: OPTION_HEIGHT,
    isEnabled: isVirtual,
  });

  /*
   * Etkin secenek CIZILMEMIS olabilir: `scrollIntoView` o satirda calismaz.
   * Konum once hesaplanir, satir sonra cizilir.
   */
  useEffect(() => {
    if (isVirtual) scrollToIndex(activeIndex);
  }, [activeIndex, isVirtual, scrollToIndex]);

  /* Iki kanca da AYNI `<ul>`e baglanir: biri etkin secenegi gorunur tutuyor,
     digeri kaydirmayi olcuyor. */
  const attachList = (node: HTMLUListElement | null) => {
    listRef.current = node;
    scrollRef.current = node;
  };

  const handleInputKeyDown = handleKeyDown;

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

  const renderList = (isSheet: boolean) => {
    /*
     * Cizilen dilim. Sanallastirma kapaliyken aralik tum listeyi kapsiyor
     * (`useVirtualList` olcum yoksa tam listeye duser), yani burada ayri bir
     * kosula gerek yok.
     */
    const slice = visibleOptions.slice(range.start, range.end);

    return (
      <ul
        ref={attachList}
        id={listboxId}
        role="listbox"
        className={cx(styles.combobox__list, isSheet && styles['combobox__list--sheet'])}
      >
        {/*
        Kaydirma cubugu GERCEK boyda olmali: cizilmeyen satirlarin yeri
        korunmazsa 1121 ogelik bir liste 16 satirlik bir cubuk gosterir ve
        kullanici listenin bittigini sanardi. Yukseklik ust ve alt bosluklara
        boluniyor — tek bir mutlak konumlu kutu kullanmak `<ul>`in cocuk
        sozlesmesini bozardi (`role="listbox"` yalnizca `option` bekler).
      */}
        {isVirtual && range.offset > 0 && <li aria-hidden style={{ height: range.offset }} />}

        {slice.map((option, sliceIndex) => {
          const index = range.start + sliceIndex;
          const isActive = index === activeIndex;
          const isChosen = option.value === value;

          return (
            <li key={option.value}>
              <div
                id={`${baseId}-option-${index}`}
                role="option"
                data-index={index}
                /*
                 * EKRAN OKUYUCU GERCEK SAYIYI DUYMALI. Cizilmeyen satirlar
                 * yuzunden "16 secenekten 3." deniyordu; dogrusu "1121
                 * secenekten 3.". Ikisi de yalnizca sanallastirma acikken
                 * yazilir — tam cizilen listede tarayici zaten dogru sayiyor ve
                 * elle yazmak iki kaynak demek olurdu.
                 */
                aria-setsize={isVirtual ? visibleOptions.length : undefined}
                aria-posinset={isVirtual ? index + 1 : undefined}
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

        {isVirtual && range.end < visibleOptions.length && (
          <li aria-hidden style={{ height: (visibleOptions.length - range.end) * OPTION_HEIGHT }} />
        )}

        {visibleOptions.length === 0 && (
          <li className={styles.combobox__empty}>{isLoading ? text.loading : text.empty}</li>
        )}
      </ul>
    );
  };

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
         * Hata `aria-invalid` ile DEGIL `aria-describedby` ile duyurulur:
         * `aria-invalid`, `role="button"` uzerinde tanimsizdir ve ekran
         * okuyucular onu yok sayar. `Field` hata metnini zaten `role="alert"`
         * ile bagliyor; buradaki gorev yalnizca gorsel.
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
        <div
          ref={panelRef}
          className={styles.combobox__panel}
          style={{
            ...positioning.style,
            /* Panel tetikleyiciyle AYNI genislikte: sabit konum onu
               kapsayicidan kopardigi icin genislik artik miras alinmiyor. */
            width: triggerRef.current?.offsetWidth,
            /* Ilk karede olcu yok; yanlis yerde bir kare parlamasin. */
            visibility: positioning.isPositioned ? undefined : 'hidden',
          }}
        >
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
