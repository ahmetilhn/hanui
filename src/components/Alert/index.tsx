import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import {
  CheckCircleFillIcon,
  ExclamationTriangleFillIcon,
  InfoCircleFillIcon,
  XCircleFillIcon,
} from '../../icons';

import styles from './index.module.scss';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

type Props = {
  children: ReactNode;
  tone?: AlertTone;
  title?: string;
  /** Sağda gösterilen eylem (bağlantı veya düğme). */
  action?: ReactNode;
  className?: string;
  testId?: string;
};

/** Her tona kendi ikonu; renk tek başına anlam taşımaz (WCAG 1.4.1). */
const ICONS: Record<AlertTone, ReactNode> = {
  info: <InfoCircleFillIcon />,
  success: <CheckCircleFillIcon />,
  warning: <ExclamationTriangleFillIcon />,
  danger: <XCircleFillIcon />,
};

/**
 * Bilgi / uyarı kutusu.
 *
 * <p>`danger` ve `warning` tonları `role="alert"` taşır: ekran okuyucu bunları
 * anında duyurur. `info` ve `success` duyurulmaz — sayfa yüklenirken her bilgi
 * kutusunun okunması gürültü olurdu.
 */
const Alert: FC<Props> = ({ children, tone = 'info', title, action, className, testId }) => (
  <div
    className={cx(styles.alert, styles[`alert--${tone}`], className)}
    role={tone === 'danger' || tone === 'warning' ? 'alert' : undefined}
    data-testid={testId}
  >
    <span className={styles.alert__icon}>{ICONS[tone]}</span>

    <div className={styles.alert__body}>
      {title && <strong className={styles.alert__title}>{title}</strong>}
      <div className={styles.alert__content}>{children}</div>
    </div>

    {action && <div className={styles.alert__action}>{action}</div>}
  </div>
);

export default memo(Alert) as typeof Alert;
