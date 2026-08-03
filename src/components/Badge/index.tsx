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

/**
 * Rozet — durum ve sınıflandırma etiketi.
 *
 * <p><strong>Renk tek başına anlam taşımaz</strong> (WCAG 1.4.1): her rozet
 * okunabilir bir metin içerir. `tone` yalnızca metni pekiştirir; renk körü bir
 * kullanıcı da aynı bilgiyi alır.
 *
 * <h3>Durum tonlarında `solid` ile `soft` aynı şeyi verir</h3>
 * Bu bilinçli. <strong>Doygun dolgu = tıklanabilir</strong> kuralı gereği dolu
 * zeminli bir durum etiketi düğmeye benziyor ve kullanıcılar "Son 2 adet" gibi
 * bir etikete tıklamayı deniyordu. Prop çağıran tarafları kırmamak için
 * korundu, görünüm tint'e sabitlendi.
 *
 * <p>Doygun dolgu yalnızca <strong>miktar</strong> tonlarında (`action`,
 * `link`) anlamlı: onlar bir durumu değil bir sayıyı bildirir ve tıklanabilir
 * bir öğenin parçasıdır.
 */
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

export default memo(Badge) as typeof Badge;
