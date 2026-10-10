'use client';

import { memo, useMemo } from 'react';

import { named } from '../../helpers/component.helper';
import CartesianChart, { type CartesianChartProps } from '../core/CartesianChart';
import type { ChartSeries } from '../core/series';

type Props = Omit<CartesianChartProps, 'series' | 'curve' | 'hasPoints'> & {
  series: readonly ChartSeries[];
};

/**
 * Çubuk / sütun grafiği — kategoriler arası karşılaştırma. Birden çok seri yan yana (gruplu) ya da
 * `isStacked` ile üst üste; `orientation="horizontal"` uzun kategori adları için (etiket kesilmez,
 * sığmazsa "…" ile kısalır, tam adı ipucu ve tabloda).
 * Eksi değer sıfırın ALTINA iner; yığında artı ve eksi ayrı birikir.
 *
 * Klavye: `←`/`→` (ya da `↑`/`↓`) önceki/sonraki kategori · `Home`/`End` · `Escape`.
 */
const BarChart = ({ series, ...rest }: Props) => {
  const bars = useMemo(() => series.map(item => ({ ...item, type: 'bar' as const })), [series]);
  return <CartesianChart {...rest} series={bars} />;
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(BarChart, 'BarChart')) as typeof BarChart;
