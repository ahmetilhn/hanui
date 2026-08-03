'use client';

import { type FC, memo, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import { MinusIcon, PlusIcon } from '../../icons';

import styles from './index.module.scss';

type Props = {
  value: number;
  onChange: (value: number) => void;
  /** Grubun ve girdinin erişilebilir adı. Verilmezse `labels.quantity.label`. */
  label?: string;
  /** Verilmezse `labels.quantity.decrease`. */
  decreaseLabel?: string;
  /** Verilmezse `labels.quantity.increase`. */
  increaseLabel?: string;
  min?: number;
  max?: number;
  isDisabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/**
 * Adet seçici.
 *
 * <p>Doğrudan yazma da desteklenir: 12 adet isteyen kullanıcının artı düğmesine
 * on iki kez basması kabul edilemez.
 *
 * <p>Yazılan değer <strong>odak kaybında</strong> sınırlara çekilir, her tuş
 * vuruşunda değil: "12" yazarken "1"i anında 1'e sabitlemek kullanıcının
 * yazmasını engellerdi.
 */
const QuantityStepper: FC<Props> = ({
  value,
  onChange,
  label,
  decreaseLabel,
  increaseLabel,
  min = 1,
  max = 99,
  isDisabled,
  size = 'md',
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const groupLabel = resolveLabel('QuantityStepper.label', label, labels?.quantity?.label);
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (raw: string) => {
    setDraft(null);
    const parsed = Number(raw.replace(/\D/g, ''));
    if (!parsed) return;
    onChange(Math.min(Math.max(parsed, min), max));
  };

  return (
    <div
      className={cx(styles.stepper, styles[`stepper--${size}`], className)}
      role="group"
      aria-label={groupLabel}
      data-testid={testId}
    >
      <button
        type="button"
        className={styles.stepper__button}
        onClick={() => onChange(Math.max(value - 1, min))}
        disabled={isDisabled || value <= min}
        aria-label={resolveLabel(
          'QuantityStepper.decreaseLabel',
          decreaseLabel,
          labels?.quantity?.decrease,
        )}
      >
        <MinusIcon />
      </button>

      <input
        className={styles.stepper__input}
        value={draft ?? String(value)}
        onChange={event => setDraft(event.target.value.replace(/\D/g, '').slice(0, 2))}
        onBlur={event => commit(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit((event.target as HTMLInputElement).value);
          }
        }}
        inputMode="numeric"
        disabled={isDisabled}
        aria-label={`${groupLabel} (${min}-${max})`}
      />

      <button
        type="button"
        className={styles.stepper__button}
        onClick={() => onChange(Math.min(value + 1, max))}
        disabled={isDisabled || value >= max}
        aria-label={resolveLabel(
          'QuantityStepper.increaseLabel',
          increaseLabel,
          labels?.quantity?.increase,
        )}
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default memo(QuantityStepper) as typeof QuantityStepper;
