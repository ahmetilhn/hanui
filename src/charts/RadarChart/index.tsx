'use client';

import { memo, useCallback, useMemo, useState } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { named } from '../../helpers/component.helper';
import { fitLabel, labelWidth } from '../core/axes';
import ChartFrame from '../core/ChartFrame';
import { fullNumber, tickLabels, type ValueFormat } from '../core/format';
import { type ChartTone, toneAt, toneColor } from '../core/palette';
import { polar, polygonPath } from '../core/path';
import { niceDomain, ticks as tickValues } from '../core/scale';
import useChartWidth from '../core/useChartWidth';

import styles from './index.module.scss';

export type RadarAxis = {
  key: string;
  label: string;
};

export type RadarSeries = {
  id: string;
  label: string;
  /** Eksen anahtarı → değer. Eksik ya da `null` değer merkezde çizilir, ipucunda "—" okunur. */
  values: Readonly<Record<string, number | null | undefined>>;
  tone?: ChartTone;
};

type Props = {
  label: string;
  description?: string;
  /** Saat 12'den saat yönünde dizilen eksenler. ⚠ Üçten az eksen bir alan çizmez. */
  axes: readonly RadarAxis[];
  series: readonly RadarSeries[];
  /**
   * Ortak ölçeğin üst ucu. Verilmezse en büyük değerden "güzel" bir sayıya yuvarlanır.
   * ⚠ Bütün eksenler AYNI ölçeği paylaşır: birimleri farklı eksenleri önce normalleştirin (0-100).
   */
  max?: number;
  height?: number;
  width?: number;
  formatValue?: ValueFormat;
  className?: string;
  testId?: string;
};

/** Eksen etiketinin çemberden uzaklığı (px). */
const LABEL_GAP = 10;
/** Ölçek sayısının dikey payı (px): halkalar bundan sıkışıksa sayılar seyrelir. */
const RING_LABEL_HEIGHT = 16;
/** İşaretçinin eksen etiketinin ötesinde hâlâ isabet sayıldığı pay (px). */
const PICK_SLACK = 28;

