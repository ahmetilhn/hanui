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
     * ⚠ `role="separator"` ZORUNLU.
     * ⚠ `aria-orientation` YAZILMAZ: `separator`ın varsayılanı zaten `horizontal` ve bileşen dikey
     * bir varyant sunmuyor.
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
