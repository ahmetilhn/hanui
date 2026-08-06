import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  /** Ekran okuyucuya okunacak metin; görsel olarak gizli. */
  label?: string;
  className?: string;
};

/** Yükleme göstergesi. */
const Spinner: FC<Props> = ({ size = 'md', label, className }) => {
  const { labels } = useHanui();

  return (
    <span className={cx(styles.spinner, styles[`spinner--${size}`], className)} role="status">
      <span className={styles.spinner__label}>
        {label ?? resolveLabel('Spinner.label', labels?.loading)}
      </span>
    </span>
  );
};

export default /*#__PURE__*/ memo(Spinner) as typeof Spinner;
