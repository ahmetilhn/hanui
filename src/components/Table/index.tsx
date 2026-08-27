'use client';

import {
  type FC,
  type HTMLAttributes,
  memo,
  type TableHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type ScrollerProps = HTMLAttributes<HTMLDivElement> & {
  /** Çerçeve (hairline + yarıçap + yüzey). */
  hasFrame?: boolean;
  /**
   * Kaydırma bölgesinin erişilebilir adı ("Sipariş kalemleri").
   * ⚠ ZORUNLU değil ama VERİLMELİ: kutu klavyeyle odaklanabilir bir `region` ve adsız bir bölge
   * ekran okuyucuda yalnızca "bölge" diye okunur
   */
  label?: string;
};

/**
 * Tablo kaydırma kutusu — "tablo kendi kutusunda kayar, sayfa asla yatay kaymaz" kuralının tek
 * uygulaması.
 */
export const TableScroller: FC<ScrollerProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ hasFrame = true, label, className, children, ...rest }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = useState(false);

    /*
     * Kutu `overflow: auto` taşıyor ve klavye kullanıcısı odaklanamadığı bir kutuyu KAYDIRAMAZ
     * (WCAG 2.1.1) — o yüzden kaydırılabilirken ikisi de ZORUNLU.
     * ⚠ `tabIndex` + `role` YALNIZCA GERÇEKTEN KAYABİLEN kutuda.
     */
    useEffect(() => {
      const node = ref.current;
      /* `ScrollArea` ile aynı koruma: jsdom `ResizeObserver` sağlamıyor. */
      if (!node || typeof ResizeObserver === 'undefined') return;

      const measure = () => setIsScrollable(node.scrollWidth > node.clientWidth + 1);

      measure();

      /* İçerik DE kutu DA değişebiliyor: ikisi de izleniyor. */
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      for (const child of node.children) observer.observe(child);

      return () => observer.disconnect();
    }, [children]);

    return (
      <div
        ref={ref}
        tabIndex={isScrollable ? 0 : undefined}
        role={isScrollable ? 'region' : undefined}
        aria-label={isScrollable ? label : undefined}
        className={cx(styles.scroller, hasFrame && styles['scroller--frame'], className)}
        {...rest}
      >
        {children}
      </div>
    );
  }),
  'TableScroller',
);

type Props = TableHTMLAttributes<HTMLTableElement> &
  Partial<{
    /** Hücre dolgusu. */
    density: 'compact' | 'regular' | 'spacious';
    /** Başlık satırı `$surface-2` zeminle kutunun içinde YAPIŞKAN kalır. */
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
