'use client';

import { memo, useCallback, useId, useMemo } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { named } from '../../helpers/component.helper';
import { fitLabel, labelWidth, thinTicks } from '../core/axes';
import ChartFrame from '../core/ChartFrame';
import { fullNumber, type ValueFormat } from '../core/format';
import { type ChartTone, toneColor } from '../core/palette';
import { scaleBand } from '../core/scale';
import { extent, finite } from '../core/stats';
import useChartWidth from '../core/useChartWidth';

import styles from './index.module.scss';

type Props = {
  label: string;
  description?: string;
  /** Sütun adları (x). */
  columns: readonly string[];
  /** Satır adları (y). */
  rows: readonly string[];
  /** `values[satır][sütun]`; `null` boş hücre (veri yok — sıfır değil). */
  values: readonly (readonly (number | null)[])[];
  /** Hücre değerinin adı ("Sipariş"). */
  valueLabel: string;
  tone?: ChartTone;
  height?: number;
  width?: number;
  formatValue?: ValueFormat;
  className?: string;
  testId?: string;
};

/** Renk yoğunluğu: en küçük değer %8, en büyük %100 — en açık hücre bile zeminden ayrışır. */
const MIN_MIX = 8;
const LEGEND_HEIGHT = 28;
/** Renk ölçeği çubuğunun boyu (px). */
const SCALE_WIDTH = 140;

