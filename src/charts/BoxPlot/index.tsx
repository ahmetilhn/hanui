'use client';

import { memo, useCallback, useMemo } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { named } from '../../helpers/component.helper';
import { CategoryAxis, placeTicks, ValueAxis } from '../core/axes';
import ChartFrame from '../core/ChartFrame';
import { fullNumber, tickLabels, type ValueFormat } from '../core/format';
import { plotArea, tickCount } from '../core/margins';
import { type ChartTone, toneAt, toneColor } from '../core/palette';
import { niceDomain, scaleBand, scaleLinear, ticks } from '../core/scale';
import { type BoxStats, boxStats, extent } from '../core/stats';
import useChartWidth from '../core/useChartWidth';

import styles from './index.module.scss';

export type BoxPlotGroup = {
  id: string;
  label: string;
  /** Ham gözlemler — beş sayı özeti ve aykırılar bileşende hesaplanır (Tukey, 1,5 × IQR). */
  values: readonly number[];
  tone?: ChartTone;
};

/** Özetin okunan adları — metin kütüphaneden gelmez. */
export type BoxPlotLabels = {
  min: string;
  q1: string;
  median: string;
  q3: string;
  max: string;
  outliers: string;
  count: string;
};

type Props = {
  label: string;
  description?: string;
  groups: readonly BoxPlotGroup[];
  /** Grup ekseninin ve tablonun ilk sütun başlığı. */
  groupLabel: string;
  labels: BoxPlotLabels;
  height?: number;
  width?: number;
  formatValue?: ValueFormat;
  className?: string;
  testId?: string;
};

/**
 * Kutu grafiği — grupların dağılımını karşılaştırır: kutu Q1–Q3, çizgi medyan, bıyıklar 1,5 × IQR
 * içindeki en uç gözlem, dışarıdakiler nokta (aykırı).
 * ⚠ Bıyık ucu bir HESAP değil bir GÖZLEM: Q3 + 1,5 × IQR'ye kadar çizmek, verinin hiç ulaşmadığı
 * bir değeri gösterirdi.
 *
 * Klavye: `←`/`→` önceki/sonraki grup · `Home`/`End` · `Escape`.
 */
