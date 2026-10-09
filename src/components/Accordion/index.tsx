'use client';

import { type FC, memo, type ReactNode, useCallback, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import Disclosure from '../Disclosure';

import styles from './index.module.scss';

export type AccordionItem = {
  id: string;
  /** Başlık satırı — tıklanabilir olan bu. */
  title: ReactNode;
  /** Başlığın sağında duran ikincil bilgi (sayaç, rozet). */
  meta?: ReactNode;
  content: ReactNode;
  isDisabled?: boolean;
};

type Props = {
  items: AccordionItem[];
  /** Aynı anda YALNIZCA BİR bölüm açık kalır. */
  isSingle?: boolean;
  /** Kontrolsüz kullanımda açılışta açık olan bölümler. */
  defaultOpenIds?: string[];
  /** Kontrollü kullanım; `onChange` ile birlikte verilir. */
  openIds?: string[];
  onChange?: (openIds: string[]) => void;
  className?: string;
  testId?: string;
};

/**
 * Akordeon — katlanabilir bölümler. Her bölüm bir `Disclosure`: yerel `<details>` mantığı (kontrollü
 * kipte DOM eşitlemesi, `onToggle`, pasif başlık) TEK yerde yaşar.
 */
const Accordion: FC<Props> = ({
  items,
  isSingle,
  defaultOpenIds,
  openIds: controlledIds,
  onChange,
  className,
  testId,
}) => {
  const [uncontrolledIds, setUncontrolledIds] = useState<string[]>(defaultOpenIds ?? []);

  const isControlled = controlledIds !== undefined;
  const openIds = isControlled ? controlledIds : uncontrolledIds;

  const toggle = useCallback(
    (id: string, willOpen: boolean) => {
      const next = willOpen
        ? isSingle
          ? [id]
          : [...openIds.filter(current => current !== id), id]
        : openIds.filter(current => current !== id);

      if (!isControlled) setUncontrolledIds(next);
      onChange?.(next);
    },
    [isControlled, isSingle, onChange, openIds],
  );

  return (
    <div className={cx(styles.accordion, className)} data-testid={testId}>
      {items.map(item => (
        <Disclosure
          key={item.id}
          variant="plain"
          className={styles.accordion__item}
          summary={item.title}
          meta={item.meta}
          isDisabled={item.isDisabled}
          isOpen={openIds.includes(item.id)}
          onOpenChange={willOpen => toggle(item.id, willOpen)}
        >
          {item.content}
        </Disclosure>
      ))}
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Accordion, 'Accordion')) as typeof Accordion;
