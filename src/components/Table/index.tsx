import { type FC, type HTMLAttributes, memo, type TableHTMLAttributes } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type ScrollerProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Çerçeve (hairline + yarıçap + yüzey). Gömülü tablolarda kapatılır: orada
   * tablo zaten bir kartın içinde ve ikinci bir çerçeve kutu içinde kutu
   * görünüyordu.
   */
  hasFrame?: boolean;
};

/**
 * Tablo kaydırma kutusu — "tablo kendi kutusunda kayar, sayfa asla yatay
 * kaymaz" kuralının tek uygulaması.
 */
export const TableScroller: FC<ScrollerProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ hasFrame = true, className, children, ...rest }) => (
    <div
      className={cx(styles.scroller, hasFrame && styles['scroller--frame'], className)}
      {...rest}
    >
      {children}
    </div>
  )),
  'TableScroller',
);

type Props = TableHTMLAttributes<HTMLTableElement> &
  Partial<{
    /**
     * Hücre dolgusu. Tablolar aynı iskeleti paylaşır ama yoğunlukları içeriğe
     * göre değişir: yüzlerce satırlık bir liste sıkı, karşılaştırma matrisi
     * ferah durur.
     */
    density: 'compact' | 'regular' | 'spacious';
    /**
     * Başlık satırı `$surface-2` zeminle kutunun içinde YAPIŞKAN kalır.
     * Zemin zorunlu: saydam başlığın arkasından kayan satırlar geçiyordu.
     * `top: 0` doğru olan — referans üst bant değil, tablonun kendi kaydırma
     * kutusu.
     */
    hasStickyHead: boolean;
    /** Satır hover zemini: çok sütunlu tabloda göz satırını kaybediyor. */
    hasRowHover: boolean;
  }>;

/** Temel tablo — hairline satır ayrımı, `$surface-2` başlık, yoğunluk ölçeği. */
const Table: FC<Props> = ({
  density = 'regular',
  hasStickyHead,
  hasRowHover,
  className,
  children,
  ...rest
}) => (
  <table
    className={cx(
      styles.table,
      styles[`table--${density}`],
      hasStickyHead && styles['table--sticky-head'],
      hasRowHover && styles['table--row-hover'],
      className,
    )}
    {...rest}
  >
    {children}
  </table>
);

export default /*#__PURE__*/ memo(Table) as typeof Table;
