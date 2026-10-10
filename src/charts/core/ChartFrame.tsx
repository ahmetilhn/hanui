'use client';

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useAnnounce } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';

import { type ChartTone, toneColor } from './palette';
import type { ChartTable, LegendEntry, TooltipContent } from './types';

import styles from './ChartFrame.module.scss';

export type ChartFrameProps = {
  /** Grafiğin okunan adı. */
  label: string;
  /** Okunan ek açıklama — eğilimi bir cümleyle söyler ("Ekimde %12 artış"). */
  description?: string;
  containerRef: RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
  /** Ağır çizim — BELLEĞE ALINMIŞ öğe; üzerine gelindiğinde yeniden çizilmez. */
  plot: ReactNode;
  /** Etkin öğenin vurgusu (kılavuz çizgi, halka, nokta) — çizimin ÜSTÜNDE. */
  overlay: (active: number) => ReactNode;
  /** Çizimin ALTINDAKİ vurgu (çubuk bandının zemini): üstte olsaydı çubuğun rengini değiştirirdi. */
  underlay?: (active: number) => ReactNode;
  /** Klavye ve işaretçiyle gezilen öğe sayısı. */
  itemCount: number;
  /** Izgarada gezinme (ısı haritası): satır uzunluğu. Verilirse ↑/↓ satır atlar. */
  columns?: number;
  /** İşaretçi → öğe; isabet yoksa `null`. Koordinatlar çizim kutusuna göre. */
  pick: (x: number, y: number) => number | null;
  tooltip: (index: number) => TooltipContent;
  /** İpucunun bağlandığı nokta. */
  anchor: (index: number) => { x: number; y: number };
  /**
   * İpucunun noktanın hangi yanında açılacağı. `inward` (kartezyen): merkeze bakan yan — kenardaki
   * nokta ipucunu kutunun dışına itmez. `outward` (pasta, radar): merkezden uzak yan — içeride
   * çizimin kendisini (halkanın ortasındaki toplamı) örtüyordu. `inward` sığmayınca öteki yana
   * çevrilir, `outward` kutunun kenarına kırpılır.
   */
  tooltipSide?: 'inward' | 'outward';
  /** Klavyeyle gelinen öğenin okunan özeti. */
  announce: (index: number) => string;
  table: ChartTable;
  legend?: {
    entries: LegendEntry[];
    hidden: ReadonlySet<string>;
    onToggle: (id: string) => void;
  };
  className?: string;
  testId?: string;
};

/** İpucunun işaretçiden uzaklığı (px). */
const TOOLTIP_GAP = 12;

/**
 * Grafik çerçevesi — ölçüm kutusu, SVG, ipucu, lejant ve gizli veri tablosu.
 *
 * Klavye (grafik tek bir sekme durağı): `→`/`↓` sonraki öğe · `←`/`↑` önceki öğe (ızgarada `↑`/`↓`
 * satır) · `Home`/`End` ilk/son · `Escape` vurguyu kaldırır. Gelinen öğe duyurulur.
 * İşaretçi: tek bir dinleyici, kare başına bir isabet hesabı (`requestAnimationFrame`).
 */
