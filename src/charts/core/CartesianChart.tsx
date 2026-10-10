'use client';

import { memo, useCallback, useMemo, useState } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { CategoryAxis, ValueAxis } from './axes';
import { type CartesianSeries, cartesianGeometry, type Orientation, toNumber } from './cartesian';
import ChartFrame from './ChartFrame';
import { fullNumber, tickLabels, type ValueFormat } from './format';
import { toneAt, toneColor } from './palette';
import type { Curve } from './path';
import { nearestIndex } from './scale';
import type { TooltipContent } from './types';
import useChartWidth from './useChartWidth';

import styles from './CartesianChart.module.scss';

/** Veri satırı — x alanı ve seri alanları; eksik değer `null`. */
export type ChartRow = Record<string, string | number | null | undefined>;

export type CartesianChartProps = {
  /** Grafiğin okunan adı. */
  label: string;
  /** Okunan ek açıklama — eğilimi bir cümleyle söyler. */
  description?: string;
  data: readonly ChartRow[];
  /** Satırdaki x alanının adı. */
  xKey: string;
  /** Veri tablosunun ilk sütun başlığı; verilmezse `xKey`. */
  xLabel?: string;
  series: readonly (CartesianSeries & { format?: ValueFormat })[];
  /** Yükseklik (px). Genişlik kapsayıcıdan ölçülür. */
  height?: number;
  /** Sabit genişlik (px) — ölçüm yapılmaz. */
  width?: number;
  isStacked?: boolean;
  orientation?: Orientation;
  curve?: Curve;
  /** Çizgi üzerinde her veri noktası. Çok noktalı seride kapalı tutun. */
  hasPoints?: boolean;
  /** x değerinin yazısı (eksen, ipucu, tablo). */
  formatX?: (value: string | number) => string;
  /** Değerin yazısı (ipucu, tablo); seri kendi `format`ını verebilir. Eksen kısa gösterimde. */
  formatValue?: ValueFormat;
  /** Sol değer ekseninin sabit uçları. */
  domain?: readonly [number | undefined, number | undefined];
  className?: string;
  testId?: string;
};

const DEFAULT_HEIGHT = 280;
const MISSING = '—';

/**
 * Kartezyen grafik — Çizgi, Alan, Çubuk ve Bileşik grafiğin ortak gövdesi. Dışa `LineChart`,
 * `AreaChart`, `BarChart`, `ComposedChart` olarak verilir.
 */
