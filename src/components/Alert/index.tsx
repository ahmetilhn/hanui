import { type FC, memo, type ReactNode } from 'react';

import {
  CheckCircleFill,
  ExclamationTriangleFill,
  InfoCircleFill,
  XCircleFill,
} from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';

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

/**
 * Her tona kendi ikonu; renk tek başına anlam taşımaz (WCAG 1.4.1).
 *
 * <p>Dördü de DOLU (`*Fill`) sürüm: ton zeminin üzerinde ince çizgili bir
 * simge, madalyonun içinde soluk kalıp uzaktan seçilemiyordu.
 *
 * <p>`aria-hidden`: ikonun taşıdığı bilgi yanındaki metinde zaten var; ikisini
 * birden okumak ekran okuyucuda tekrar üretiyordu.
 */
const ICONS: Record<AlertTone, ReactNode> = {
  info: <InfoCircleFill aria-hidden />,
  success: <CheckCircleFill aria-hidden />,
  warning: <ExclamationTriangleFill aria-hidden />,
  danger: <XCircleFill aria-hidden />,
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
