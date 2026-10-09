'use client';

import { type FC, type KeyboardEvent, memo, type ReactNode, useRef } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

type Props = {
  /** `IconButton` / `Button size={UISize.XSMALL}` öğeleri. */
  children: ReactNode;
  /** Araç çubuğunun sonunda duran okunan bilgi (süre, belirteç, maliyet). */
  meta?: ReactNode;
  /** Araç çubuğunun adı; verilmezse `labels.chat.messageActions`. */
  label?: string;
  className?: string;
  testId?: string;
};

const FOCUSABLE = 'button:not(:disabled), a[href]';

/**
 * Mesajın eylem çubuğu — kopyala, yeniden dene, ayrıntı.
 *
 * Klavye (`role="toolbar"`, tek sekme durağı değil — her düğme sekme sırasında kalır):
 * `ArrowRight` / `ArrowLeft` sonraki / önceki eylem · `Home` / `End` ilk / son.
 * ⚠ Satır içi araç çubuğu: ok tuşu yalnızca odak ÇUBUKTAYKEN çalışır, sayfayı kaydırmaz.
 */
const MessageActions: FC<Props> = ({ children, meta, label, className, testId }) => {
  const { labels } = useHanui();
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index < 0 || items.length === 0) return;

    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const previous = isRtl ? 'ArrowRight' : 'ArrowLeft';

    const target =
      event.key === next
        ? items[(index + 1) % items.length]
        : event.key === previous
          ? items[(index - 1 + items.length) % items.length]
          : event.key === 'Home'
            ? items[0]
            : event.key === 'End'
              ? items[items.length - 1]
              : null;

    if (!target) return;
    event.preventDefault();
    target.focus();
  };

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={resolveLabel('MessageActions.label', label, labels?.chat?.messageActions)}
      className={cx(styles.actions, className)}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    >
      {children}
      {meta !== undefined && <span className={styles.actions__meta}>{meta}</span>}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(MessageActions, 'MessageActions'),
) as typeof MessageActions;
