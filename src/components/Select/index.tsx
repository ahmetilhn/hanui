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

import { ABOVE_MOBILE_MEDIA_QUERY } from '../../constants/breakpoint.constants';
import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import { CheckIcon, ChevronDownIcon } from '../../icons';
import BottomSheet from '../BottomSheet';

import styles from './index.module.scss';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  isDisabled?: boolean;
};

/**
 * Seçenek listesinin nerede açıldığı.
 *
 * <p>`popover` tetikleyicinin altında, `sheet` ekranın dibinde. Karar
 * <strong>açılırken</strong> verilir; sunucuda ekran genişliği bilinmediği
 * için ilk boyamada verilecek her karar yanlış olurdu.
 */
type OpenMode = 'popover' | 'sheet';

type Props<T extends string> = {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * Alanın adı. İki işi birden yapar: alt sayfanın başlığı olur ve
   * tetikleyicinin <strong>erişilebilir adı</strong>dır.
   *
   * <p>Tetikleyici bir `<button>` ve düğmenin adı HTML-AAM'e göre
   * `<label>`den GELMEZ — görünür bir etiket olsa bile ekran okuyucu yalnızca
   * seçili değeri okur ("En yeni, düğme") ve neyi seçtiğini söylemez.
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
  /**
   * Panelin hangi kenardan hizalanacağı.
   *
   * <p>Şeridin sağ ucundaki bir tetikleyicide `start` hizalama paneli sağa
   * doğru taşırıyordu; `end` panelin sağ kenarını tetikleyiciye yaslar.
   */
  align?: 'start' | 'end';
  isDisabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Seçim kutusu.
 *
 * <h3>Yerel `<select>` KULLANILMAZ</h3>
 * Yerel açılır liste her tarayıcıda başka türlü çiziliyor, seçeneklerine tek
 * bir stil verilemiyor (seçili değeri işaretlemek, ikon koymak, satırı
 * yükseltmek yok) ve mobilde ekranın ortasında beliren tekerlek uygulamanın
 * geri kalanına hiç benzemiyordu. Kutu baştan sona bizim: masaüstünde
 * tetikleyicinin altında bir panel, mobilde ekranın dibinden yükselen bir
 * <strong>alt sayfa</strong> açar.
 *
 * <p>Bu, "yerel öğe taklit öğeden iyidir" kuralının BİLİNÇLİ tek istisnası:
 * bedeli (odak yönetimi, ok tuşları, `aria-activedescendant`) bir kez ödenip
 * tek bileşene kapatıldı.
 *
 * <h3>Klavye — odak TEK yerde</h3>
 * Panel açıkken odak tetikleyicide kalır, alt sayfada ise listenin kendisine
 * geçer; iki durumda da etkin seçenek `aria-activedescendant` ile bildirilir.
 * Seçenekleri tek tek odaklanabilir yapmak, aynı bileşende iki ayrı klavye
 * modeli demekti (APG: listbox + activedescendant).
 *
 * <h3>20+ seçenek varsa bu bileşen DEĞİL</h3>
 * Aramasız bir liste 20 satırdan sonra taranamaz hâle gelir; orada
 * {@link Combobox} kullanılır.
 */
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
  const listRef = useRef<HTMLUListElement>(null);

  const [openMode, setOpenMode] = useState<OpenMode | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isOpen = openMode !== null;
  const selectedIndex = options.findIndex(option => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = useCallback(() => setOpenMode(null), []);

  const open = useCallback(() => {
    if (isDisabled || options.length === 0) return;

    setOpenMode(window.matchMedia(ABOVE_MOBILE_MEDIA_QUERY).matches ? 'popover' : 'sheet');
    // Etkin seçenek seçili olandan başlar; kullanıcı listeyi baştan taramaz.
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isDisabled, options.length, selectedIndex]);

  const selectOption = (option: SelectOption<T>) => {
    if (option.isDisabled) return;
    onChange(option.value);
    close();
  };

  /*
   * Kapaninca odak TETIKLEYICIYE doner.
   *
   * Odagi `selectOption` icinde geri vermek ise yaramiyor: alt sayfa ayni
   * commit'te DOM'dan kalkiyor ve odaklanan dugme sokulunce odak `<body>`ye
   * dusuyordu — klavye kullanicisi secim yaptiktan sonra sayfanin en basina
   * donuyordu.
   */
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

  /*
   * Alt sayfada odak listenin kendisine gecer: ok tuslari orada isler.
   *
   * `preventScroll` ZORUNLU: odaklanan oge ust katmanda duran sabit bir
   * panelin icinde ve iOS onu "gorunur kilmak" icin sayfayi kaydiriyor —
   * panel oldugu yerde durdugu icin kaydirmanin tek etkisi, arkadaki sayfanin
   * kullanicinin bakmadigi bir yere atlamasiydi.
   */
  useEffect(() => {
    if (openMode === 'sheet') listRef.current?.focus({ preventScroll: true });
  }, [openMode]);

  // Etkin seçenek görünür alanın dışına çıkmamalı.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const lastIndex = options.length - 1;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

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

      case 'Enter':
      case ' ': {
        event.preventDefault();
        const option = options[activeIndex];
        if (option) selectOption(option);
        break;
      }

      case 'Escape':
        event.preventDefault();
        close();
        break;

      case 'Tab':
        // Tab paneli kapatir ama varsayilan gezinme surer.
        close();
        break;

      default:
        break;
    }
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
      onKeyDown={isSheet ? handleKeyDown : undefined}
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
            {isChosen && <CheckIcon className={styles.option__check} />}
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
        )}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          openMode === 'popover' && options[activeIndex] ? optionId(activeIndex) : undefined
        }
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
      >
        {icon && (
          <span className={styles.trigger__icon} aria-hidden>
            {icon}
          </span>
        )}

        <span className={styles.trigger__value}>{selectedOption?.label ?? emptyText}</span>

        <ChevronDownIcon
          className={cx(styles.trigger__chevron, isOpen && styles['trigger__chevron--open'])}
        />
      </button>

      {openMode === 'popover' && (
        <div className={cx(styles.panel, styles[`panel--${align}`])}>{renderList(false)}</div>
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

export default memo(Select) as typeof Select;
