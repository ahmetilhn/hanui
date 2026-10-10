'use client';

import { memo, useCallback, useMemo } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { named } from '../../helpers/component.helper';
import { placeTicks, ValueAxis } from '../core/axes';
import ChartFrame from '../core/ChartFrame';
import { fullNumber, tickLabels, type ValueFormat } from '../core/format';
import { plotArea, tickCount } from '../core/margins';
import { type ChartTone, toneColor } from '../core/palette';
import { niceDomain, scaleLinear, ticks } from '../core/scale';
import { histogram } from '../core/stats';
import useChartWidth from '../core/useChartWidth';

import styles from './index.module.scss';

type Props = {
  label: string;
  description?: string;
  /** Ham gözlemler; bölmeleri bileşen hesaplar. Sonlu olmayan değerler atılır. */
  values: readonly number[];
  /** Hedef bölme sayısı; verilmezse Sturges. Sınırlar "güzel" adıma oturur, sayı yaklaşık. */
  bins?: number;
  /** Değişkenin adı (x ekseni, tablo). */
  valueLabel: string;
  /** Sıklığın adı ("Sipariş sayısı"). */
  countLabel: string;
  tone?: ChartTone;
  height?: number;
  width?: number;
  formatValue?: ValueFormat;
  className?: string;
  testId?: string;
};

/** İki komşu sütun arası (px) — bölmeler ayrı okunur, sürekli dağılım izlenimi bozulmaz. */
const GAP = 1;

/**
 * Histogram — tek değişkenin dağılımı. x ekseni SÜREKLİ (bölme sınırları), sütunlar bitişik.
 * Bölme: `[alt, üst)`, son bölme üst ucu DAHİL eder (en büyük değer dışarıda kalmaz).
 *
 * Klavye: `←`/`→` önceki/sonraki bölme · `Home`/`End` · `Escape`.
 */
const Histogram = ({
  label,
  description,
  values,
  bins: binCount,
  valueLabel,
  countLabel,
  tone = 'cat-1',
  height = 260,
  width: fixedWidth,
  formatValue,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const [containerRef, width] = useChartWidth(fixedWidth);
  const full = useMemo(() => fullNumber(labels?.locale), [labels?.locale]);
  const tickFormat = useMemo(() => tickLabels(labels?.locale), [labels?.locale]);
  const fv = formatValue ?? full;

  const bins = useMemo(() => histogram(values, binCount), [values, binCount]);

  const geometry = useMemo(() => {
    const maxCount = Math.max(1, ...bins.map(bin => bin.count));
    const yDomain = niceDomain(0, maxCount);
    const yTicks = ticks(0, yDomain[1], tickCount(height, false)).filter(Number.isInteger);
    const area = plotArea(width, height, tickFormat(yTicks));
    const lower = bins[0]?.from ?? 0;
    const upper = bins[bins.length - 1]?.to ?? 1;
    const x = scaleLinear([lower, upper], [area.left, area.right]);
    const y = scaleLinear(yDomain, [area.bottom, area.top]);

    return {
      area,
      columns: bins.map(bin => ({
        x: x(bin.from) + GAP / 2,
        width: Math.max(1, x(bin.to) - x(bin.from) - GAP),
        y: y(bin.count),
        height: Math.max(0, area.bottom - y(bin.count)),
        center: (x(bin.from) + x(bin.to)) / 2,
      })),
      xTicks: placeTicks(ticks(lower, upper, tickCount(area.width, true)), x, tickFormat),
      yTicks: placeTicks(yTicks, y, tickFormat),
    };
  }, [bins, width, height, tickFormat]);

  const range = (index: number) => `${fv(bins[index].from)} – ${fv(bins[index].to)}`;

  const plot = useMemo(
    () => (
      <g>
        <ValueAxis area={geometry.area} ticks={geometry.yTicks} side="left" hasGrid />
        <ValueAxis area={geometry.area} ticks={geometry.xTicks} side="bottom" />
        <line
          className={styles.baseline}
          x1={geometry.area.left}
          x2={geometry.area.right}
          y1={geometry.area.bottom}
          y2={geometry.area.bottom}
        />
        {geometry.columns.map((column, index) =>
          column.height > 0 ? (
            <rect
              key={index}
              x={column.x}
              y={column.y}
              width={column.width}
              height={column.height}
              style={{ fill: toneColor(tone) }}
            />
          ) : null,
        )}
      </g>
    ),
    [geometry, tone],
  );

  const pick = useCallback(
    (px: number, py: number) => {
      const { area, columns } = geometry;
      if (px < area.left || px > area.right || py < area.top - 4 || py > area.bottom + 4)
        return null;
      const index = columns.findIndex(
        column => px >= column.x - GAP && px <= column.x + column.width + GAP,
      );
      return index < 0 ? null : index;
    },
    [geometry],
  );

  return (
    <ChartFrame
      label={label}
      description={description}
      containerRef={containerRef}
      width={width}
      height={height}
      plot={plot}
      underlay={index => {
        const column = geometry.columns[index];
        return (
          <rect
            className={styles.band}
            x={column.x - GAP / 2}
            width={column.width + GAP}
            y={geometry.area.top}
            height={geometry.area.height}
          />
        );
      }}
      overlay={() => null}
      itemCount={bins.length}
      pick={pick}
      tooltip={index => ({
        title: range(index),
        rows: [{ id: 'count', label: countLabel, value: full(bins[index].count), tone }],
      })}
      anchor={index => ({ x: geometry.columns[index].center, y: geometry.columns[index].y })}
      announce={index => `${valueLabel} ${range(index)}: ${countLabel} ${full(bins[index].count)}`}
      table={{
        columns: [valueLabel, countLabel],
        rows: bins.map((bin, index) => [range(index), full(bin.count)]),
      }}
      className={className}
      testId={testId}
    />
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Histogram, 'Histogram')) as typeof Histogram;
