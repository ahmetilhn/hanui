'use client';

import { type FC, memo } from 'react';

import { ClipboardCheckFill, ClipboardFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useHanui } from '../../theme/context';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

export type CodeBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

type Props = {
  /** Gösterilecek teknik kod (arıza kodu, parça numarası, şase). */
  code: string;
  /** Kopyalama düğmesi ekler. */
  isCopyable?: boolean;
  /** Kopyalama düğmesinin erişilebilir adı. */
  copyLabel?: string;
  /** Kopyalandıktan sonraki ad. */
  copiedLabel?: string;
  /** `aria-live` ile duyurulan onay cümlesi. */
  copiedAnnouncement?: string;
  size?: CodeBadgeSize;
  /** Kodu ETKİLEŞİMLİ yapar (kaynağı aç, ayrıntıya git): kod bir düğme olur. */
  onClick?: () => void;
  /** Kodu bir BAĞLANTI yapar; `onClick` ile birlikte verilmez. */
  href?: string;
  linkProps?: HanuiLinkExtraProps;
  /**
   * Etkileşimli kodun okunan adı. Kısa kimliklerde ("A3") kod tek başına ne açılacağını söylemez
   * ("A3 kaynağını aç"). Verilmezse kodun kendisi.
   */
  label?: string;
  className?: string;
  testId?: string;
};

/**
 * Teknik kod rozeti — monospace kod, MÜREKKEP zemin (iki temada aynı).
 * Etkileşimli kipte (`onClick` / `href`) kod bir düğme ya da bağlantıdır; kopyalama düğmesi onun
 * KARDEŞİ kalır (iç içe düğme geçersiz HTML).
 */
const CodeBadge: FC<Props> = ({
  code,
  isCopyable,
  copyLabel,
  copiedLabel,
  copiedAnnouncement,
  size = 'md',
  onClick,
  href,
  linkProps,
  label,
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const { isCopied, copy, nodeRef } = useCopyFeedback(code);
  const isInteractive = Boolean(onClick || href);

  /* `user-select: all` (CSS): tek tiklama kodun TAMAMINI secer — yalnizca etkilesimsiz kipte. */
  const codeNode = (
    <span className={styles.badge__code} ref={nodeRef}>
      {code}
    </span>
  );

  return (
    <span
      className={cx(
        styles.badge,
        styles[`badge--${size}`],
        isInteractive && styles['badge--interactive'],
        className,
      )}
      data-testid={testId}
    >
      {href ? (
        <HanuiLink {...linkProps} href={href} className={styles.badge__action} aria-label={label}>
          {codeNode}
        </HanuiLink>
      ) : onClick ? (
        <button type="button" className={styles.badge__action} onClick={onClick} aria-label={label}>
          {codeNode}
        </button>
      ) : (
        codeNode
      )}

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
