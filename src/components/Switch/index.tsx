'use client';

import { forwardRef, type InputHTMLAttributes, memo, type ReactNode } from 'react';

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
 * Anahtar (switch) — <strong>anında</strong> uygulanan aç/kapa.
 *
 * @example
 * <Switch
 * label="Kampanya bildirimleri"
 * hint="E-posta ile ayda en fazla iki ileti"
 * checked={isSubscribed}
 * onChange={event => subscribe(event.target.checked)}
 * />
 */
const Switch = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, isLabelFirst, className, id, testId, ...rest }, ref) => (
    <label
      className={cx(styles.switch, isLabelFirst && styles['switch--labelFirst'], className)}
      data-testid={testId}
    >
      <input
        ref={ref}
        type="checkbox"
        /*
         * `role="switch"` YEREL onay kutusunun UZERINE yazilir: davranis
         * checkbox'tan gelir, DUYURU switch olur. Ekran okuyucu "acik/kapali"
         * der; "isaretli" demek kullaniciya yanlis bir soz veriyordu.
         */
        role="switch"
        id={id}
        className={styles.switch__input}
        {...rest}
      />

      {/* Kulbun tasiyicisi; gorsel durum tamamen CSS'te. */}
      <span className={styles.switch__track} aria-hidden>
        <span className={styles.switch__thumb} />
      </span>

      <span className={styles.switch__text}>
        <span className={styles.switch__label}>{label}</span>
        {hint && <span className={styles.switch__hint}>{hint}</span>}
      </span>
    </label>
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Switch, 'Switch')) as typeof Switch;
