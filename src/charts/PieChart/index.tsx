'use client';

import { memo, useCallback, useMemo, useState } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { named } from '../../helpers/component.helper';
import ChartFrame from '../core/ChartFrame';
import { fullNumber, type ValueFormat } from '../core/format';
import { type ChartTone, toneAt, toneColor } from '../core/palette';
import { arcPath, polar } from '../core/path';
import useChartWidth from '../core/useChartWidth';

import styles from './index.module.scss';

export type PieSlice = {
  id: string;
  label: string;
  value: number;
  tone?: ChartTone;
};

type Props = {
  label: string;
  description?: string;
  data: readonly PieSlice[];
  /** `donut` ortası boş halka; ortaya `centerLabel` / `centerValue` yazılır. */
  variant?: 'pie' | 'donut';
  /** Halkanın ortasındaki büyük değer (toplam); verilmezse görünür dilimlerin toplamı. */
  centerValue?: string;
  /** Halkanın ortasındaki küçük yazı ("Toplam"). */
  centerLabel?: string;
  /** Değerin adı (tablo sütunu). */
  valueLabel: string;
  height?: number;
  width?: number;
  formatValue?: ValueFormat;
  className?: string;
  testId?: string;
};

/** Etkin dilimin dışarı kayması (px). */
const LIFT = 6;
/** Dilimler arası ince ayırıcı: aynı aydınlıkta iki komşu ton tek renk gibi okunmasın. */
const SEPARATOR = 1.5;

/**
 * Pasta / halka grafiği — bir bütünün parçaları. Dilim sırası verinin sırası (saat 12'den, saat
 * yönünde). Sıfır ve eksi değer dilim açmaz (bütünün parçası olamaz); tabloda görünür.
 * ⚠ Altıdan çok dilim okunmaz — kategorik palet altı tonda döner; uzun kuyruğu "Diğer"de toplayın.
 *
 * Klavye: `←`/`→` önceki/sonraki dilim · `Home`/`End` · `Escape`.
 */
const PieChart = ({
  label,
  description,
  data,
  variant = 'donut',
  centerValue,
  centerLabel,
  valueLabel,
  height = 260,
  width: fixedWidth,
  formatValue,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const [containerRef, width] = useChartWidth(fixedWidth);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const full = useMemo(() => fullNumber(labels?.locale), [labels?.locale]);
  const fv = formatValue ?? full;

  const toned = useMemo(
    () => data.map((slice, index) => ({ ...slice, tone: toneAt(index, slice.tone) })),
    [data],
  );

  const geometry = useMemo(() => {
    const visible = toned.filter(
      slice => !hidden.has(slice.id) && Number.isFinite(slice.value) && slice.value > 0,
    );
    const total = visible.reduce((sum, slice) => sum + slice.value, 0);
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.max(8, Math.min(width, height) / 2 - LIFT - 4);
    const inner = variant === 'donut' ? outer * 0.62 : 0;

    let angle = 0;
    const slices = visible.map(slice => {
      const sweep = total > 0 ? (slice.value / total) * Math.PI * 2 : 0;
      const start = angle;
      angle += sweep;
      return { ...slice, start, end: angle, share: total > 0 ? slice.value / total : 0 };
    });

    return { cx, cy, outer, inner, total, slices };
  }, [toned, hidden, width, height, variant]);

  const percent = useMemo(() => {
    const format = new Intl.NumberFormat(labels?.locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    });
    return (share: number) => format.format(share);
  }, [labels?.locale]);

  const plot = useMemo(() => {
    const { cx, cy, outer, inner, slices, total } = geometry;

    return (
      <g>
        {slices.map(slice => (
          <path
            key={slice.id}
            className={styles.slice}
            d={arcPath(cx, cy, outer, inner, slice.start, slice.end)}
            style={{ fill: toneColor(slice.tone), strokeWidth: slices.length > 1 ? SEPARATOR : 0 }}
          />
        ))}
        {variant === 'donut' && (
          <g aria-hidden className={styles.center}>
            <text
              className={styles.center__value}
              x={cx}
              y={centerLabel ? cy - 4 : cy}
              dy="0.32em"
              textAnchor="middle"
            >
              {centerValue ?? fv(total)}
            </text>
            {centerLabel && (
              <text
                className={styles.center__label}
                x={cx}
                y={cy + 16}
                dy="0.32em"
                textAnchor="middle"
              >
                {centerLabel}
              </text>
            )}
          </g>
        )}
      </g>
    );
  }, [geometry, variant, centerValue, centerLabel, fv]);

  const pick = useCallback(
    (px: number, py: number) => {
      const { cx, cy, outer, inner, slices } = geometry;
      const distance = Math.hypot(px - cx, py - cy);
      if (distance > outer + LIFT || distance < inner) return null;

      /* Açı: saat 12 = 0, saat yönünde artar (`polar` ile aynı). */
      let angle = Math.atan2(px - cx, -(py - cy));
      if (angle < 0) angle += Math.PI * 2;
      const index = slices.findIndex(slice => angle >= slice.start && angle < slice.end);
      return index < 0 ? null : index;
    },
    [geometry],
  );

  const describe = (index: number) => {
    const slice = geometry.slices[index];
    return `${fv(slice.value)} (${percent(slice.share)})`;
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
        const { cx, cy, outer, inner, slices } = geometry;
        const slice = slices[index];
        const middle = (slice.start + slice.end) / 2;
        const shift = polar(0, 0, LIFT, middle);
        return (
          <path
            className={styles.slice}
            d={arcPath(cx + shift.x, cy + shift.y, outer, inner, slice.start, slice.end)}
            style={{ fill: toneColor(slice.tone), strokeWidth: SEPARATOR }}
          />
        );
      }}
      itemCount={geometry.slices.length}
      pick={pick}
      tooltip={index => {
        const slice = geometry.slices[index];
        return {
          rows: [{ id: slice.id, label: slice.label, value: describe(index), tone: slice.tone }],
        };
      }}
      anchor={index => {
        const { cx, cy, outer, slices } = geometry;
        const slice = slices[index];
        /* Dilimin DIŞ kenarı: ipucu dışarı açılır, dilimi ve ortadaki toplamı örtmez. */
        return polar(cx, cy, outer + LIFT, (slice.start + slice.end) / 2);
      }}
      tooltipSide="outward"
      announce={index => `${geometry.slices[index].label}: ${describe(index)}`}
      table={{
        columns: [label, valueLabel],
        rows: toned.map(slice => [
          slice.label,
          Number.isFinite(slice.value) ? fv(slice.value) : '—',
        ]),
      }}
      legend={{
        entries: toned.map(slice => ({ id: slice.id, label: slice.label, tone: slice.tone })),
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

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(PieChart, 'PieChart')) as typeof PieChart;
