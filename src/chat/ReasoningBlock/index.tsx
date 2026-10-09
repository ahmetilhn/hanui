'use client';

import { type FC, memo, type ReactNode, useEffect, useRef, useState } from 'react';

import { Disclosure, Spinner } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  /** Başlık — çağrı yerine ÖZGÜ ("Düşündü · 3 araç · 2,4 sn"), `labels`a girmez. */
  summary: ReactNode;
  /** Tur sürüyor: blok AÇIK durur ve gösterge döner. */
  isRunning?: boolean;
  /** Süren işin göstergesi; verilmezse `Spinner`. Marka yükleyicisi buraya geçer. */
  indicator?: ReactNode;
  /** Kapalı bir turda açılış durumu. */
  isDefaultOpen?: boolean;
  /** Gövde: `ReasoningText`, ara metinler, `ToolCall`lar. */
  children: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * "Model ne yaptı" bloğu — akıl yürütme, ara metinler, araç çağrıları.
 *
 * Tur sürerken AÇIK durur, bitince kapanır. ⚠ Kullanıcı bloğu elle açtıysa ya da kapattıysa o
 * tercihe DOKUNULMAZ: tur bittiğinde okuduğu bloğun elinden çekilmesi en sık şikâyetti.
 */
const ReasoningBlock: FC<Props> = ({
  summary,
  isRunning = false,
  indicator,
  isDefaultOpen = false,
  children,
  className,
  testId,
}) => {
  const [isOpen, setIsOpen] = useState(isRunning || isDefaultOpen);
  const isTouched = useRef(false);

  useEffect(() => {
    if (!isTouched.current) setIsOpen(isRunning || isDefaultOpen);
  }, [isRunning, isDefaultOpen]);

  return (
    <Disclosure
      variant="plain"
      className={cx(styles.block, className)}
      summary={
        <span className={styles.block__summary}>
          {isRunning && (
            <span className={styles.block__indicator}>{indicator ?? <Spinner size="sm" />}</span>
          )}
          {summary}
        </span>
      }
      isOpen={isOpen}
      onOpenChange={next => {
        isTouched.current = true;
        setIsOpen(next);
      }}
      testId={testId}
    >
      <div className={styles.block__body}>{children}</div>
    </Disclosure>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ReasoningBlock, 'ReasoningBlock'),
) as typeof ReasoningBlock;
