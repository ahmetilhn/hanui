'use client';

import { memo, useMemo } from 'react';

import { named } from '../../helpers/component.helper';
import CartesianChart, { type CartesianChartProps } from '../core/CartesianChart';
import type { ChartSeries } from '../core/series';

type Props = Omit<CartesianChartProps, 'series' | 'orientation'> & {
  series: readonly ChartSeries[];
};

/**
 * Alan grafiği — çizginin altı dolu; `isStacked` ile seriler üst üste (bütünün parçaları).
 * Taban SIFIR: alanın yüksekliği değerin kendisi, kırpılmış bir eksen alanı yanlış oranda gösterir.
 *
 * Klavye: `←`/`→` önceki/sonraki x · `Home`/`End` · `Escape`.
 */
const AreaChart = ({ series, ...rest }: Props) => {
  const areas = useMemo(() => series.map(item => ({ ...item, type: 'area' as const })), [series]);
  return <CartesianChart {...rest} series={areas} />;
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(AreaChart, 'AreaChart')) as typeof AreaChart;
