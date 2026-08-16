'use client';

import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { CaretDownFill, CheckLg } from 'react-bootstrap-icons';

import useListboxNavigation from '../../hooks/useListboxNavigation';
import usePositioning from '../../hooks/usePositioning';

import { ABOVE_MOBILE_MEDIA_QUERY } from '../../constants/breakpoint.constants';
import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import BottomSheet from '../BottomSheet';

import styles from './index.module.scss';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  isDisabled?: boolean;
};

/** Seçenek listesinin nerede açıldığı. */
type OpenMode = 'popover' | 'sheet';

type Props<T extends string> = {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * Alanın adı. İki işi birden yapar: alt sayfanın başlığı olur ve
   * tetikleyicinin <strong>erişilebilir adı</strong>dır.
   */
  label: string;
  /** Seçim yokken tetikleyicide görünen metin. Verilmezse `labels.selectPlaceholder`. */
  placeholder?: string;
  /** Alt sayfanın kapatma düğmesinin erişilebilir adı. Verilmezse `labels.close`. */
  closeLabel?: string;
  /** Tetikleyicinin solundaki ikon. */
  icon?: ReactNode;
  /** `sm` yoğun şeritler içindir (araç çubuğu); varsayılan form ölçüsü `md`. */
  size?: 'sm' | 'md';
  /** Panelin hangi kenardan hizalanacağı. */
  align?: 'start' | 'end';
  isDisabled?: boolean;
  id?: string;
  /**
   * Zorunluluk — `Field`in `FieldChildProps` sözleşmesinden gelir.
   *
   * ⚠ Bileşen `...rest` YAYMIYOR, yani `Props`ta bildirilmeyen her alan
   * sessizce buharlaşır. `required` bir dönem tam olarak öyleydi: `<Field
   * isRequired>{props => <Select {...props} …/>}</Field>` yazan çağıran
   * görsel `*` ve sr-only "(zorunlu)" alıyor ama KONTROLDE hiçbir işaret
   * olmuyordu — doğrudan kutuya atlayan ekran okuyucu kullanıcısı alanın
   * zorunlu olduğunu hiç duymuyordu. `props` taze bir nesne literali olmadığı
   * için TypeScript'in fazla-özellik denetimi de uyarmıyordu.
   */
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Seçim kutusu. */
const Select = <T extends string>({
  options,
  value,
  onChange,
  label,
  placeholder,
  closeLabel,
  icon,
  size = 'md',
  align = 'start',
  isDisabled,
  id,
  className,
  testId,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
}: Props<T>) => {
  const { labels } = useHanui();
  const emptyText = resolveLabel('Select.placeholder', placeholder, labels?.selectPlaceholder);
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [openMode, setOpenMode] = useState<OpenMode | null>(null);

  /* PANEL SABIT KONUMLU, MUTLAK DEGIL — gerekce SCSS'te (`.panel`). */
  const positioning = usePositioning(triggerRef, panelRef, {
    side: 'bottom',
    align,
    isOpen: openMode === 'popover',
  });

  const isOpen = openMode !== null;
  const selectedIndex = options.findIndex(option => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = useCallback(() => setOpenMode(null), []);

  const open = useCallback(() => {
    if (isDisabled || options.length === 0) return;

    /* Etkin secenek SECILI olandan baslar (kancanin `initialIndex`i);
       kullanici listeyi bastan taramaz. */
    setOpenMode(window.matchMedia(ABOVE_MOBILE_MEDIA_QUERY).matches ? 'popover' : 'sheet');
  }, [isDisabled, options.length]);

  const selectOption = (option: SelectOption<T>) => {
    if (option.isDisabled) return;
    onChange(option.value);
    close();
  };

  /* Kapaninca odak TETIKLEYICIYE doner. */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  /* Disari tiklamada panel kapanir. Alt sayfada bu is perdenin. */
  useEffect(() => {
    if (openMode !== 'popover') return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMode, close]);

  /* KLAVYE MODELI `useListboxNavigation`da — `Combobox`la AYNI kanca. */
  const { activeIndex, setActiveIndex, listRef, handleKeyDown } =
    useListboxNavigation<HTMLUListElement>({
      count: options.length,
      isOpen,
      initialIndex: selectedIndex >= 0 ? selectedIndex : 0,
      onSelect: index => {
        const option = options[index];
        if (option) selectOption(option);
      },
      onClose: close,
    });

  /* Alt sayfada odak listenin kendisine gecer: ok tuslari orada isler. */
  useEffect(() => {
    if (openMode === 'sheet') listRef.current?.focus({ preventScroll: true });
    /* `listRef` kancadan geliyor ve `useRef` kimligi SABIT; bagimlilikta
       olmasi etkiyi yeniden calistirmaz, denetci ise kancadan gelen bir
       degerin referans oldugunu kanitlayamiyor. */
  }, [openMode, listRef]);

  /*
   * KAPALIYKEN ok/Enter/Space paneli ACAR. Bu adim kancada DEGIL: acilma
   * karari bilesenin (panel mi alt sayfa mi) ve kanca yalnizca gezinmeyi
   * tasiyor.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    handleKeyDown(event);
  };

  const renderList = (isSheet: boolean) => (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      /* Alt sayfada baslik `BottomSheet`in icinde ve kimligi bize kapali;
         listenin adi dogrudan yazilir. */
      aria-label={label}
      /* Odak alt sayfada listede, panelde tetikleyicide: etkin seçeneği
         bildiren öznitelik odağın olduğu öğede durmak zorunda. */
      aria-activedescendant={isSheet && options[activeIndex] ? optionId(activeIndex) : undefined}
      tabIndex={isSheet ? 0 : -1}
      className={cx(styles.list, isSheet && styles['list--sheet'])}
      onKeyDown={isSheet ? onKeyDown : undefined}
    >
      {options.map((option, index) => {
        const isChosen = option.value === value;

        return (
          <li
            key={option.value}
            id={optionId(index)}
            role="option"
            data-index={index}
            aria-selected={isChosen}
            aria-disabled={option.isDisabled}
            className={cx(
              styles.option,
              index === activeIndex && styles['option--active'],
              isChosen && styles['option--selected'],
              option.isDisabled && styles['option--disabled'],
            )}
            // Fare imleci seçeneğin üstündeyken etkin seçenek de oraya taşınır;
            // iki ayrı vurgu kullanıcıyı şaşırtıyordu.
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => selectOption(option)}
          >
            <span className={styles.option__label}>{option.label}</span>
            {isChosen && <CheckLg aria-hidden className={styles.option__check} />}
          </li>
        );
      })}
    </ul>
  );

  return (
    <span ref={rootRef} className={cx(styles.select, className)} data-testid={testId}>
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        role="combobox"
        className={cx(
          styles.trigger,
          styles[`trigger--${size}`],
          !selectedOption && styles['trigger--empty'],
          isOpen && styles['trigger--open'],
          isInvalid && styles['trigger--invalid'],
        )}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          openMode === 'popover' && options[activeIndex] ? optionId(activeIndex) : undefined
        }
        /*
         * ⚠ `aria-label` KULLANILMAZ — SECILI DEGERI MASKELIYORDU. Gerekce ve
         * olculen sonuc `Combobox`takiyle birebir ayni: `aria-label` elemanin
         * icerigini ezer, icerik ise tam da secili secenegin etiketi.
         */
        aria-labelledby={selectedOption ? `${baseId}-name ${baseId}-value` : `${baseId}-name`}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        /* Tetikleyici bir `<button>`; yerel `required` yok, karsiligi bu. */
        aria-required={required || undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={onKeyDown}
      >
        {icon && (
          <span className={styles.trigger__icon} aria-hidden>
            {icon}
          </span>
        )}

        {/* Kontrolün adı — yalnızca erişilebilirlik ağacında. */}
        <span id={`${baseId}-name`} className={styles.trigger__srName}>
          {label}
        </span>

        <span id={`${baseId}-value`} className={styles.trigger__value}>
          {selectedOption?.label ?? emptyText}
        </span>

        {/*
         * Ok DOLU CARET: ince chevron, kutunun sag ucunda `$text-2` tonunda
         * iki hairline cizgiye iniyor ve kutunun acilir oldugu uzaktan
         * okunmuyordu. Acikken 180° donuyor — yon hâlâ durumu bildiriyor.
         */}
        <CaretDownFill
          aria-hidden
          className={cx(styles.trigger__chevron, isOpen && styles['trigger__chevron--open'])}
        />
      </button>

      {openMode === 'popover' && (
        <div
          ref={panelRef}
          className={styles.panel}
          style={{
            ...positioning.style,
            /* Panel tetikleyiciyle EN AZ ayni genislikte. */
            minWidth: triggerRef.current?.offsetWidth,
            /* Ilk karede olcu yok; yanlis yerde bir kare parlamasin. */
            visibility: positioning.isPositioned ? undefined : 'hidden',
          }}
        >
          {renderList(false)}
        </div>
      )}

      {/* Dar ekranda liste alt sayfada acilir; panel klavye acilinca sikisiyor
          ve alt ucu ekranin disinda kaliyordu (bkz. `BottomSheet`). */}
      {openMode === 'sheet' && (
        <BottomSheet title={label} closeLabel={closeLabel ?? labels?.close} onClose={close}>
          {renderList(true)}
        </BottomSheet>
      )}
    </span>
  );
};

export default /*#__PURE__*/ memo(Select) as typeof Select;
