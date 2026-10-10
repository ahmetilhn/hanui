'use client';

import { memo, useCallback, useMemo, useState } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { named } from '../../helpers/component.helper';
import { ValueAxis } from '../core/axes';
import ChartFrame from '../core/ChartFrame';
import { compactNumber, fullNumber, type ValueFormat } from '../core/format';
import { plotArea, tickCount } from '../core/margins';
import { type ChartTone, toneAt, toneColor } from '../core/palette';
import { niceDomain, scaleLinear, ticks } from '../core/scale';
import { spatialIndex } from '../core/spatial';
import { extent, finite } from '../core/stats';
import useChartWidth from '../core/useChartWidth';

import styles from './index.module.scss';

export type ScatterPoint = {
  x: number;
  y: number;
  /** Balon grafiği: noktanın büyüklüğü (alanla orantılı). */
  size?: number;
  /** Noktanın adı (ipucu ve tablo). */
  label?: string;
};

export type ScatterSeries = {
  id: string;
  label: string;
  tone?: ChartTone;
  data: readonly ScatterPoint[];
};

type Props = {
  label: string;
  description?: string;
  series: readonly ScatterSeries[];
  /** Eksen ve tablo başlıkları. */
  xLabel: string;
  yLabel: string;
  /** Balon grafiğinde büyüklüğün adı ("Nüfus"); verilmezse ipucunda büyüklük satırı yok. */
  sizeLabel?: string;
  height?: number;
  width?: number;
  formatX?: ValueFormat;
  formatY?: ValueFormat;
  className?: string;
  testId?: string;
};

/** Noktanın yarıçapı (px): boyutsuz 4; balonda 3-16, alanla orantılı (karekök ölçek). */
const RADIUS = { plain: 4, min: 3, max: 16 };
/** İşaretçinin noktayı "yakaladığı" uzaklık (px) — parmakla da isabet ettirilebilsin. */
const HIT_RADIUS = 22;

/**
 * Saçılım grafiği — iki sayısal değişkenin ilişkisi; `size` ile balon grafiği.
 * İsabet: mekânsal kova (her harekette tüm noktalar taranmaz). Klavye noktaları x sırasıyla gezer.
 *
 * Klavye: `←`/`→` önceki/sonraki nokta · `Home`/`End` · `Escape`.
 */
const ScatterPlot = ({
  label,
  description,
  series,
  xLabel,
  yLabel,
  sizeLabel,
  height = 300,
  width: fixedWidth,
  formatX,
  formatY,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const [containerRef, width] = useChartWidth(fixedWidth);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const full = useMemo(() => fullNumber(labels?.locale), [labels?.locale]);
  const compact = useMemo(() => compactNumber(labels?.locale), [labels?.locale]);
  const fx = formatX ?? full;
  const fy = formatY ?? full;

  const toned = useMemo(
    () => series.map((item, index) => ({ ...item, tone: toneAt(index, item.tone) })),
    [series],
  );

  /* Düz nokta listesi — x sırasıyla (klavye sırası soldan sağa). */
  const flat = useMemo(
    () =>
      toned
        .filter(item => !hidden.has(item.id))
        .flatMap(item =>
          item.data
            .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
            .map(point => ({ ...point, series: item })),
        )
        .sort((a, b) => a.x - b.x || a.y - b.y),
    [toned, hidden],
  );

  const geometry = useMemo(() => {
    const xDomain = niceDomain(...extent(flat.map(point => point.x)));
    const yDomain = niceDomain(...extent(flat.map(point => point.y)));
    const yTicks = ticks(yDomain[0], yDomain[1], tickCount(height, false));
    const area = plotArea(width, height, yTicks.map(compact), { right: 20 });
    const x = scaleLinear(xDomain, [area.left, area.right]);
    const y = scaleLinear(yDomain, [area.bottom, area.top]);

    const sizes = finite(flat.map(point => point.size));
    const [sizeMin, sizeMax] = extent(sizes);
    const radius = (size?: number) =>
      size === undefined || !Number.isFinite(size) || sizes.length === 0
        ? RADIUS.plain
        : sizeMax === sizeMin
          ? (RADIUS.min + RADIUS.max) / 2
          : Math.sqrt(
              RADIUS.min ** 2 +
                ((size - sizeMin) / (sizeMax - sizeMin)) * (RADIUS.max ** 2 - RADIUS.min ** 2),
            );

    const placed = flat.map(point => ({
      ...point,
      cx: x(point.x),
      cy: y(point.y),
      r: radius(point.size),
    }));

    return {
      area,
      placed,
      index: spatialIndex(placed.map(point => ({ x: point.cx, y: point.cy }))),
      xTicks: ticks(xDomain[0], xDomain[1], tickCount(area.width, true)).map(value => ({
        position: x(value),
        label: compact(value),
      })),
      yTicks: yTicks.map(value => ({ position: y(value), label: compact(value) })),
    };
  }, [flat, width, height, compact]);

  const plot = useMemo(
    () => (
      <g>
        <ValueAxis area={geometry.area} ticks={geometry.yTicks} side="left" hasGrid />
        <ValueAxis area={geometry.area} ticks={geometry.xTicks} side="bottom" hasGrid />
        {geometry.placed.map((point, index) => (
          <circle
            key={index}
            className={styles.point}
            cx={point.cx}
            cy={point.cy}
            r={point.r}
            style={{
              fill: `color-mix(in srgb, ${toneColor(point.series.tone)} 72%, transparent)`,
              stroke: toneColor(point.series.tone),
            }}
          />
        ))}
      </g>
    ),
    [geometry],
  );

  const pick = useCallback(
    (px: number, py: number) => geometry.index.nearest(px, py, HIT_RADIUS),
    [geometry],
  );

  const describe = (index: number) => {
    const point = geometry.placed[index];
    return {
      title: point.label ?? point.series.label,
      rows: [
        { id: 'series', label: point.series.label, value: '', tone: point.series.tone },
        { id: 'x', label: xLabel, value: fx(point.x) },
        { id: 'y', label: yLabel, value: fy(point.y) },
        ...(point.size !== undefined && sizeLabel
          ? [{ id: 'size', label: sizeLabel, value: full(point.size) }]
          : []),
      ],
    };
  };

  return (
    <ChartFrame
      label={label}
      description={description}
      containerRef={containerRef}
      width={width}
      height={height}
      plot={plot}
      overlay={index => {
        const point = geometry.placed[index];
        return (
          <circle
            className={styles.marker}
            cx={point.cx}
            cy={point.cy}
            r={point.r + 3}
            style={{ stroke: toneColor(point.series.tone) }}
          />
        );
      }}
      itemCount={geometry.placed.length}
      pick={pick}
      tooltip={describe}
      anchor={index => ({ x: geometry.placed[index].cx, y: geometry.placed[index].cy })}
      announce={index => {
        const point = geometry.placed[index];
        return `${point.label ? `${point.label}, ` : ''}${point.series.label}: ${xLabel} ${fx(point.x)}, ${yLabel} ${fy(point.y)}`;
      }}
      table={{
        columns: [label, xLabel, yLabel],
        rows: flat.map(point => [point.label ?? point.series.label, fx(point.x), fy(point.y)]),
      }}
      legend={{
        entries: toned.map(item => ({ id: item.id, label: item.label, tone: item.tone })),
        hidden,
        onToggle: id =>
          setHidden(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else if (toned.length - current.size > 1) next.add(id);
            return next;
          }),
      }}
      className={className}
      testId={testId}
    />
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ScatterPlot, 'ScatterPlot'),
) as typeof ScatterPlot;
