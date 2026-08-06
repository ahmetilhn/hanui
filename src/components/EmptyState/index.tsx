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
  /** `error` — liste BOŞ değil, ÇEKİLEMEDİ. */
  tone?: 'empty' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/** Boş durum. */
const EmptyState: FC<Props> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  tone = 'empty',
  size = 'md',
  className,
  testId,
}) => (
  <div
    className={cx(styles.empty, styles[`empty--${size}`], styles[`empty--${tone}`], className)}
    /* Hata DUYURULUR: gormeyen kullanici icin sessizce degisen bir liste, hic
       degismemis demekti. Bos durum duyurulmaz — o beklenen bir sonuc. */
    role={tone === 'error' ? 'alert' : undefined}
    data-testid={testId}
  >
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

export default /*#__PURE__*/ memo(EmptyState) as typeof EmptyState;
