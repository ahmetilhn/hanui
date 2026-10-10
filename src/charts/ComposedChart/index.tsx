'use client';

import { memo } from 'react';

import { named } from '../../helpers/component.helper';
import CartesianChart, { type CartesianChartProps } from '../core/CartesianChart';
import type { ComposedSeries } from '../core/series';

type Props = Omit<CartesianChartProps, 'series' | 'orientation'> & {
  /** Seri başına tür (`line` / `area` / `bar`) ve eksen (`left` / `right`). */
  series: readonly ComposedSeries[];
};

/**
 * Bileşik grafik — çubuk, çizgi ve alan aynı x ekseninde; farklı birimdeki seri SAĞ eksene
 * (`axis: 'right'`). Çizim sırası: alan → çubuk → çizgi (çizgi her zaman görünür kalır).
 * ⚠ İki eksen okuyucuyu yanıltabilir: sağ eksendeki seri `format` ile kendi birimini söylemeli.
 *
 * Klavye: `←`/`→` önceki/sonraki x · `Home`/`End` · `Escape`.
 */
const ComposedChart = (props: Props) => <CartesianChart {...props} />;

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ComposedChart, 'ComposedChart'),
) as typeof ComposedChart;
