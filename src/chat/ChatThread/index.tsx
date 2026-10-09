'use client';

import { type FC, memo, type ReactNode, useEffect, useRef } from 'react';

import { ArrowDown } from 'react-bootstrap-icons';

import { IconButton, useAnnounce, useHanui, useStickToBottom } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

type Props = {
  /** Mesajlar (`ChatMessage`). */
  children: ReactNode;
  /** Alt dok — yazma alanı (`PromptInput`) ve ipucu satırı. */
  dock?: ReactNode;
  /** Yanıt akıyor. Akış bittiğinde "yanıt hazır" duyurulur. */
  isStreaming?: boolean;
  /** Bölgenin adı; verilmezse `labels.chat.thread`. */
  label?: string;
  className?: string;
  testId?: string;
};

/**
 * Sohbet iskeleti — kaydırma alanı, ortalanmış sütun ve alt dok.
 *
 * - Sona yapışık kalır; kullanıcı yukarı kaydırınca bırakır ve "en yeniye in" düğmesi belirir.
 * - ⚠ Akan belirteçler OKUNMAZ (`aria-live` yok, `role="log"` değil): her belirteci duyuran bir bölge
 *   ekran okuyucuyu kullanılamaz kılıyordu. Yanıt BİTTİĞİNDE tek bir cümle duyurulur.
 * - Dok sayfanın dibine yapışır ve `safe-area` payını taşır; iOS'ta klavye açıkken görünür kalır.
 */
const ChatThread: FC<Props> = ({ children, dock, isStreaming, label, className, testId }) => {
  const { labels } = useHanui();
  const announce = useAnnounce();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAtEnd, scrollToEnd } = useStickToBottom(scrollRef);

  /* Akis bitti: `true` → `false` gecisinde bir kez duyurulur, ilk render'da degil. */
  const wasStreaming = useRef(isStreaming);
  useEffect(() => {
    if (wasStreaming.current && !isStreaming)
      announce(resolveLabel('ChatThread.replyReady', labels?.chat?.replyReady));
    wasStreaming.current = isStreaming;
  }, [announce, isStreaming, labels?.chat?.replyReady]);

  return (
    <div className={cx(styles.thread, className)} data-testid={testId}>
      <div
        ref={scrollRef}
        className={styles.thread__scroll}
        role="region"
        aria-label={resolveLabel('ChatThread.label', label, labels?.chat?.thread)}
        /* Kaydirma bolgesi klavyeyle ulasilabilir (2.1.1). */
        tabIndex={0}
      >
        <div className={styles.thread__column}>{children}</div>
      </div>

      <div className={styles.thread__dock}>
        {!isAtEnd && (
          <IconButton
            className={styles.thread__latest}
            icon={<ArrowDown aria-hidden />}
            label={resolveLabel('ChatThread.scrollToLatest', labels?.chat?.scrollToLatest)}
            variant="outline"
            shape="round"
            size="sm"
            onClick={scrollToEnd}
          />
        )}
        {dock !== undefined && <div className={styles.thread__column}>{dock}</div>}
      </div>
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ChatThread, 'ChatThread'),
) as typeof ChatThread;
