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

/** Bölmeli denetim — <strong>görünüm</strong> değiştirme. */
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
