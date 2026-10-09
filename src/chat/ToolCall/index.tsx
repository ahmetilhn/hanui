'use client';

import { type FC, memo, type ReactNode } from 'react';

import { Disclosure, StatusDot, useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

export type ToolCallStatus = 'running' | 'ok' | 'error' | 'aborted' | 'interrupted';

type Props = {
  /** Aracın ikonu. */
  icon?: ReactNode;
  /** Aracın adı — çağrı yerine özgü ("bash", "araştır"). */
  name: string;
  /** Tek satırlık özet (komut, sorgu); teknik fontta, taşan kesilir. */
  summary?: string;
  status: ToolCallStatus;
  /** Sağdaki ikincil bilgi (süre). */
  meta?: ReactNode;
  isDefaultOpen?: boolean;
  /**
   * Kontrollü açılış — `onOpenChange` ile. Örn. çalışırken açık, bitince (kullanıcı dokunmadıysa)
   * kapalı bir terminal kartı.
   */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Gövde — `ToolCallSection`lar. */
  children?: ReactNode;
  className?: string;
  testId?: string;
};

const DOT_TONE = {
  running: 'neutral',
  ok: 'success',
  error: 'danger',
  aborted: 'warning',
  interrupted: 'danger',
} as const;

/**
 * Araç çağrısı kartı — ikon, ad, özet, durum noktası ve süre; açılınca bölümleri.
 *
 * Durum hem noktayla hem OKUNAN metinle bildirilir (`labels.chat.toolStatus`): renk tek başına
 * anlam taşımaz. Çalışan çağrının noktası nabız atar ve NÖTRDÜR — süren iş marka yüzeyi değil.
 */
const ToolCall: FC<Props> = ({
  icon,
  name,
  summary,
  status,
  meta,
  isDefaultOpen,
  isOpen,
  onOpenChange,
  children,
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const statusText = resolveLabel(`ToolCall.status.${status}`, labels?.chat?.toolStatus?.[status]);

  const header = (
    <span className={styles.call__header}>
      {icon !== undefined && (
        <span
          className={cx(styles.call__icon, status === 'running' && styles['call__icon--running'])}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <span className={styles.call__name}>{name}</span>
      {summary !== undefined && <span className={styles.call__summary}>{summary}</span>}
      <StatusDot tone={DOT_TONE[status]} label={statusText} isPulsing={status === 'running'} />
    </span>
  );

  if (children === undefined)
    return (
      <div className={cx(styles.call, styles['call--static'], className)} data-testid={testId}>
        {header}
        {meta !== undefined && <span className={styles.call__meta}>{meta}</span>}
      </div>
    );

  return (
    <Disclosure
      className={cx(styles.call, className)}
      summary={header}
      meta={meta}
      isDefaultOpen={isDefaultOpen}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      testId={testId}
    >
      <div className={styles.call__body}>{children}</div>
    </Disclosure>
  );
};

type SectionProps = {
  /** Bölümün başlığı ("Girdi", "Çıktı", "Hata") — overline. */
  label: string;
  children: ReactNode;
  className?: string;
};

/** Araç çağrısının bir bölümü — başlık + gövde. */
export const ToolCallSection: FC<SectionProps> = ({ label, children, className }) => (
  /*
   * Başlık bir HEADING değil: sohbet akışında başlık düzeyi tüketicinin sayfasına bağlı ve sabit bir
   * `h4` hiyerarşiyi bozuyordu. Bölüm de bir landmark değil (her araç kartında bir "bölge" gürültü).
   */
  <div className={cx(styles.section, className)}>
    <span className={styles.section__label}>{label}</span>
    <div className={styles.section__body}>{children}</div>
  </div>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(ToolCall, 'ToolCall')) as typeof ToolCall;
