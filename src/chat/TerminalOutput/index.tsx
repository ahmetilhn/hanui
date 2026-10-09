'use client';

import { type FC, memo, useRef } from 'react';

import { useHanui, useStickToBottom } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

export type TerminalChunk = {
  stream: 'stdout' | 'stderr';
  text: string;
};

type Props = {
  /** Çalıştırılan komut — `$` istemiyle ilk satırda. */
  command?: string;
  chunks: TerminalChunk[];
  /** Kaydırılabildiğinde bölgenin okunan adı ("Komut çıktısı"). */
  label: string;
  /** Gövdenin tavanı (px). */
  maxHeight?: number;
  className?: string;
  testId?: string;
};

/**
 * Terminal çıktısı — MÜREKKEP yüzey, iki temada da koyu (`shell*`). Akarken sona yapışık kalır.
 *
 * ⚠ stderr satırı renkten başka bir işaret de taşır: görsel olarak gizli bir önek
 * (`labels.chat.stderr`, "hata çıktısı"). Kırmızı tek başına anlam taşıyamaz (1.4.1).
 */
const TerminalOutput: FC<Props> = ({
  command,
  chunks,
  label,
  maxHeight = 300,
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const ref = useRef<HTMLPreElement>(null);
  useStickToBottom(ref);

  const stderrLabel = resolveLabel('TerminalOutput.stderr', labels?.chat?.stderr);

  return (
    <pre
      ref={ref}
      className={cx(styles.terminal, className)}
      style={{ maxBlockSize: maxHeight }}
      /* Kayan çıktı klavyeyle ulaşılabilir (2.1.1). */
      tabIndex={0}
      role="region"
      aria-label={label}
      data-testid={testId}
    >
      {command !== undefined && (
        <span className={styles.terminal__command}>
          <span className={styles.terminal__prompt} aria-hidden>
            ${' '}
          </span>
          {command}
          {'\n'}
        </span>
      )}
      {chunks.map((chunk, index) =>
        chunk.stream === 'stderr' ? (
          <span key={index} className={styles.terminal__stderr}>
            <span className={styles.terminal__srOnly}>{`${stderrLabel}: `}</span>
            {chunk.text}
          </span>
        ) : (
          <span key={index}>{chunk.text}</span>
        ),
      )}
    </pre>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(TerminalOutput, 'TerminalOutput'),
) as typeof TerminalOutput;