const BoxPlot = ({
  label,
  description,
  groups,
  groupLabel,
  labels: summaryLabels,
  height = 280,
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

  const stats = useMemo(
    () =>
      groups.map((group, index) => ({
        group,
        tone: toneAt(index, group.tone),
        stats: boxStats(group.values),
      })),
    [groups],
  );

  const geometry = useMemo(() => {
    const all = stats.flatMap(item => (item.stats ? [item.stats.min, item.stats.max] : []));
    const [low, high] = all.length ? extent(all) : [0, 1];
    const yDomain = niceDomain(low, high);
    const yTicks = ticks(yDomain[0], yDomain[1], tickCount(height, false));
    const area = plotArea(width, height, tickFormat(yTicks));
    const band = scaleBand(
      groups.map(group => group.id),
      [area.left, area.right],
      { paddingInner: 0.4, paddingOuter: 0.2 },
    );
    const y = scaleLinear(yDomain, [area.bottom, area.top]);

    return {
      area,
      band,
      y,
      yTicks: placeTicks(yTicks, y, tickFormat),
      groupTicks: groups.map(group => ({
        position: band(group.id) + band.bandwidth / 2,
        label: group.label,
      })),
    };
  }, [stats, groups, width, height, tickFormat]);

  const summary = (value: BoxStats) => [
    { id: 'max', label: summaryLabels.max, value: fv(value.whiskerHigh) },
    { id: 'q3', label: summaryLabels.q3, value: fv(value.q3) },
    { id: 'median', label: summaryLabels.median, value: fv(value.median) },
    { id: 'q1', label: summaryLabels.q1, value: fv(value.q1) },
    { id: 'min', label: summaryLabels.min, value: fv(value.whiskerLow) },
    ...(value.outliers.length > 0
      ? [{ id: 'outliers', label: summaryLabels.outliers, value: full(value.outliers.length) }]
      : []),
    { id: 'count', label: summaryLabels.count, value: full(value.count) },
  ];

  const plot = useMemo(() => {
    const { area, band, y } = geometry;

    return (
      <g>
        <ValueAxis area={area} ticks={geometry.yTicks} side="left" hasGrid />
        <CategoryAxis area={area} ticks={geometry.groupTicks} side="bottom" />
        {stats.map(({ group, tone, stats: value }) => {
          if (!value) return null;
          const left = band(group.id);
          const center = left + band.bandwidth / 2;
          const cap = band.bandwidth * 0.3;
          const color = toneColor(tone);

          return (
            <g key={group.id} style={{ stroke: color }} className={styles.box}>
              <line x1={center} x2={center} y1={y(value.whiskerHigh)} y2={y(value.q3)} />
              <line x1={center} x2={center} y1={y(value.q1)} y2={y(value.whiskerLow)} />
              <line
                x1={center - cap}
                x2={center + cap}
                y1={y(value.whiskerHigh)}
                y2={y(value.whiskerHigh)}
              />
              <line
                x1={center - cap}
                x2={center + cap}
                y1={y(value.whiskerLow)}
                y2={y(value.whiskerLow)}
              />
              <rect
                x={left}
                width={band.bandwidth}
                y={y(value.q3)}
                height={Math.max(1, y(value.q1) - y(value.q3))}
                rx={2}
                style={{ fill: `color-mix(in srgb, ${color} 22%, transparent)` }}
              />
              <line
                className={styles.median}
                x1={left}
                x2={left + band.bandwidth}
                y1={y(value.median)}
                y2={y(value.median)}
              />
              {value.outliers.map((outlier, index) => (
                <circle key={index} className={styles.outlier} cx={center} cy={y(outlier)} r={3} />
              ))}
            </g>
          );
        })}
      </g>
    );
  }, [geometry, stats]);

  const pick = useCallback(
    (px: number, py: number) => {
      const { area, band } = geometry;
      if (px < area.left || px > area.right || py < area.top - 4 || py > area.bottom + 4)
        return null;
      const index = band.indexAt(px);
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
        const { area, band } = geometry;
        const pad = band.step * 0.2;
        return (
          <rect
            className={styles.band}
            x={band(groups[index].id) - pad}
            width={band.bandwidth + pad * 2}
            y={area.top}
            height={area.height}
          />
        );
      }}
      overlay={() => null}
      itemCount={groups.length}
      pick={pick}
      tooltip={index => {
        const item = stats[index];
        return {
          title: item.group.label,
          rows: item.stats
            ? summary(item.stats).map(row => ({
                ...row,
                tone: row.id === 'median' ? item.tone : undefined,
              }))
            : [],
        };
      }}
      anchor={index => {
        const item = stats[index];
        const { band, y } = geometry;
        return {
          x: band(item.group.id) + band.bandwidth / 2,
          y: item.stats ? y(item.stats.q3) : geometry.area.bottom,
        };
      }}
      announce={index => {
        const item = stats[index];
        return item.stats
          ? `${item.group.label}: ${summary(item.stats)
              .map(row => `${row.label} ${row.value}`)
              .join(', ')}`
          : item.group.label;
      }}
      table={{
        columns: [
          groupLabel,
          summaryLabels.min,
          summaryLabels.q1,
          summaryLabels.median,
          summaryLabels.q3,
          summaryLabels.max,
          summaryLabels.count,
        ],
        rows: stats.map(({ group, stats: value }) =>
          value
            ? [
                group.label,
                fv(value.whiskerLow),
                fv(value.q1),
                fv(value.median),
                fv(value.q3),
                fv(value.whiskerHigh),
                full(value.count),
              ]
            : [group.label, '—', '—', '—', '—', '—', '0'],
        ),
      }}
      className={className}
      testId={testId}
    />
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(BoxPlot, 'BoxPlot')) as typeof BoxPlot;
