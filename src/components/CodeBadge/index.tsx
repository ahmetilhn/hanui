'use client';

import { type FC, memo } from 'react';

import { ClipboardCheckFill, ClipboardFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

export type CodeBadgeSize = 'sm' | 'md' | 'lg';

type Props = {
  /** Gösterilecek teknik kod (arıza kodu, parça numarası, şase). */
  code: string;
  /** Kopyalama düğmesi ekler. */
  isCopyable?: boolean;
  /** Kopyalama düğmesinin erişilebilir adı. Verilmezse `labels.copyField.copy(code)`. */
  copyLabel?: string;
  /** Kopyalandıktan sonraki ad. Verilmezse `labels.copyField.copied(code)`. */
  copiedLabel?: string;
  /** `aria-live` ile duyurulan onay cümlesi. Verilmezse `labels.copyField.announcement`. */
  copiedAnnouncement?: string;
  size?: CodeBadgeSize;
  className?: string;
  testId?: string;
};

/**
 * Teknik kod rozeti — monospace kod, marka zeminli çerçeve.
 *
 * `CopyField`ten farkı ÇERÇEVEDİR: CopyField satır içi çıplak değer, bu
 * bileşen sayfanın kahramanı olan kod (arıza kodu başlığı gibi). Pano
 * mantığı ikisinde de `useCopyFeedback` — ayrışamazlar. Etiketler de
 * `labels.copyField` sözlüğünü paylaşır: aynı eylem için ikinci bir sözlük
 * anahtarı, iki ayrı çeviri kaynağı olurdu.
 */
const CodeBadge: FC<Props> = ({
  code,
  isCopyable,
  copyLabel,
  copiedLabel,
  copiedAnnouncement,
  size = 'md',
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const { isCopied, copy, nodeRef } = useCopyFeedback(code);

  return (
    <span className={cx(styles.badge, styles[`badge--${size}`], className)} data-testid={testId}>
      {/* `user-select: all` (CSS): tek tiklama kodun TAMAMINI secer. */}
      <span className={styles.badge__code} ref={nodeRef}>
        {code}
      </span>

      {isCopyable && (
        <button
          type="button"
          className={cx(styles.badge__button, isCopied && styles['badge__button--done'])}
          onClick={copy}
          aria-label={
            isCopied
              ? (copiedLabel ??
                resolveFormatter('CodeBadge.copiedLabel', labels?.copyField?.copied, code))
              : (copyLabel ??
                resolveFormatter('CodeBadge.copyLabel', labels?.copyField?.copy, code))
          }
        >
          {isCopied ? <ClipboardCheckFill aria-hidden /> : <ClipboardFill aria-hidden />}
        </button>
      )}

      <span aria-live="polite" className={styles.badge__srOnly}>
        {isCopied
          ? resolveLabel(
              'CodeBadge.copiedAnnouncement',
              copiedAnnouncement,
              labels?.copyField?.announcement,
            )
          : ''}
      </span>
    </span>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(CodeBadge, 'CodeBadge')) as typeof CodeBadge;