const ChartFrame = ({
  label,
  description,
  containerRef,
  width,
  height,
  plot,
  overlay,
  underlay,
  itemCount,
  columns,
  pick,
  tooltip,
  anchor,
  tooltipSide = 'inward',
  announce,
  table,
  legend,
  className,
  testId,
}: ChartFrameProps) => {
  const descriptionId = useId();
  const say = useAnnounce();
  const [active, setActive] = useState<number | null>(null);
  const frame = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);

  /* Veri değişip öğe sayısı küçülürse vurgu dışarıda kalmasın. */
  useEffect(() => {
    if (active !== null && active >= itemCount) setActive(itemCount > 0 ? itemCount - 1 : null);
  }, [active, itemCount]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const box = event.currentTarget.getBoundingClientRect();
      pending.current = { x: event.clientX - box.left, y: event.clientY - box.top };
      if (frame.current !== null) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const point = pending.current;
        if (point) setActive(pick(point.x, point.y));
      });
    },
    [pick],
  );

  const move = (next: number) => {
    const clamped = Math.min(itemCount - 1, Math.max(0, next));
    setActive(clamped);
    say(announce(clamped));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (itemCount === 0) return;
    const current = active ?? -1;
    const row = columns ?? 1;

    const next =
      event.key === 'ArrowRight'
        ? current + 1
        : event.key === 'ArrowLeft'
          ? Math.max(0, current - 1)
          : event.key === 'ArrowDown'
            ? current < 0
              ? 0
              : current + row
            : event.key === 'ArrowUp'
              ? Math.max(0, current - row)
              : event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? itemCount - 1
                  : null;

    if (event.key === 'Escape' && active !== null) {
      event.preventDefault();
      setActive(null);
      return;
    }

    if (next === null) return;
    event.preventDefault();
    move(next);
  };

  const content = active === null ? null : tooltip(active);
  const point = active === null ? null : anchor(active);
  const pointX = point?.x;

  /*
   * Yatay konum ÖLÇÜLEREK yazılır: ipucunun genişliği içeriğe bağlı ve ancak çizildikten sonra
   * biliniyor. Tercih edilen yan sığmazsa öteki yana, ikisi de sığmazsa kutunun içine kırpılır —
   * ipucu kutudan taşıp dar ekranda yatay kaydırma açmaz. Boyamadan ÖNCE çalışır, sıçrama görünmez.
   * ⚠ Fiziksel `left`: SVG koordinatları RTL'de aynalanmaz, mantıksal özellik ipucunu ters yana atardı.
   */
  useLayoutEffect(() => {
    const node = tooltipRef.current;
    if (!node || pointX === undefined) return;

    const size = node.offsetWidth;
    const isRightHalf = pointX > width / 2;
    const prefersLeft = tooltipSide === 'outward' ? !isRightHalf : isRightHalf;
    const leftX = pointX - TOOLTIP_GAP - size;
    const rightX = pointX + TOOLTIP_GAP;
    const fitsLeft = leftX >= 0;
    const fitsRight = rightX + size <= width;
    /*
     * Radyal grafikte ÇEVRİLMEZ, kenara kırpılır: öteki yan grafiğin merkezi — sığmayan birkaç
     * piksel için ipucu halkanın ortasındaki toplamın üstüne atlıyordu (ölçüldü: 10 px eksik).
     */
    const x =
      tooltipSide === 'outward'
        ? prefersLeft
          ? leftX
          : rightX
        : prefersLeft
          ? fitsLeft || !fitsRight
            ? leftX
            : rightX
          : fitsRight || !fitsLeft
            ? rightX
            : leftX;

    node.style.left = `${Math.min(Math.max(0, x), Math.max(0, width - size))}px`;
  }, [active, pointX, width, tooltipSide]);

  return (
    <figure className={cx(styles.chart, className)} data-testid={testId}>
      <div ref={containerRef} className={styles.chart__canvas} style={{ blockSize: height }}>
        <svg
          className={styles.chart__svg}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={label}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={itemCount > 0 ? 0 : undefined}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={handleKeyDown}
          onBlur={() => setActive(null)}
        >
          {active !== null && underlay && (
            <g className={styles.chart__overlay}>{underlay(active)}</g>
          )}
          {plot}
          {active !== null && <g className={styles.chart__overlay}>{overlay(active)}</g>}
        </svg>

        {content && point && (
          /* Okunan karşılığı duyuru ve tablo; ipucu yalnızca görsel. */
          <div
            ref={tooltipRef}
            aria-hidden
            className={styles.chart__tooltip}
            /* Noktanın YANINDA, dikey ortalı: noktayı ve kılavuz çizgiyi örtmez. */
            style={{ insetBlockStart: Math.max(24, Math.min(point.y, height - 24)) }}
          >
            {content.title && <span className={styles.chart__tooltipTitle}>{content.title}</span>}
            {content.rows.map(row => (
              <span key={row.id} className={styles.chart__tooltipRow}>
                {row.tone && (
                  <span
                    className={styles.chart__swatch}
                    style={{ backgroundColor: toneColor(row.tone) }}
                  />
                )}
                <span className={styles.chart__tooltipLabel}>{row.label}</span>
                <span className={styles.chart__tooltipValue}>{row.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {legend && legend.entries.length > 1 && (
        <ul className={styles.chart__legend}>
          {legend.entries.map(entry => {
            const isHidden = legend.hidden.has(entry.id);
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={cx(
                    styles.chart__legendItem,
                    isHidden && styles['chart__legendItem--hidden'],
                  )}
                  aria-pressed={!isHidden}
                  onClick={() => legend.onToggle(entry.id)}
                >
                  <LegendSwatch tone={entry.tone} isHidden={isHidden} />
                  {entry.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {description && (
        <p id={descriptionId} className={styles.chart__srOnly}>
          {description}
        </p>
      )}

      {/*
       * Gizleme bir KAPTA: `<table>` `width: 1px` ve `overflow: hidden`ı yok sayıp içeriği kadar
       * genişliyor — dar ekranda sayfaya görünmez bir yatay kaydırma açıyordu (ölçüldü: 390 px
       * görünümde ısı haritasının tablosu 424 px).
       */}
      <div className={styles.chart__srOnly}>
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th key={index} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIndex}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
};

/** Gizli seri: içi BOŞ kare — renk tek başına durum taşımaz, biçim de değişir. */
const LegendSwatch = ({ tone, isHidden }: { tone: ChartTone; isHidden: boolean }) => (
  <span
    aria-hidden
    className={styles.chart__swatch}
    style={
      isHidden
        ? { backgroundColor: 'transparent', boxShadow: `inset 0 0 0 2px ${toneColor(tone)}` }
        : { backgroundColor: toneColor(tone) }
    }
  />
);

export default ChartFrame;
