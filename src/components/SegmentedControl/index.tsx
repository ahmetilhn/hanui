'use client';

import { type KeyboardEvent, memo, type ReactNode, useRef } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type SegmentOption<T extends string = string> = {
  value: T;
  label: string;
  /** Yalnızca ikon gösterilecekse `label` erişilebilir ad olarak kalır. */
  icon?: ReactNode;
  isDisabled?: boolean;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Grubun erişilebilir adı ("Görünüm"). ZORUNLU. */
  label: string;
  /** Etiketler gizlenir, yalnızca ikon çizilir. `label` yine okunur. */
  isIconOnly?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/**
 * Bölmeli denetim — <strong>görünüm</strong> değiştirme.
 *
 * <h3>{@link ChipGroup} ile farkı: filtre mi görünüm mü</h3>
 * İkisi de `radiogroup` ve ikisi de tek seçim; ayrım seçilen şeyin ne
 * olduğunda:
 *
 * <ul>
 *   <li>`ChipGroup` bir FİLTRE. Seçim listeyi daraltıyor, seçenek sayısı
 *       değişken ve "hiçbiri" geçerli bir durum — çipe ikinci kez basmak
 *       seçimi kaldırıyor.</li>
 *   <li><b>`SegmentedControl` bir GÖRÜNÜM anahtarı.</b> Liste/ızgara,
 *       aylık/yıllık, gelen/giden. Seçenek sayısı 2-4 ve SABİT; <strong>seçili
 *       durum her zaman tektir</strong> — "hiçbiri" diye bir hâl yok, çünkü
 *       ekranda bir şey çizilmek zorunda.</li>
 * </ul>
 *
 * <p>Bu yüzden seçili öğeye ikinci kez basmak hiçbir şey yapmaz; `ChipGroup`ta
 * aynı hareket seçimi kaldırıyor. Aynı bileşeni iki iş için kullanmak, bu
 * davranış farkını kaybetmek olurdu.
 *
 * <h3>Neden `Tabs` değil</h3>
 * `Tabs` bir PANEL değiştirir ve `aria-controls` ile ona bağlanır; bölmeli
 * denetim aynı içeriğin başka bir SUNUMUNU seçiyor — gösterilen veri aynı.
 * Sekme olarak sunmak ekran okuyucuya var olmayan bir panel vaat ediyordu.
 *
 * <h3>Klavye (APG: radio group)</h3>
 * <table>
 *   <tr><td>`ArrowRight` / `ArrowDown`</td><td>sonraki seçenek; uçlarda DÖNER</td></tr>
 *   <tr><td>`ArrowLeft` / `ArrowUp`</td><td>önceki seçenek</td></tr>
 *   <tr><td>`Tab`</td><td>grubu TEK durak olarak geçer (dönen `tabindex`)</td></tr>
 * </table>
 */
const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  label,
  isIconOnly,
  size = 'md',
  className,
  testId,
}: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;

    if (offset === 0) return;
    event.preventDefault();

    const enabled = options.filter(option => !option.isDisabled);
    if (enabled.length === 0) return;

    const current = enabled.findIndex(option => option.value === value);
    const next = enabled[(current + offset + enabled.length) % enabled.length];

    onChange(next.value);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
      ?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={listRef}
      role="radiogroup"
      aria-label={label}
      className={cx(styles.segmented, styles[`segmented--${size}`], className)}
      data-testid={testId}
      onKeyDown={handleKeyDown}
    >
      {options.map(option => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={isIconOnly ? option.label : undefined}
            data-value={option.value}
            disabled={option.isDisabled}
            /* Donen `tabindex`: grup Tab sirasinda TEK durak. Dort segmentin
               her biri durak olsaydi klavye kullanicisi icerige ulasmak icin
               dort kez Tab'liyordu. */
            tabIndex={isSelected ? 0 : -1}
            className={cx(
              styles.segmented__item,
              isSelected && styles['segmented__item--selected'],
            )}
            /*
             * Secili ogeye ikinci kez basmak HICBIR SEY yapmaz: gorunum
             * anahtarinda "hicbiri" diye bir hal yok. `ChipGroup`ta ayni
             * hareket secimi kaldiriyor ve iki bileseni ayiran sey tam olarak
             * bu.
             */
            onClick={() => !isSelected && onChange(option.value)}
          >
            {option.icon && (
              <span className={styles.segmented__icon} aria-hidden>
                {option.icon}
              </span>
            )}
            {!isIconOnly && <span className={styles.segmented__label}>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(SegmentedControl, 'SegmentedControl'),
) as typeof SegmentedControl;
