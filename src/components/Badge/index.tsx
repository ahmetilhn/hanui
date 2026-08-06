import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  /** Birincil sınıflandırma tinti (mavi-lacivert aile). */
  | 'oem'
  /** İkincil sınıflandırma tinti (mor aile). */
  | 'alt'
  /** İndirim / olumlu değişim yüzdesi. Tutarın kendisi nötr kalır. */
  | 'sale'
  /** Miktar sayacı (sepet adedi, filtre sayısı) — dolu zemine izin verilir. */
  | 'action'
  /** Gezinme etiketi. */
  | 'link';

export type BadgeVariant = 'soft' | 'solid' | 'outline';

type Props = {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  /** Küçük ikon; metnin solunda gösterilir. */
  icon?: ReactNode;
  className?: string;
  testId?: string;
};

/** Rozet — durum ve sınıflandırma etiketi. */
const Badge: FC<Props> = ({
  children,
  tone = 'neutral',
  variant = 'soft',
  icon,
  className,
  testId,
}) => (
  <span
    className={cx(styles.badge, styles[`badge--${tone}`], styles[`badge--${variant}`], className)}
    data-testid={testId}
  >
    {icon && <span className={styles.badge__icon}>{icon}</span>}
    {children}
  </span>
);

export default /*#__PURE__*/ memo(Badge) as typeof Badge;
