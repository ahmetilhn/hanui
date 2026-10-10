'use client';

import { memo, useMemo } from 'react';

import { named } from '../../helpers/component.helper';
import CartesianChart, { type CartesianChartProps } from '../core/CartesianChart';
import type { ChartSeries } from '../core/series';

type Props = Omit<CartesianChartProps, 'series' | 'isStacked' | 'orientation'> & {
  series: readonly ChartSeries[];
};

/**
 * Çizgi grafiği — bir ya da daha çok serinin x boyunca değişimi. Sayısal x sürekli eksen, metin x
 * kategorik eksen. `null` değer çizgiyi KESER (eksik veri sıfır değildir).
 *
 * Klavye: grafiğe sekmeyle gelinir · `←`/`→` önceki/sonraki x · `Home`/`End` · `Escape`.
 */
const LineChart = ({ series, ...rest }: Props) => {
  const lines = useMemo(() => series.map(item => ({ ...item, type: 'line' as const })), [series]);
  return <CartesianChart {...rest} series={lines} />;
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(LineChart, 'LineChart')) as typeof LineChart;
