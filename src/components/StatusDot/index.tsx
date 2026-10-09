import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type StatusDotTone = 'neutral' | 'success' | 'warning' | 'danger';

type Props = {
  tone?: StatusDotTone;
  /**
   * Durumun okunan adı ("Bağlı", "Çalışıyor"). ZORUNLU: nokta yalnızca renk ve renk tek başına
   * anlam taşıyamaz (WCAG 1.4.1). Görsel olarak gizli metin olarak yazılır.
   */
  label: string;
  /** Süren bir iş — "çalışıyor", "bağlanıyor". Azaltılmış harekette durur. */
  isPulsing?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Durum noktası — bağlantı, araç çağrısı, meşguliyet.
 *
 * ⚠ Marka tonu YOK (`brand`): nokta bir durum taşır, marka yüzeyi değil. Süren iş `neutral` +
 * `isPulsing` ile anlatılır; yeşil yalnızca anlamsal başarıda (`success`).
 */
const StatusDot: FC<Props> = ({ tone = 'neutral', label, isPulsing, className, testId }) => (
  <span className={cx(styles.status, className)} data-testid={testId}>
    <span
      aria-hidden
      className={cx(
        styles.status__dot,
        styles[`status__dot--${tone}`],
        isPulsing && styles['status__dot--pulsing'],
      )}
    />
    <span className={styles.status__label}>{label}</span>
  </span>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(StatusDot, 'StatusDot')) as typeof StatusDot;
