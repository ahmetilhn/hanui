'use client';

import {
  Children,
  cloneElement,
  type FC,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Sanal pencerenin üstüne ve altına fazladan çizilen satır sayısı — hızlı kaydırmada boşluk görünmesin. */
const OVERSCAN = 6;

type ListProps = {
  /** Listenin erişilebilir adı ("Bağlam haritası"). */
  label: string;
  /** `ActionListItem` öğeleri. */
  children: ReactNode;
  /**
   * Verilirse liste SANALLAŞTIRILIR: yalnızca görünen satırlar çizilir. Satır yüksekliği SABİT
   * olmalı (px).
   */
  rowHeight?: number;
  /** Sanal listede görünen alanın yüksekliği (px). */
  maxHeight?: number;
  className?: string;
  testId?: string;
};

type ItemProps = {
  children: ReactNode;
  /** Satırın başında duran öğe (kimlik, ikon). */
  start?: ReactNode;
  /** Satırın sonunda duran öğe (tur numarası, süre). */
  end?: ReactNode;
  onClick?: () => void;
  href?: string;
  /** Verilirse satır bir SEÇİMDİR (`aria-pressed`); verilmezse düz bir eylem. */
  isSelected?: boolean;
  /** Geri planda kalan satır (gizlenmiş, eski) — renkle, saydamlıkla değil. */
  isMuted?: boolean;
  testId?: string;
  /** Sanal listenin kendisi yazar: satırın gerçek konumu ve listenin gerçek boyu. */
  'aria-posinset'?: number;
  'aria-setsize'?: number;
};

/**
 * Çerçeveli satır listesi — her satır bir EYLEM (açar, gider) ya da bir SEÇİM (ayrıntıyı gösterir).
 *
 * ⚠ Seçim mi eylem mi satır başına `isSelected` ile söylenir: verilirse satır bir aç/kapa düğmesidir
 * (`aria-pressed`), verilmezse düz bir eylem. Eylemi seçim gibi sunmak kalıcı bir durum vaat ediyordu.
 * ⚠ Sanal listede ekran okuyucu yalnızca çizilen satırları görür; gerçek konumu `aria-posinset` /
 * `aria-setsize` söyler.
 */
const ActionList: FC<ListProps> = ({
  label,
  children,
  rowHeight,
  maxHeight = 320,
  className,
  testId,
}) => {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<ItemProps>[];
  const [scrollTop, setScrollTop] = useState(0);

  if (!rowHeight)
    return (
      <ul className={cx(styles.list, className)} aria-label={label} data-testid={testId}>
        {items}
      </ul>
    );

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const end = Math.min(items.length, Math.ceil((scrollTop + maxHeight) / rowHeight) + OVERSCAN);

  return (
    <div
      className={cx(styles.list, styles['list--virtual'], className)}
      style={{ maxBlockSize: maxHeight, ['--hanui-row-height' as string]: `${rowHeight}px` }}
      onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
      data-testid={testId}
    >
      <ul
        aria-label={label}
        className={styles.list__window}
        style={{
          blockSize: items.length * rowHeight,
          paddingBlockStart: start * rowHeight,
        }}
      >
        {items.slice(start, end).map((item, index) =>
          cloneElement(item, {
            'aria-posinset': start + index + 1,
            'aria-setsize': items.length,
          }),
        )}
      </ul>
    </div>
  );
};

/** `ActionList` satırı — kendi `li`sini taşır. */
export const ActionListItem: FC<ItemProps> = ({
  children,
  start,
  end,
  onClick,
  href,
  isSelected,
  isMuted,
  testId,
  'aria-posinset': position,
  'aria-setsize': setSize,
}) => {
  const { linkComponent: LinkComponent } = useHanui();

  const className = cx(
    styles.item,
    isSelected && styles['item--selected'],
    isMuted && styles['item--muted'],
  );
  const content = (
    <>
      {start !== undefined && <span className={styles.item__start}>{start}</span>}
      <span className={styles.item__body}>{children}</span>
      {end !== undefined && <span className={styles.item__end}>{end}</span>}
    </>
  );

  const Anchor = LinkComponent ?? 'a';

  return (
    <li className={styles.list__slot} aria-posinset={position} aria-setsize={setSize}>
      {href ? (
        <Anchor href={href} className={className} data-testid={testId}>
          {content}
        </Anchor>
      ) : (
        <button
          type="button"
          className={className}
          onClick={onClick}
          aria-pressed={isSelected}
          data-testid={testId}
        >
          {content}
        </button>
      )}
    </li>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ActionList, 'ActionList'),
) as typeof ActionList;