const valueOf = (series: RadarSeries, key: string): number | null => {
  const value = series.values[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/**
 * Radar (örümcek) grafiği — birkaç serinin aynı eksen takımında karşılaştırılması. Izgara
 * ÇOKGEN (çember değil): değer eksen üzerinde okunur, eksenler arası eğri bir değer vaat etmez.
 *
 * Etkileşim EKSEN başınadır: işaretçi en yakın ekseni seçer ve ipucu o eksendeki bütün serileri
 * okur. Klavye: `←`/`→` önceki/sonraki eksen · `Home`/`End` · `Escape`.
 */
const RadarChart = ({
  label,
  description,
  axes,
  series,
  max,
  height = 320,
  width: fixedWidth,
  formatValue,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const [containerRef, width] = useChartWidth(fixedWidth);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const tickFormat = useMemo(() => tickLabels(labels?.locale), [labels?.locale]);
  const full = useMemo(() => fullNumber(labels?.locale), [labels?.locale]);
  const fv = formatValue ?? full;

  const toned = useMemo(
    () => series.map((item, index) => ({ ...item, tone: toneAt(index, item.tone) })),
    [series],
  );
  const visible = useMemo(() => toned.filter(item => !hidden.has(item.id)), [toned, hidden]);

  const geometry = useMemo(() => {
    const count = axes.length;
    const step = count > 0 ? (Math.PI * 2) / count : 0;
    const angles = axes.map((_, index) => index * step);

    /*
     * Yarıçap: dikeyde bir satır etiket payı, yatayda en uzun YAN etiketin payı. Etiket sığmazsa
     * kısaltılır — yarıçap etiketler için sonsuza kadar küçülmez.
     */
    const widest = Math.min(width * 0.22, Math.max(0, ...axes.map(axis => labelWidth(axis.label))));
    const radius = Math.max(24, Math.min(height / 2 - 24, width / 2 - widest - LABEL_GAP - 4));
    const cx = width / 2;
    const cy = height / 2;

    let peak = 0;
    for (const item of series)
      for (const axis of axes) {
        const value = valueOf(item, axis.key);
        if (value !== null && value > peak) peak = value;
      }
    const top = max !== undefined && max > 0 ? max : niceDomain(0, peak, 4)[1];
    const rings = tickValues(0, top, 4).filter(value => value > 0);
    const scale = (value: number) => (Math.min(Math.max(value, 0), top) / top) * radius;

    return { cx, cy, radius, angles, step, top, rings, scale, labelRoom: widest };
  }, [axes, series, max, width, height]);

  const shapes = useMemo(() => {
    const { cx, cy, angles, scale } = geometry;
    return visible.map(item => ({
      ...item,
      points: axes.map((axis, index) => {
        const value = valueOf(item, axis.key);
        return { ...polar(cx, cy, scale(value ?? 0), angles[index]), value };
      }),
    }));
  }, [geometry, visible, axes]);

  const plot = useMemo(() => {
    const { cx, cy, radius, angles, rings, scale, labelRoom } = geometry;
    const ringGap = rings.length > 0 ? scale(rings[0]) : radius;
    const ringEvery = Math.max(1, Math.ceil(RING_LABEL_HEIGHT / Math.max(1, ringGap)));
    const ringLabels = tickFormat(rings);

    return (
      <g>
        <g aria-hidden className={styles.grid}>
          {rings.map(ring => (
            <path
              key={ring}
              d={polygonPath(angles.map(angle => polar(cx, cy, scale(ring), angle)))}
            />
          ))}
          {angles.map((angle, index) => {
            const end = polar(cx, cy, radius, angle);
            return <line key={axes[index].key} x1={cx} y1={cy} x2={end.x} y2={end.y} />;
          })}
        </g>

        {shapes.map(shape => (
          <path
            key={shape.id}
            className={styles.shape}
            d={polygonPath(shape.points)}
            style={{
              fill: `color-mix(in srgb, ${toneColor(shape.tone)} 14%, transparent)`,
              stroke: toneColor(shape.tone),
            }}
          />
        ))}

        <g aria-hidden className={styles.labels}>
          {/*
           * Ölçek sayısı halkanın İÇİNDE: dışarıda, tepedeki eksen adıyla çakışıyordu. Halkalar
           * yazıdan sıkışıksa (dar ekran) sayılar seyrelir; en dıştaki her zaman kalır.
           */}
          {rings.map((ring, index) =>
            (rings.length - 1 - index) % ringEvery === 0 ? (
              <text key={ring} x={cx + 4} y={cy - scale(ring)} dy="1.1em">
                {ringLabels[index]}
              </text>
            ) : null,
          )}
          {axes.map((axis, index) => {
            const angle = angles[index];
            const point = polar(cx, cy, radius + LABEL_GAP, angle);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const anchor = sin > 0.3 ? 'start' : sin < -0.3 ? 'end' : 'middle';
            /* Üstteki etiket çizginin ÜSTÜNE, alttaki ALTINA oturur. */
            const dy = cos > 0.3 ? '-0.2em' : cos < -0.3 ? '0.9em' : '0.32em';
            return (
              <text
                key={axis.key}
                className={styles.axisLabel}
                x={point.x}
                y={point.y}
                dy={dy}
                textAnchor={anchor}
              >
                {fitLabel(axis.label, anchor === 'middle' ? radius * 1.4 : labelRoom)}
              </text>
            );
          })}
        </g>
      </g>
    );
  }, [geometry, shapes, axes, tickFormat]);

  const pick = useCallback(
    (px: number, py: number) => {
      const { cx, cy, radius, step } = geometry;
      if (axes.length === 0 || Math.hypot(px - cx, py - cy) > radius + PICK_SLACK) return null;

      let angle = Math.atan2(px - cx, -(py - cy));
      if (angle < 0) angle += Math.PI * 2;
      return Math.round(angle / step) % axes.length;
    },
    [geometry, axes.length],
  );

  const read = (index: number) =>
    shapes.map(shape => {
      const value = shape.points[index].value;
      return {
        id: shape.id,
        label: shape.label,
        value: value === null ? '—' : fv(value),
        tone: shape.tone,
      };
    });

  return (
    <ChartFrame
      label={label}
      description={description}
      containerRef={containerRef}
      width={width}
      height={height}
      plot={plot}
      overlay={index => {
        const { cx, cy, radius, angles } = geometry;
        const end = polar(cx, cy, radius, angles[index]);
        return (
          <g>
            <line className={styles.spoke} x1={cx} y1={cy} x2={end.x} y2={end.y} />
            {shapes.map(shape => {
              const point = shape.points[index];
              return point.value === null ? null : (
                <circle
                  key={shape.id}
                  className={styles.marker}
                  cx={point.x}
                  cy={point.y}
                  r={4.5}
                  style={{ fill: toneColor(shape.tone) }}
                />
              );
            })}
          </g>
        );
      }}
      itemCount={axes.length}
      pick={pick}
      tooltip={index => ({ title: axes[index].label, rows: read(index) })}
      anchor={index => {
        const { cx, cy, radius, angles } = geometry;
        /* Eksenin dış ucu değil en uzak serinin noktası: ipucu boş ızgaranın üstünde durmasın. */
        let reach = 0;
        for (const shape of shapes) {
          const point = shape.points[index];
          reach = Math.max(reach, Math.hypot(point.x - cx, point.y - cy));
        }
        return polar(cx, cy, Math.min(radius, reach), angles[index]);
      }}
      tooltipSide="outward"
      announce={index =>
        `${axes[index].label}: ${read(index)
          .map(row => `${row.label} ${row.value}`)
          .join(', ')}`
      }
      table={{
        columns: [label, ...toned.map(item => item.label)],
        rows: axes.map(axis => [
          axis.label,
          ...toned.map(item => {
            const value = valueOf(item, axis.key);
            return value === null ? '—' : fv(value);
          }),
        ]),
      }}
      legend={
        toned.length > 1
          ? {
              entries: toned.map(item => ({ id: item.id, label: item.label, tone: item.tone })),
              hidden,
              onToggle: id =>
                setHidden(current => {
                  const next = new Set(current);
                  if (next.has(id)) next.delete(id);
                  else if (toned.length - current.size > 1) next.add(id);
                  return next;
                }),
            }
          : undefined
      }
      className={className}
      testId={testId}
    />
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(RadarChart, 'RadarChart'),
) as typeof RadarChart;
