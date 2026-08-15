import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  /** Ortada gösterilen metin ("veya"). */
  label?: string;
  className?: string;
};

/** Ayırıcı çizgi. */
const Divider: FC<Props> = ({ label, className }) =>
  label ? (
    /*
     * ⚠ `role="separator"` ZORUNLU. Etiketsiz dal `<hr>` kullanıyor ve onun
     * örtük rolü zaten `separator`; etiketli dal ise düz bir `<div>`di, yani
     * ayırıcı ANLAMI tam da anlam taşıdığı yerde kayboluyordu. `aria-label`
     * etiketi role bağlar ("Ödeme bilgileri" ayırıcısı).
     *
     * ⚠ `aria-orientation` YAZILMAZ: `separator`ın varsayılanı zaten
     * `horizontal` ve bileşen dikey bir varyant sunmuyor.
     */
    <div
      role="separator"
      aria-label={label}
      className={cx(styles.divider, styles['divider--labelled'], className)}
    >
      <span className={styles.divider__label}>{label}</span>
    </div>
  ) : (
    <hr className={cx(styles.divider, className)} />
  );

export default /*#__PURE__*/ memo(Divider) as typeof Divider;
