'use client';

import { type FC, memo } from 'react';

import { ClipboardCheckFill, ClipboardFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  /** Gösterilecek ve panoya kopyalanacak değer. */
  value: string;
  /** Kopyalama düğmesinin erişilebilir adı. */
  copyLabel?: string;
  /** Kopyalandıktan sonraki ad. Verilmezse `labels.copyField.copied(value)`. */
  copiedLabel?: string;
  /** `aria-live` ile duyurulan onay cümlesi. Verilmezse `labels.copyField.announcement`. */
  copiedAnnouncement?: string;
  size?: 'sm' | 'md';
  /** Kopyalama düğmesini gizler. */
  isReadOnly?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Kopyalanabilir teknik değer — <strong>tek dokunuşla panoya</strong>.
 * Pano mantığı `useCopyFeedback`te, `CodeBadge` ile ortak.
 */
const CopyField: FC<Props> = ({
  value,
  copyLabel,
  copiedLabel,
  copiedAnnouncement,
  size = 'sm',
  isReadOnly,
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const { isCopied, copy, nodeRef } = useCopyFeedback(value);

  return (
    <span className={cx(styles.copy, styles[`copy--${size}`], className)} data-testid={testId}>
      {/*
        `user-select: all` (CSS): tek tiklama degerin TAMAMINI secer.
        Kullanicilar fareyle surukleyip yarim deger kopyaliyordu.
      */}
      <span className={styles.copy__code} ref={nodeRef}>
        {value}
      </span>

      {!isReadOnly && (
        <button
          type="button"
          className={cx(styles.copy__button, isCopied && styles['copy__button--done'])}
          onClick={copy}
          aria-label={
            isCopied
              ? (copiedLabel ??
                resolveFormatter('CopyField.copiedLabel', labels?.copyField?.copied, value))
              : (copyLabel ??
                resolveFormatter('CopyField.copyLabel', labels?.copyField?.copy, value))
          }
        >
          {/*
            Kopyalandi ISARETLI PANO, yalin tik degil: yalin tik "dogru
            deger" diye de okunabiliyordu. Ayni gövde + tik, degisimin
            kopyalama eylemine ait oldugunu birakiyor.
          */}
          {isCopied ? <ClipboardCheckFill aria-hidden /> : <ClipboardFill aria-hidden />}
        </button>
      )}

      {/*
        Ekran okuyucu icin: ikon degisimi gorsel bir sinyal, duyulmuyor.
        `aria-live` yalnizca DEGISTIGINDE konusur.
      */}
      <span aria-live="polite" className={styles.copy__srOnly}>
        {isCopied
          ? resolveLabel(
              'CopyField.copiedAnnouncement',
              copiedAnnouncement,
              labels?.copyField?.announcement,
            )
          : ''}
      </span>
    </span>
  );
};

export default /*#__PURE__*/ memo(CopyField) as typeof CopyField;
