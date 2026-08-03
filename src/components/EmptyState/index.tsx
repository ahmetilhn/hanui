import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Kullanıcının buradan çıkabileceği eylem. */
  action?: ReactNode;
  /** İkincil eylem veya ipucu. */
  secondaryAction?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/**
 * Boş durum.
 *
 * <h3>Neden her boş durum bir eylem taşır</h3>
 * "Sonuç bulunamadı" tek başına çıkmaz sokaktır. Kullanıcı o ekranda ne
 * yapacağını bilmeli: aramayı temizle, filtreyi kaldır, listeye dön. `action`
 * isteğe bağlı ama çağıran taraf onu vermezse kullanıcı tıkanır.
 *
 * <p>Bir listenin BOŞ olması ile YÜKLENEMEMESİ ayrı durumlardır: ağ hatasında
 * bu bileşen çizilmez, hata kendi mesajıyla gösterilir. İkisini birleştirmek
 * kullanıcıya "kayıt kalmamış" dedirtiyordu.
 */
const EmptyState: FC<Props> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = 'md',
  className,
  testId,
}) => (
  <div className={cx(styles.empty, styles[`empty--${size}`], className)} data-testid={testId}>
    {icon && <span className={styles.empty__icon}>{icon}</span>}
    <h3 className={styles.empty__title}>{title}</h3>
    {description && <p className={styles.empty__description}>{description}</p>}
    {(action || secondaryAction) && (
      <div className={styles.empty__actions}>
        {action}
        {secondaryAction}
      </div>
    )}
  </div>
);

export default memo(EmptyState) as typeof EmptyState;
