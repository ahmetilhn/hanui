'use client';

import { type FC, memo, useState } from 'react';

import { DashLg, PlusLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

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

/** Adet seçici. */
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

  const clamp = (next: number) => Math.min(Math.max(next, min), max);

  const commit = (raw: string) => {
    setDraft(null);

    /*
     * ⚠ BOSLUK KONTROLU HAM DIZEDEN yapilir, sayidan DEGIL.
     *
     * Onceki bicim `if (!parsed) return;` diyordu ve `0` falsy: `min={0}` ile
     * kurulmus bir alanda (stok duzeltme formu) kullanici `0` yazip alandan
     * ciktiginda deger sessizce eski haline sicriyor, `onChange` hic
     * atesienmiyordu. Tek bir kontrol iki ayri soruyu cevapliyordu — "kutu bos
     * mu" ve "deger sifir mi".
     */
    const digits = raw.replace(/\D/g, '');
    if (digits === '') return;

    onChange(clamp(Number(digits)));
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
        <DashLg aria-hidden />
      </button>

      <input
        className={styles.stepper__input}
        value={draft ?? String(value)}
        onChange={event => setDraft(event.target.value.replace(/\D/g, '').slice(0, 2))}
        onBlur={event => commit(event.target.value)}
        /*
         * ⚠ `spinbutton` ROLU BIR SOZ VERIR: Yukari/Asagi ok, PageUp/PageDown
         * ve Home/End degeri degistirir. Onceki hal yalnizca `Enter`
         * isliyordu, yani ekran okuyucu "dondurme dugmesi, 1, en az 1 en fazla
         * 99" diye duyuruyor, kullanici Yukari ok'a basiyor ve HICBIR SEY
         * olmuyordu. Rolu tasiyip sozlesmesini uygulamamak, rolu hic
         * yazmamaktan daha kotu: kullanici calismayan bir yol deniyor.
         */
        onKeyDown={event => {
          const step = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;

          if (step !== 0) {
            event.preventDefault();
            setDraft(null);
            onChange(clamp(value + step));
            return;
          }

          const page = event.key === 'PageUp' ? 10 : event.key === 'PageDown' ? -10 : 0;

          if (page !== 0) {
            event.preventDefault();
            setDraft(null);
            onChange(clamp(value + page));
            return;
          }

          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            setDraft(null);
            onChange(event.key === 'Home' ? min : max);
            return;
          }

          if (event.key === 'Enter') {
            event.preventDefault();
            commit((event.target as HTMLInputElement).value);
          }
        }}
        inputMode="numeric"
        disabled={isDisabled}
        /*
         * ⚠ ARALIK ETIKETE GOMULMEZ, ROLE ILE BILDIRILIR. Onceki hâl
         * `"Adet (1-99)"` diyordu: ekran okuyucu bunu duz bir ad olarak
         * okuyor, GUNCEL degeri ve sinirlari ayri birer bilgi olarak
         * bildirmiyordu. `spinbutton` tam da bu kutu icin var ve
         * `aria-valuenow/min/max` degistiginde okuyucu farki kendisi
         * duyuruyor.
         */
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={groupLabel}
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
        <PlusLg aria-hidden />
      </button>
    </div>
  );
};

export default /*#__PURE__*/ memo(QuantityStepper) as typeof QuantityStepper;
