import { LABELS } from '../fixtures/labels';
import { type ReactElement } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { axe } from '@tests/support/axe';
import * as charts from '@/charts';
import * as hanui from '@/index';

const {
  AreaChart,
  BarChart,
  BoxPlot,
  ComposedChart,
  Heatmap,
  Histogram,
  LineChart,
  PieChart,
  RadarChart,
  ScatterPlot,
} = charts;

const ROWS = [
  { month: 'Oca', a: 10, b: 4 },
  { month: 'Şub', a: 20, b: null },
  { month: 'Mar', a: -5, b: 12 },
];

const TWO = [
  { key: 'a', label: 'Gelir' },
  { key: 'b', label: 'Gider' },
];

/*
 * GRAFİK GİRİŞİNİN EKSEN TARAMASI — dışa verilen her grafik, her anlamlı durumunda (boş veri dahil).
 * Deftere girmeyen yeni bir grafik testi kırar.
 */
const SCENARIOS: Record<string, Record<string, ReactElement>> = {
  LineChart: {
    default: (
      <LineChart label="Çizgi" xKey="month" data={ROWS} series={TWO} width={480} hasPoints />
    ),
    empty: <LineChart label="Çizgi" xKey="month" data={[]} series={TWO} width={480} />,
  },
  AreaChart: {
    stacked: <AreaChart label="Alan" xKey="month" data={ROWS} series={TWO} width={480} isStacked />,
  },
  BarChart: {
    vertical: <BarChart label="Çubuk" xKey="month" data={ROWS} series={TWO} width={480} />,
    horizontal: (
      <BarChart
        label="Çubuk"
        xKey="month"
        data={ROWS}
        series={TWO}
        width={480}
        orientation="horizontal"
      />
    ),
  },
  ComposedChart: {
    default: (
      <ComposedChart
        label="Karma"
        xKey="month"
        data={ROWS}
        series={[
          { key: 'a', label: 'Adet', type: 'bar' },
          { key: 'b', label: 'Oran', type: 'line', axis: 'right' },
        ]}
        width={480}
      />
    ),
  },
  PieChart: {
    donut: (
      <PieChart
        label="Pay"
        valueLabel="Adet"
        centerLabel="Toplam"
        width={320}
        data={[
          { id: 'a', label: 'Bir', value: 3 },
          { id: 'b', label: 'İki', value: 1 },
        ]}
      />
    ),
    empty: <PieChart label="Pay" valueLabel="Adet" variant="pie" width={320} data={[]} />,
  },
  ScatterPlot: {
    bubble: (
      <ScatterPlot
        label="Saçılım"
        xLabel="Fiyat"
        yLabel="Satış"
        sizeLabel="Stok"
        width={480}
        series={[
          { id: 'a', label: 'Orijinal', data: [{ x: 1, y: 2, size: 10, label: 'Balata' }] },
          { id: 'b', label: 'Muadil', data: [{ x: 3, y: 1, size: 40 }] },
        ]}
      />
    ),
  },
  Heatmap: {
    default: (
      <Heatmap
        label="Isı"
        valueLabel="Sipariş"
        columns={['00', '12']}
        rows={['Pzt', 'Sal']}
        values={[
          [1, 5],
          [null, 3],
        ]}
        width={480}
      />
    ),
  },
  BoxPlot: {
    default: (
      <BoxPlot
        label="Kutu"
        groupLabel="Firma"
        width={480}
        labels={{
          min: 'En küçük',
          q1: 'Q1',
          median: 'Medyan',
          q3: 'Q3',
          max: 'En büyük',
          outliers: 'Aykırı',
          count: 'Gözlem',
        }}
        groups={[{ id: 'a', label: 'Aras', values: [1, 2, 3, 9] }]}
      />
    ),
  },
  Histogram: {
    default: (
      <Histogram
        label="Dağılım"
        values={[1, 2, 2, 3, 8]}
        valueLabel="Gün"
        countLabel="Adet"
        width={480}
      />
    ),
  },
  RadarChart: {
    default: (
      <RadarChart
        label="Radar"
        width={400}
        axes={[
          { key: 'a', label: 'Fiyat' },
          { key: 'b', label: 'Hız' },
          { key: 'c', label: 'Kalite' },
        ]}
        series={[
          { id: 'x', label: 'Bir', values: { a: 1, b: 2, c: 3 } },
          { id: 'y', label: 'İki', values: { a: 3, b: null, c: 1 } },
        ]}
      />
    ),
  },
};

const cases = Object.entries(SCENARIOS).flatMap(([component, states]) =>
  Object.entries(states).map(([state, element]) => [component, state, element] as const),
);

describe('grafik eksen taraması', () => {
  it.each(cases)('%s — %s', async (_component, _state, element) => {
    render(<hanui.HanuiProvider labels={LABELS}>{element}</hanui.HanuiProvider>);

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it.each(cases)('%s — %s: ipucu açıkken de temiz', async (_component, _state, element) => {
    render(<hanui.HanuiProvider labels={LABELS}>{element}</hanui.HanuiProvider>);
    const svg = screen.getByRole('img');
    fireEvent.keyDown(svg, { key: 'ArrowRight' });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('grafik senaryo defteri `charts/index.ts` ile eşleşir', () => {
  const isComponent = (value: unknown): boolean =>
    (typeof value === 'function' && /^[A-Z]/.test((value as { name?: string }).name ?? '')) ||
    (typeof value === 'object' && value !== null && '$$typeof' in value);

  const exported = Object.entries(charts)
    .filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value))
    .map(([name]) => name);

  it('dışa verilen her grafiğin en az bir senaryosu var', () => {
    expect(exported.filter(name => !SCENARIOS[name])).toEqual([]);
  });

  it('defterde dışa verilmeyen bir ad yok', () => {
    expect(Object.keys(SCENARIOS).filter(name => !exported.includes(name))).toEqual([]);
  });
});
