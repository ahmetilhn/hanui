'use client';

import { type FC, type ReactNode, memo, useEffect, useRef, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  children: ReactNode;
  /** Kaydırılabilir bölgenin erişilebilir adı. ZORUNLU. */
  label: string;
  /** Kaydırma yönü. `both` iki eksende de kaydırır. */
  axis?: 'vertical' | 'horizontal' | 'both';
  /** En fazla yükseklik — dikey kaydırmada zorunlu, yoksa kutu uzar gider. */
  maxHeight?: number | string;
  /** Kenarlarda içeriğin devam ettiğini gösteren solma. */
  hasFade?: boolean;
  className?: string;
  testId?: string;
};

/** Kaydırma kutusu — <strong>klavyeyle erişilebilir</strong> kaydırma bölgesi. */
const ScrollArea: FC<Props> = ({
  children,
  label,
  axis = 'vertical',
  maxHeight,
  hasFade,
  className,
  testId,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  /* Solmanin HANGI ucta cizilecegi: yalnizca o yonde gizli icerik varken. */
  const [hiddenEdges, setHiddenEdges] = useState({ start: false, end: false });

  /* TASMA OLCULUR, varsayilmaz. */
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const vertical = node.scrollHeight > node.clientHeight;
      const horizontal = node.scrollWidth > node.clientWidth;
      setIsScrollable(
        axis === 'horizontal'
          ? horizontal
          : axis === 'vertical'
            ? vertical
            : vertical || horizontal,
      );

      /* Solma tek eksende cizilir (`--fade` kurali `both`u kapsamiyor). */
      const isRow = axis === 'horizontal';
      const size = isRow ? node.clientWidth : node.clientHeight;
      const total = isRow ? node.scrollWidth : node.scrollHeight;
      /* RTL'de `scrollLeft` negatif olabiliyor; onemli olan UZAKLIK. */
      const offset = Math.abs(isRow ? node.scrollLeft : node.scrollTop);

      /* 1 px pay: kesirli yerlesimde `offset + size` toplami tam oturmuyor. */
      setHiddenEdges({ start: offset > 1, end: offset + size < total - 1 });
    };

    measure();

    /* Icerik DE kutu DA degisebiliyor: ikisi de izleniyor. */
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    for (const child of node.children) observer.observe(child);

    /* Kaydirma ucu degistiriyor; dinleyici `passive` — olcum cizimi bloklamaz. */
    node.addEventListener('scroll', measure, { passive: true });

    return () => {
      observer.disconnect();
      node.removeEventListener('scroll', measure);
    };
  }, [axis, children]);

  return (
    <div
      ref={ref}
      className={cx(
        styles.scrollArea,
        styles[`scrollArea--${axis}`],
        hasFade && styles['scrollArea--fade'],
        className,
      )}
      style={maxHeight === undefined ? undefined : { maxBlockSize: maxHeight }}
      /*
       * Solma UC BASINA ve YALNIZCA gizli icerik varken. Olcu CSS'te kaliyor;
       * buradan yalnizca "bu ucun otesinde bir sey var mi" bildiriliyor.
       */
      data-fade-start={hasFade && hiddenEdges.start ? '' : undefined}
      data-fade-end={hasFade && hiddenEdges.end ? '' : undefined}
      /*
       * Bolge YALNIZCA kaydirilabilirken odaklanabilir ve yalnizca o zaman bir
       * ROL tasiyor: sigmayan bir kutu bir "bolge" degil, siradan bir
       * sarmalayici.
       */
      tabIndex={isScrollable ? 0 : undefined}
      role={isScrollable ? 'region' : undefined}
      aria-label={isScrollable ? label : undefined}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ScrollArea, 'ScrollArea'),
) as typeof ScrollArea;
