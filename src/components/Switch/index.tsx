'use client';

import { forwardRef, type InputHTMLAttributes, memo, type ReactNode, useId } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> & {
  /** Anahtarın görünür etiketi. */
  label: ReactNode;
  /** Etiketin altındaki açıklama; `aria-describedby` ile bağlanır. */
  hint?: string;
  /** Etiket anahtarın SOLUNDA durur — ayar listelerinin yaygın düzeni. */
  isLabelFirst?: boolean;
  testId?: string;
};

/**
 * Anahtar (switch) — anında uygulanan aç/kapa.
 * @example <Switch label="Kampanya bildirimleri" hint="E-posta ile ayda en fazla iki…
 */
const Switch = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, isLabelFirst, className, id, testId, ...rest }, ref) => {
    /*
     * Prop'un dokumani `aria-describedby` diyordu ama hicbir `id` uretilmiyor, metin yalnizca
     * sarmalayan `<label>`in icinde duruyordu
     * ⚠ IPUCU ERISILEBILIR ADA DEGIL ACIKLAMAYA BAGLANIR.
     */
    const generatedId = useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;

    return (
      <label
        className={cx(styles.switch, isLabelFirst && styles['switch--labelFirst'], className)}
        data-testid={testId}
      >
        <input
          ref={ref}
          type="checkbox"
          /*
           * `role="switch"` YEREL onay kutusunun UZERINE yazilir: davranis checkbox'tan gelir,
           * DUYURU switch olur.
           */
          role="switch"
          id={baseId}
          className={styles.switch__input}
          aria-labelledby={labelId}
          aria-describedby={hint ? hintId : rest['aria-describedby']}
          {...rest}
        />

        {/* Kulbun tasiyicisi; gorsel durum tamamen CSS'te. */}
        <span className={styles.switch__track} aria-hidden>
          <span className={styles.switch__thumb} />
        </span>

        <span className={styles.switch__text}>
          <span id={labelId} className={styles.switch__label}>
            {label}
          </span>
          {hint && (
            <span id={hintId} className={styles.switch__hint}>
              {hint}
            </span>
          )}
        </span>
      </label>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Switch, 'Switch')) as typeof Switch;
