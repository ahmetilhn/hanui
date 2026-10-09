'use client';

import { type FC, memo, useEffect, useRef, useState } from 'react';

import { CheckLg, ClipboardFill } from 'react-bootstrap-icons';

import { IconButton, useAnnounce, useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

type Props = {
  /** Ham kod — kopyalanan ve `html` yokken çizilen metin. */
  code: string;
  /** Dil adı; başlık şeridinde ve kopyalama düğmesinin adında. */
  language?: string;
  /**
   * ÖNCEDEN VURGULANMIŞ HTML (Shiki çıktısı). Verilmezse düz `<pre>` çizilir.
   * ⚠ GÜVENLİK ÇAĞIRANIN: bu dize olduğu gibi DOM'a yazılır. Yalnızca kendi vurgulayıcınızın
   * ürettiği çıktıyı verin; kullanıcı girdisini asla doğrudan geçirmeyin.
   */
  html?: string;
  /** Gövdenin tavanı (px); uzun kod kendi içinde kayar. */
  maxHeight?: number;
  className?: string;
  testId?: string;
};

/** Kopyalandı işaretinin ekranda kaldığı süre (ms). */
const COPIED_FOR = 1600;

/**
 * Kod bloğu — başlık şeridi (dil + kopyala) ve kod gövdesi.
 *
 * ⚠ Vurgulayıcı İÇERMEZ (Shiki tüketicide). Shiki'nin çift tema çıktısı (`--shiki-light` /
 * `--shiki-dark` değişkenleri) burada temaya bağlanır; vurgusuz kod da aynı kutuda okunur.
 * Kod satırları SARILMAZ: dar ekranda kutu yatay kayar (kodun girintisi anlamdır).
 */
const CodeBlock: FC<Props> = ({ code, language, html, maxHeight, className, testId }) => {
  const { labels } = useHanui();
  const announce = useAnnounce();
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }

    setIsCopied(true);
    announce(resolveLabel('CodeBlock.copied', labels?.chat?.codeCopied));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsCopied(false), COPIED_FOR);
  };

  const languageName = language ?? '';

  return (
    <figure className={cx(styles.block, className)} data-testid={testId}>
      <figcaption className={styles.block__header}>
        <span className={styles.block__language}>{languageName}</span>
        <IconButton
          icon={isCopied ? <CheckLg aria-hidden /> : <ClipboardFill aria-hidden />}
          label={resolveFormatter('CodeBlock.copy', labels?.chat?.codeCopy, languageName)}
          size="sm"
          onClick={copy}
        />
      </figcaption>

      <div
        className={styles.block__body}
        style={maxHeight === undefined ? undefined : { maxBlockSize: maxHeight }}
        /* Kayan kod klavyeyle ulaşılabilir (2.1.1). */
        tabIndex={0}
        /* Bölge ancak bir ADI varken bölge; adsız bir "bölge" ekran okuyucuda gürültü. */
        role={languageName ? 'region' : undefined}
        aria-label={languageName || undefined}
      >
        {html ? (
          <div className={styles.block__highlighted} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className={styles.block__pre}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </figure>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(CodeBlock, 'CodeBlock')) as typeof CodeBlock;