/** Hücrenin değeri; eksik ya da sonlu olmayan değer `null` (boş hücre, sıfır değil). */
const valueAt = (values: Props['values'], row: number, column: number): number | null => {
  const value = values[row]?.[column];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/** Bant ölçeği DİZİNLE anahtarlanır: aynı adı taşıyan iki satır tek banda çökmesin. */
const indices = (labels: readonly string[]) => labels.map((_, index) => String(index));

/**
 * Isı haritası — iki kategorik boyutta bir değerin yoğunluğu. Renk TEK TONUN yoğunluğu
 * (sıralı ölçek): çok renkli bir ölçek düşük-yüksek sırasını okutmuyordu.
 * Değer renk tek başına okunmaz: ipucu, duyuru ve veri tablosu sayıyı söyler.
 *
 * Klavye: `←`/`→` sütun · `↑`/`↓` satır · `Home`/`End` ilk/son hücre · `Escape`.
 */
const Heatmap = ({
  label,
  description,
  columns,
  rows,
  values,
  valueLabel,
  tone = 'cat-1',
  height = 280,
  width: fixedWidth,
  formatValue,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const [containerRef, width] = useChartWidth(fixedWidth);
  const full = useMemo(() => fullNumber(labels?.locale), [labels?.locale]);
  const fv = formatValue ?? full;
  /* Bir sayfada iki ısı haritası aynı `id`yi taşımasın. */
  const gradientId = `hanui-heat-${useId().replace(/:/g, '')}`;

  const geometry = useMemo(() => {
    const left = Math.min(width * 0.3, Math.max(32, ...rows.map(labelWidth)) + 12);
    const area = { left, top: 8, right: width - 8, bottom: height - 28 - LEGEND_HEIGHT };
    const x = scaleBand(indices(columns), [area.left, area.right], {
      paddingInner: 0.06,
      paddingOuter: 0,
    });
    const y = scaleBand(indices(rows), [area.top, area.bottom], {
      paddingInner: 0.06,
      paddingOuter: 0,
    });
    const [min, max] = extent(finite(values.flat()));

    const mix = (value: number | null) =>
      value === null
        ? null
        : max === min
          ? 60
          : MIN_MIX + ((value - min) / (max - min)) * (100 - MIN_MIX);

    const cells = rows.flatMap((row, rowIndex) =>
      columns.map((column, columnIndex) => {
        const value = valueAt(values, rowIndex, columnIndex);
        return {
          row,
          column,
          key: `${rowIndex}:${columnIndex}`,
          value,
          x: x(String(columnIndex)),
          y: y(String(rowIndex)),
          width: x.bandwidth,
          height: y.bandwidth,
          mix: mix(value),
        };
      }),
    );

    return { area, x, y, cells, min, max };
  }, [columns, rows, values, width, height]);

  const color = toneColor(tone);

  const plot = useMemo(() => {
    const { area, x, y, cells } = geometry;
    const maxText = fv(geometry.max);
    const scaleRight = area.right - labelWidth(maxText) - 8;
    const columnTicks = thinTicks(
      columns.map((column, index) => ({
        position: x(String(index)) + x.bandwidth / 2,
        label: column,
      })),
    );

    return (
      <g>
        {cells.map(cell => (
          <rect
            key={cell.key}
            className={cell.mix === null ? styles.empty : undefined}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            rx={2}
            style={
              cell.mix === null
                ? undefined
                : { fill: `color-mix(in srgb, ${color} ${cell.mix}%, var(--hanui-surface))` }
            }
          />
        ))}
        <g aria-hidden className={styles.labels}>
          {rows.map((row, rowIndex) => (
            <text
              key={rowIndex}
              x={area.left - 8}
              y={y(String(rowIndex)) + y.bandwidth / 2}
              dy="0.32em"
              textAnchor="end"
            >
              {fitLabel(row, area.left - 12)}
            </text>
          ))}
          {columnTicks.map(tick => (
            <text key={tick.position} x={tick.position} y={area.bottom + 16} textAnchor="middle">
              {tick.label}
            </text>
          ))}
        </g>
        {/* Renk ölçeği: en küçük → en büyük. */}
        <defs>
          <linearGradient id={gradientId}>
            <stop
              offset="0%"
              style={{
                stopColor: `color-mix(in srgb, ${color} ${MIN_MIX}%, var(--hanui-surface))`,
              }}
            />
            <stop offset="100%" style={{ stopColor: color }} />
          </linearGradient>
        </defs>
        {/* `en küçük ▬▬▬ en büyük` tek satırda; çubuk en büyük değerin yazısı kadar içeri çekilir. */}
        <g aria-hidden className={styles.labels}>
          <rect
            x={scaleRight - SCALE_WIDTH}
            y={height - 18}
            width={SCALE_WIDTH}
            height={8}
            rx={4}
            style={{ fill: `url(#${gradientId})` }}
          />
          <text x={scaleRight - SCALE_WIDTH - 8} y={height - 14} dy="0.32em" textAnchor="end">
            {fv(geometry.min)}
          </text>
          <text x={area.right} y={height - 14} dy="0.32em" textAnchor="end">
            {maxText}
          </text>
        </g>
      </g>
    );
  }, [geometry, columns, rows, color, gradientId, height, fv]);

  const pick = useCallback(
    (px: number, py: number) => {
      const { area, x, y } = geometry;
      if (px < area.left || px > area.right || py < area.top || py > area.bottom) return null;
      const column = x.indexAt(px);
      const row = y.indexAt(py);
      return column < 0 || row < 0 ? null : row * columns.length + column;
    },
    [geometry, columns.length],
  );

  const text = (index: number) => {
    const cell = geometry.cells[index];
    return { cell, value: cell.value === null ? '—' : fv(cell.value) };
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
        const cell = geometry.cells[index];
        return (
          <rect
            className={styles.focus}
            x={cell.x - 1}
            y={cell.y - 1}
            width={cell.width + 2}
            height={cell.height + 2}
            rx={3}
          />
        );
      }}
      itemCount={geometry.cells.length}
      columns={columns.length}
      pick={pick}
      tooltip={index => {
        const { cell, value } = text(index);
        return {
          title: `${cell.row} · ${cell.column}`,
          rows: [{ id: 'value', label: valueLabel, value, tone }],
        };
      }}
      anchor={index => {
        const cell = geometry.cells[index];
        return { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 };
      }}
      announce={index => {
        const { cell, value } = text(index);
        return `${cell.row}, ${cell.column}: ${valueLabel} ${value}`;
      }}
      table={{
        columns: [label, ...columns],
        rows: rows.map((row, rowIndex) => [
          row,
          ...columns.map((_, columnIndex) => {
            const value = valueAt(values, rowIndex, columnIndex);
            return value === null ? '—' : fv(value);
          }),
        ]),
      }}
      className={className}
      testId={testId}
    />
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Heatmap, 'Heatmap')) as typeof Heatmap;
