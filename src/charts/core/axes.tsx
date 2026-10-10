import type { PlotArea } from './types';

import styles from './axes.module.scss';

export type Tick = {
  /** Eksen boyunca konum (px). */
  position: number;
  label: string;
};

/** Bir karakterin yaklaşık genişliği (px) — 11 px eksen yazısında ölçülmüş ortalama. */
export const CHAR_WIDTH = 6.4;

/** Etiketin kaplayacağı yaklaşık genişlik. Ölçüm (DOM) yerine tahmin: sunucuda da çalışır. */
export const labelWidth = (label: string): number => label.length * CHAR_WIDTH;

/**
 * Üst üste binecek etiketleri SEYRELTİR: her `k`. etiket kalır. Bölme çizgisi ve veri yerinde;
 * yalnızca yazı atlanır.
 */
export const thinTicks = (ticks: readonly Tick[], minGap = 8): Tick[] => {
  if (ticks.length < 2) return [...ticks];

  const widest = Math.max(...ticks.map(tick => labelWidth(tick.label)));
  const spacing = Math.abs(ticks[1].position - ticks[0].position);
  const every = spacing <= 0 ? 1 : Math.max(1, Math.ceil((widest + minGap) / spacing));

  return ticks.filter((_, index) => index % every === 0);
};

/** Metni yaklaşık genişliğe sığdırır (yatay çubuk grafiğinin kategori etiketleri). */
export const fitLabel = (label: string, width: number): string => {
  const max = Math.max(1, Math.floor(width / CHAR_WIDTH));
  return label.length <= max ? label : `${label.slice(0, Math.max(1, max - 1))}…`;
};

type ValueAxisProps = {
  area: PlotArea;
  ticks: readonly Tick[];
  side: 'left' | 'right' | 'bottom';
  /** Izgara çizgileri — yalnızca bir eksen çizer (sol ya da alt), iki ızgara üst üste binmesin. */
  hasGrid?: boolean;
};

/** Değer ekseni: bölme yazıları + ızgara. Eksen ÇİZGİSİ yok — ızgara yeter, mürekkep tasarrufu. */
export const ValueAxis = ({ area, ticks, side, hasGrid = false }: ValueAxisProps) => (
  <g className={styles.axis} aria-hidden>
    {ticks.map(tick =>
      side === 'bottom' ? (
        <g key={`${tick.position}-${tick.label}`}>
          {hasGrid && (
            <line
              className={styles.axis__grid}
              x1={tick.position}
              x2={tick.position}
              y1={area.top}
              y2={area.bottom}
            />
          )}
          <text
            className={styles.axis__label}
            x={tick.position}
            y={area.bottom + 16}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        </g>
      ) : (
        <g key={`${tick.position}-${tick.label}`}>
          {hasGrid && (
            <line
              className={styles.axis__grid}
              x1={area.left}
              x2={area.right}
              y1={tick.position}
              y2={tick.position}
            />
          )}
          <text
            className={styles.axis__label}
            x={side === 'left' ? area.left - 8 : area.right + 8}
            y={tick.position}
            dy="0.32em"
            textAnchor={side === 'left' ? 'end' : 'start'}
          >
            {tick.label}
          </text>
        </g>
      ),
    )}
  </g>
);

type CategoryAxisProps = {
  area: PlotArea;
  ticks: readonly Tick[];
  side: 'bottom' | 'left';
};

/** Kategori ekseni: taban çizgisi + yazılar (seyreltilmiş). */
export const CategoryAxis = ({ area, ticks, side }: CategoryAxisProps) => (
  <g className={styles.axis} aria-hidden>
    {side === 'bottom' ? (
      <>
        <line
          className={styles.axis__baseline}
          x1={area.left}
          x2={area.right}
          y1={area.bottom}
          y2={area.bottom}
        />
        {thinTicks(ticks).map(tick => (
          <text
            key={`${tick.position}-${tick.label}`}
            className={styles.axis__label}
            x={tick.position}
            y={area.bottom + 16}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        ))}
      </>
    ) : (
      <>
        <line
          className={styles.axis__baseline}
          x1={area.left}
          x2={area.left}
          y1={area.top}
          y2={area.bottom}
        />
        {ticks.map(tick => (
          <text
            key={`${tick.position}-${tick.label}`}
            className={styles.axis__label}
            x={area.left - 8}
            y={tick.position}
            dy="0.32em"
            textAnchor="end"
          >
            {fitLabel(tick.label, area.left - 12)}
          </text>
        ))}
      </>
    )}
  </g>
);
