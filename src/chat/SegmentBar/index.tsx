import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { LegendTone } from '../Legend';

import styles from './index.module.scss';

export type SegmentBarSegment = {
  id: string;
  /** Parçanın okunan adı, değeriyle: "Önek · 12,4 B". Özet adın parçası olur. */
  label: string;
  tone: LegendTone;
} & (
  | {
      /** Yığılmış çubukta parçanın büyüklüğü — parçalar sırayla dizilir. */
      value: number;
      from?: never;
      to?: never;
    }
  | {
      /** Zaman çizelgesinde parçanın başlangıcı ve bitişi (aynı ölçekte). */
      from: number;
      to: number;
      value?: never;
    }
);

export type SegmentBarMarker = {
  id: string;
  /** Konum, `max` ile aynı ölçekte. */
  at: number;
  label: string;
  tone?: 'neutral' | 'danger';
};

type Props = {
  /** Grafiğin adı ("Bağlam bileşimi"); parçaların ve işaretlerin adlarıyla birlikte okunur. */
  label: string;
  /** Ölçeğin tavanı. */
  max: number;
  segments: SegmentBarSegment[];
  /** Dikey çizgi işaretleri — bütçe sınırı, hedef. */
  markers?: SegmentBarMarker[];
  className?: string;
  testId?: string;
};

const percent = (value: number, max: number): number =>
  max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

const swatch = (tone: LegendTone): string =>
  tone === 'muted' ? 'var(--hanui-text-3)' : `var(--hanui-${tone})`;

/**
 * Parçalı çubuk — yığılmış bileşim (`value`) ya da zaman çizelgesi (`from`/`to`).
 *
 * Erişilebilirlik: çubuk TEK bir görseldir (`role="img"`); adı grafiğin adı + her parçanın ve
 * işaretin okunan adıdır. Parça başına odaklanılabilir öğe çizilmez — bir çubuğun içinde sekme
 * durağı dizmek, okunan özetten daha az bilgi verip daha çok tuş istiyordu.
 */
const SegmentBar: FC<Props> = ({ label, max, segments, markers = [], className, testId }) => {
  const summary = [
    ...segments.map(segment => segment.label),
    ...markers.map(marker => marker.label),
  ];
  let cursor = 0;

  return (
    <div
      role="img"
      aria-label={`${label}: ${summary.join(', ')}`}
      className={cx(styles.bar, className)}
      data-testid={testId}
    >
      {segments.map(segment => {
        const start = segment.from ?? cursor;
        const end = segment.to ?? start + (segment.value ?? 0);
        cursor = end;

        return (
          <span
            key={segment.id}
            className={styles.bar__segment}
            title={segment.label}
            style={{
              insetInlineStart: `${percent(start, max)}%`,
              inlineSize: `${percent(end, max) - percent(start, max)}%`,
              backgroundColor: swatch(segment.tone),
            }}
          />
        );
      })}

      {markers.map(marker => (
        <span
          key={marker.id}
          className={cx(
            styles.bar__marker,
            marker.tone === 'danger' && styles['bar__marker--danger'],
          )}
          title={marker.label}
          style={{ insetInlineStart: `${percent(marker.at, max)}%` }}
        />
      ))}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(SegmentBar, 'SegmentBar'),
) as typeof SegmentBar;
