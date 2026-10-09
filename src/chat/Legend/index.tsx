import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Kategorik paletin adları (`cat-*`, `series-*`) + bekleme/boşluk için `muted`. */
export type LegendTone =
  'cat-1' | 'cat-2' | 'cat-3' | 'cat-4' | 'cat-5' | 'series-1' | 'series-2' | 'muted';

export type LegendItem = {
  id: string;
  label: string;
  tone: LegendTone;
};

type Props = {
  items: LegendItem[];
  className?: string;
  testId?: string;
};

const swatchColor = (tone: LegendTone): string =>
  tone === 'muted' ? 'var(--hanui-text-3)' : `var(--hanui-${tone})`;

/**
 * Grafik lejantı — renk karesi + ad. Renk yalnızca kategorik paletten gelir (iki temanın üç
 * yüzeyinde ≥3:1); ad her zaman metin olarak yazılır, renk tek başına anlam taşımaz.
 */
const Legend: FC<Props> = ({ items, className, testId }) => (
  <ul className={cx(styles.legend, className)} data-testid={testId}>
    {items.map(item => (
      <li key={item.id} className={styles.legend__item}>
        <span
          aria-hidden
          className={styles.legend__swatch}
          style={{ backgroundColor: swatchColor(item.tone) }}
        />
        {item.label}
      </li>
    ))}
  </ul>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Legend, 'Legend')) as typeof Legend;
