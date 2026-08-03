'use client';

import { type KeyboardEvent, memo, type ReactNode, useRef } from 'react';

import { cx } from '../../helpers/class-name.helper';
import Chip, { type ChipSize } from '../Chip';

import styles from './index.module.scss';

export type ChipOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  isDisabled?: boolean;
};

type BaseProps<T extends string> = {
  options: ChipOption<T>[];
  /** Grubun erişilebilir adı ("Sıralama", "Kalite"). */
  label: string;
  size?: ChipSize;
  /** Taşan çipleri alta sarmak yerine yatay kaydırır (mobil filtre şeridi). */
  isScrollable?: boolean;
  className?: string;
};

type SingleProps<T extends string> = BaseProps<T> & {
  isMultiple?: false;
  value: T | null;
  /** Seçili çipe tekrar basılırsa `null` gelir — seçim geri alınabilir. */
  onChange: (value: T | null) => void;
};

type MultipleProps<T extends string> = BaseProps<T> & {
  isMultiple: true;
  value: T[];
  onChange: (value: T[]) => void;
};

type Props<T extends string> = SingleProps<T> | MultipleProps<T>;

/**
 * Çip grubu — açılır liste yerine tek dokunuşla seçim.
 *
 * <h3>Ne zaman çip grubu, ne zaman açılır liste</h3>
 * Seçenek sayısı azsa (kabaca 7'ye kadar) ve seçenekler ekranda durabiliyorsa
 * çip grubu kullanılır: kullanıcı listeyi <em>açmadan</em> hem seçenekleri hem
 * de hangisinin seçili olduğunu görür — açılır listede bu bilgi iki tıklama
 * arkasındadır. 5–20 seçenek için {@link Select}, 20+ için {@link Combobox}.
 *
 * <h3>Tek seçim radyo grubudur</h3>
 * Tek seçimli grup `role="radiogroup"` alır ve çipler `role="radio"` olur.
 * Görsel olarak radyo düğmesi gibi durmasalar da davranış aynıdır; ekran
 * okuyucu "3 seçenekten 2.'si" diye okur. Yalnız `aria-pressed` kullanmak,
 * seçeneklerin birbirini dışladığı bilgisini kaybettiriyordu.
 *
 * <h3>Gezinme tabindex'i dolaşır (roving tabindex)</h3>
 * Radyo grubunda Tab tuşu <strong>gruba</strong> girer, seçenekler arasında ok
 * tuşlarıyla gezilir. Her çipin ayrı ayrı Tab durağı olması, 7 seçenekli bir
 * filtrede klavye kullanıcısını 7 kez Tab'lamaya zorluyordu.
 */
const ChipGroup = <T extends string>({
  options,
  label,
  size = 'md',
  isScrollable,
  className,
  ...selection
}: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const isSelected = (value: T) =>
    selection.isMultiple ? selection.value.includes(value) : selection.value === value;

  const handleSelect = (value: T) => {
    if (selection.isMultiple) {
      const next = selection.value.includes(value)
        ? selection.value.filter(item => item !== value)
        : [...selection.value, value];
      selection.onChange(next);
      return;
    }

    // Seçili çipe tekrar basmak seçimi kaldırır: "hepsi" seçeneği olmayan
    // filtrelerde kullanıcının geri dönebileceği tek yol bu.
    selection.onChange(selection.value === value ? null : value);
  };

  /** Ok tuşlarıyla gezinme; başta/sonda döner (yalnızca tek seçimde). */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (selection.isMultiple) return;

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

    const currentIndex = enabled.findIndex(option => option.value === selection.value);
    const next = enabled[(currentIndex + offset + enabled.length) % enabled.length];

    selection.onChange(next.value);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-chip-value="${next.value}"]`)?.focus();
  };

  // Roving tabindex: seçili çip tabbable; hiçbiri seçili değilse ilki.
  const tabbableValue = selection.isMultiple
    ? null
    : (selection.value ?? options.find(option => !option.isDisabled)?.value ?? null);

  return (
    <div
      ref={listRef}
      className={cx(styles.group, isScrollable && styles['group--scrollable'], className)}
      role={selection.isMultiple ? 'group' : 'radiogroup'}
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {options.map(option => (
        <Chip
          key={option.value}
          size={size}
          icon={option.icon}
          count={option.count}
          isSelected={isSelected(option.value)}
          disabled={option.isDisabled}
          role={selection.isMultiple ? undefined : 'radio'}
          tabIndex={selection.isMultiple || option.value === tabbableValue ? 0 : -1}
          data-chip-value={option.value}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
};

export default memo(ChipGroup) as typeof ChipGroup;
