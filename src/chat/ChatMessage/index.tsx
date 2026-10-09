import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type ChatMessageAuthor = 'user' | 'assistant';

type Props = {
  author: ChatMessageAuthor;
  children: ReactNode;
  /** Asistan mesajının avatarı (`Avatar tone="brand"`); ilk satır hizasında durur. */
  avatar?: ReactNode;
  /** Mesajın altındaki eylem çubuğu (`MessageActions`). */
  actions?: ReactNode;
  /** Yanıt hâlâ akıyor — `aria-busy`: ekran okuyucu yarım metni okumaz. */
  isStreaming?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Sohbet mesajı. Kullanıcı mesajı sağa yaslı bir balon (`surface-2`, satır sonları korunur);
 * asistan mesajı tam genişlik, avatar sol üstte.
 *
 * ⚠ Eylemler hover'da VE `:focus-within`de belirginleşir: klavye kullanıcısı da görmeli. Gizlenmez,
 * yalnızca sessizleşir — `opacity` değil renk (soluklaştırma yasak).
 */
const ChatMessage: FC<Props> = ({
  author,
  children,
  avatar,
  actions,
  isStreaming,
  className,
  testId,
}) => (
  <article
    className={cx(styles.message, styles[`message--${author}`], className)}
    aria-busy={isStreaming || undefined}
    data-testid={testId}
  >
    {author === 'assistant' && avatar !== undefined && (
      <div className={styles.message__avatar}>{avatar}</div>
    )}

    <div className={styles.message__main}>
      <div className={styles.message__body}>{children}</div>
      {actions !== undefined && <div className={styles.message__actions}>{actions}</div>}
    </div>
  </article>
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ChatMessage, 'ChatMessage'),
) as typeof ChatMessage;