const CartesianChart = ({
  label,
  description,
  data,
  xKey,
  xLabel,
  series,
  height = DEFAULT_HEIGHT,
  width: fixedWidth,
  isStacked = false,
  orientation = 'vertical',
  curve = 'monotone',
  hasPoints = false,
  formatX = String,
  formatValue,
  domain,
  className,
  testId,
}: CartesianChartProps) => {
  const { labels } = useHanui();
  const locale = labels?.locale;
  const [containerRef, width] = useChartWidth(fixedWidth);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const valueFormat = useMemo(() => formatValue ?? fullNumber(locale), [formatValue, locale]);
  const axisFormat = useMemo(() => tickLabels(locale), [locale]);
  const formatXValue = useCallback(
    (value: unknown) =>
      value === null || value === undefined ? '' : formatX(value as string | number),
    [formatX],
  );

  /* Ton seri SIRASINDAN gelir: bir seri gizlenince diğerlerinin rengi değişmez. */
  const toned = useMemo(
    () => series.map((item, index) => ({ ...item, tone: toneAt(index, item.tone) })),
    [series],
  );
  const visible = useMemo(() => toned.filter(item => !hidden.has(item.key)), [toned, hidden]);

  const geometry = useMemo(
    () =>
      cartesianGeometry({
        rows: data,
        xKey,
        series: visible,
        width,
        height,
        isStacked,
        orientation,
        curve,
        formatX: formatXValue,
        formatLeft: axisFormat,
        formatRight: axisFormat,
        domain,
      }),
    [
      data,
      xKey,
      visible,
      width,
      height,
      isStacked,
      orientation,
      curve,
      formatXValue,
      axisFormat,
      domain,
    ],
  );

  const isHorizontal =
    orientation === 'horizontal' &&
    visible.length > 0 &&
    visible.every(item => item.type === 'bar');
  /* Vurgu biçimi: çubukta kategorinin BANDI, çizgi/alanda dikey kılavuz çizgi. Kategorik x'li çizgide de
     bant genişliği sıfırdan büyük; vurguyu bant genişliğine değil çubuğun varlığına bağlamak gerekiyordu. */
  const hasBars = visible.some(item => item.type === 'bar');

  /* İsabet: kategori ekseninde en yakın merkez (sıralı dizide ikili arama). */
  const sorted = useMemo(() => {
    const order = geometry.centers
      .map((center, index) => ({ center, index }))
      .sort((a, b) => a.center - b.center);
    return { centers: order.map(item => item.center), indices: order.map(item => item.index) };
  }, [geometry.centers]);

  const pick = useCallback(
    (x: number, y: number) => {
      const { area } = geometry;
      if (x < area.left - 4 || x > area.right + 4 || y < area.top - 4 || y > area.bottom + 4)
        return null;
      const position = nearestIndex(sorted.centers, isHorizontal ? y : x);
      return position < 0 ? null : sorted.indices[position];
    },
    [geometry, sorted, isHorizontal],
  );

  const tooltip = useCallback(
    (index: number): TooltipContent => ({
      title: formatXValue(data[index]?.[xKey]),
      rows: visible.map(item => {
        const value = toNumber(data[index]?.[item.key]);
        return {
          id: item.key,
          label: item.label,
          tone: item.tone,
          value: value === null ? MISSING : (item.format ?? valueFormat)(value),
        };
      }),
    }),
    [data, xKey, visible, valueFormat, formatXValue],
  );

  const announce = useCallback(
    (index: number) => {
      const content = tooltip(index);
      return `${content.title}: ${content.rows.map(row => `${row.label} ${row.value}`).join(', ')}`;
    },
    [tooltip],
  );

  const table = useMemo(
    () => ({
      columns: [xLabel ?? xKey, ...toned.map(item => item.label)],
      rows: data.map(row => [
        formatXValue(row[xKey]),
        ...toned.map(item => {
          const value = toNumber(row[item.key]);
          return value === null ? MISSING : (item.format ?? valueFormat)(value);
        }),
      ]),
    }),
    [data, xKey, xLabel, toned, valueFormat, formatXValue],
  );

  const plot = useMemo(
    () => (
      <g>
        {isHorizontal ? (
          <>
            <ValueAxis area={geometry.area} ticks={geometry.leftTicks} side="bottom" hasGrid />
            <CategoryAxis area={geometry.area} ticks={geometry.categoryTicks} side="left" />
          </>
        ) : (
          <>
            <ValueAxis area={geometry.area} ticks={geometry.leftTicks} side="left" hasGrid />
            {geometry.hasRightAxis && (
              <ValueAxis area={geometry.area} ticks={geometry.rightTicks} side="right" />
            )}
            <CategoryAxis area={geometry.area} ticks={geometry.categoryTicks} side="bottom" />
          </>
        )}

        {/* Eksi değerli grafikte sıfır çizgisi: çubuklar oradan başlıyor, eksenin ucundan değil. */}
        {geometry.zero !== null &&
          (isHorizontal ? (
            <line
              className={styles.zero}
              x1={geometry.zero}
              x2={geometry.zero}
              y1={geometry.area.top}
              y2={geometry.area.bottom}
            />
          ) : (
            <line
              className={styles.zero}
              x1={geometry.area.left}
              x2={geometry.area.right}
              y1={geometry.zero}
              y2={geometry.zero}
            />
          ))}

        {geometry.areas.map(shape => (
          <path
            key={`area-${shape.key}`}
            d={shape.d}
            className={styles.area}
            style={{ fill: `color-mix(in srgb, ${toneColor(shape.tone)} 18%, transparent)` }}
          />
        ))}

        {geometry.bars.map(bar => (
          <rect
            key={`bar-${bar.key}-${bar.index}`}
            className={styles.bar}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={Math.min(3, bar.width / 4, bar.height / 4)}
            style={{ fill: toneColor(bar.tone) }}
          />
        ))}

        {geometry.lines.map(shape => (
          <path
            key={`line-${shape.key}`}
            d={shape.d}
            className={styles.line}
            style={{ stroke: toneColor(shape.tone) }}
          />
        ))}

        {/*
         * İki boşluk arasında kalan TEK değer çizgi üretmez (tek noktalı yol görünmez) — `hasPoints`
         * kapalıyken de işaretle çizilir; yoksa veri vardı ama grafikte yoktu.
         */}
        {visible
          .filter(item => item.type !== 'bar')
          .flatMap(item =>
            (geometry.points[item.key] ?? []).map((point, index, list) =>
              point && (hasPoints || (!list[index - 1] && !list[index + 1])) ? (
                <circle
                  key={`point-${item.key}-${index}`}
                  className={styles.point}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  style={{ fill: toneColor(item.tone) }}
                />
              ) : null,
            ),
          )}
      </g>
    ),
    [geometry, hasPoints, isHorizontal, visible],
  );

  const underlay = useCallback(
    (index: number) => {
      if (!hasBars || geometry.bandwidth <= 0) return null;
      const { area } = geometry;
      const center = geometry.centers[index];
      const pad = geometry.bandwidth * 0.12;

      return isHorizontal ? (
        <rect
          className={styles.band}
          x={area.left}
          width={area.width}
          y={center - geometry.bandwidth / 2 - pad}
          height={geometry.bandwidth + pad * 2}
        />
      ) : (
        <rect
          className={styles.band}
          y={area.top}
          height={area.height}
          x={center - geometry.bandwidth / 2 - pad}
          width={geometry.bandwidth + pad * 2}
        />
      );
    },
    [geometry, isHorizontal, hasBars],
  );

  const overlay = useCallback(
    (index: number) => {
      const { area } = geometry;
      const center = geometry.centers[index];

      return (
        <>
          {!hasBars && (
            <line
              className={styles.crosshair}
              x1={center}
              x2={center}
              y1={area.top}
              y2={area.bottom}
            />
          )}
          {visible
            .filter(item => item.type !== 'bar')
            .map(item => {
              const point = geometry.points[item.key]?.[index];
              return point ? (
                <circle
                  key={item.key}
                  className={styles.marker}
                  cx={point.x}
                  cy={point.y}
                  r={4.5}
                  style={{ fill: toneColor(item.tone) }}
                />
              ) : null;
            })}
        </>
      );
    },
    [geometry, visible, hasBars],
  );

  return (
    <ChartFrame
      label={label}
      description={description}
      containerRef={containerRef}
      width={width}
      height={height}
      plot={plot}
      overlay={overlay}
      underlay={underlay}
      itemCount={data.length}
      pick={pick}
      tooltip={tooltip}
      anchor={index => geometry.anchors[index] ?? { x: 0, y: 0 }}
      announce={announce}
      table={table}
      legend={{
        entries: toned.map(item => ({ id: item.key, label: item.label, tone: item.tone })),
        hidden,
        onToggle: id =>
          setHidden(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            /* Son görünür seri gizlenmez: boş bir grafik bir şey göstermez, geri getirmek de zorlaşır. */
            else if (toned.length - current.size > 1) next.add(id);
            return next;
          }),
      }}
      className={className}
      testId={testId}
    />
  );
};

export default memo(CartesianChart) as typeof CartesianChart;
