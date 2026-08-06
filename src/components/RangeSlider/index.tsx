'use client';

import { memo, useCallback } from 'react';

import { normalize } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

export type RangeValue = [number, number];

type Props = {
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  /** Sürükleme sürerken her adımda çağrılır — ekrandaki değeri günceller. */
  onChange: (value: RangeValue) => void;
  /**
   * Sürükleme <em>bittiğinde</em> çağrılır. Adres çubuğuna yazmak veya
   * sunucuya istek atmak gibi pahalı işler buraya bağlanır.
   */
  onCommit?: (value: RangeValue) => void;
  /** Ham sayıyı okunur metne çevirir ("125000" → "1.250 TL"). */
  formatValue?: (value: number) => string;
  /** Grubun erişilebilir adı ("Fiyat aralığı"). */
  label: string;
  /** Alt kulbun erişilebilir ad eki. Verilmezse `labels.range.min`. */
  minLabel?: string;
  /** Üst kulbun erişilebilir ad eki. Verilmezse `labels.range.max`. */
  maxLabel?: string;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
};

/** Çift kulplu aralık kaydırıcı. */
const RangeSlider = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  onCommit,
  formatValue = String,
  label,
  minLabel,
  maxLabel,
  isDisabled,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const lowName = resolveLabel('RangeSlider.minLabel', minLabel, labels?.range?.min);
  const highName = resolveLabel('RangeSlider.maxLabel', maxLabel, labels?.range?.max);
  const [low, high] = value;

  const handleLowChange = useCallback(
    (raw: number) => onChange([Math.min(raw, high), high]),
    [high, onChange],
  );

  const handleHighChange = useCallback(
    (raw: number) => onChange([low, Math.max(raw, low)]),
    [low, onChange],
  );

  const commit = useCallback(() => onCommit?.([low, high]), [low, high, onCommit]);

  /* `normalize` yuzdeyi verir ve 100'de kirpar; olcek sifir genislikte
     oldugunda (min === max) 0 doner. */
  const span = max - min;
  const lowPercent = span === 0 ? 0 : normalize(low - min, span);
  const highPercent = span === 0 ? 0 : normalize(high - min, span);

  /*
   * Iki kulp ust uste geldiginde hangisinin tutulacagi belirsizlesir. Alt kulp
   * olcegin ikinci yarisindaysa one alinir; aksi halde ust kulp onu kapatip
   * alt kulbu yakalanamaz kiliyordu.
   */
  const isLowOnTop = lowPercent > 50;

  return (
    <div
      className={cx(styles.range, isDisabled && styles['range--disabled'], className)}
      role="group"
      aria-label={label}
      data-testid={testId}
    >
      <div className={styles.range__readout}>
        <span className={styles.range__value}>{formatValue(low)}</span>
        <span className={styles.range__separator} aria-hidden>
          —
        </span>
        <span className={styles.range__value}>{formatValue(high)}</span>
      </div>

      <div className={styles.range__track}>
        {/* Secili aralik: kullanicinin nerede durdugunu tek bakista gosterir. */}
        <span
          className={styles.range__fill}
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
          aria-hidden
        />

        <input
          type="range"
          className={styles.range__input}
          style={{ zIndex: isLowOnTop ? 4 : 3 }}
          min={min}
          max={max}
          step={step}
          value={low}
          disabled={isDisabled}
          aria-label={`${label} — ${lowName}`}
          aria-valuetext={formatValue(low)}
          onChange={event => handleLowChange(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
        />

        <input
          type="range"
          className={styles.range__input}
          style={{ zIndex: isLowOnTop ? 3 : 4 }}
          min={min}
          max={max}
          step={step}
          value={high}
          disabled={isDisabled}
          aria-label={`${label} — ${highName}`}
          aria-valuetext={formatValue(high)}
          onChange={event => handleHighChange(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
        />
      </div>

      {/* Olcegin uclari: kullanici kendi araligini baglama oturtabilmeli. */}
      <div className={styles.range__bounds} aria-hidden>
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default /*#__PURE__*/ memo(RangeSlider) as typeof RangeSlider;
