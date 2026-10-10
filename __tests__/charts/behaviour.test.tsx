import { LABELS } from '../fixtures/labels';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import {
  BarChart,
  BoxPlot,
  Heatmap,
  Histogram,
  LineChart,
  PieChart,
  RadarChart,
  ScatterPlot,
} from '@/charts';
import { HanuiProvider } from '@/index';

/*
 * GRAFİK DAVRANIŞI — klavye, işaretçi isabeti, lejant, ipucu yerleşimi ve gizli tablo.
 * jsdom yerleşim yapmıyor: genişlik `width` ile sabitlenir, SVG'nin kutusu elle verilir.
 */

const wrap = (node: ReactNode) => render(<HanuiProvider labels={LABELS}>{node}</HanuiProvider>);

const chart = (name: string) => screen.getByRole('img', { name }) as unknown as SVGSVGElement;

const tooltip = () => document.querySelector<HTMLElement>('.chart__tooltip');

const press = (svg: SVGSVGElement, key: string) => fireEvent.keyDown(svg, { key });

/** İşaretçi hareketi kare başına bir kez işlenir (`requestAnimationFrame`): bir kare beklenir. */
const pointAt = async (svg: SVGSVGElement, x: number, y: number) => {
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect;
  await act(async () => {
    svg.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
    await new Promise(resolve => requestAnimationFrame(resolve));
  });
};

const MONTHS = [
  { month: 'Oca', a: 10, b: 4 },
  { month: 'Şub', a: 20, b: 8 },
  { month: 'Mar', a: 15, b: null },
  { month: 'Nis', a: 30, b: 12 },
];

const line = (props: Partial<Parameters<typeof LineChart>[0]> = {}) => (
  <LineChart
    label="Gelir"
    xKey="month"
    data={MONTHS}
    series={[
      { key: 'a', label: 'Gelir' },
      { key: 'b', label: 'Gider' },
    ]}
    width={600}
    {...props}
  />
);

describe('ChartFrame — klavye', () => {
  it('oklar öğeleri gezer, Home/End uçlara gider, Escape vurguyu kaldırır', () => {
    wrap(line());
    const svg = chart('Gelir');

    expect(svg).toHaveAttribute('tabindex', '0');
    expect(tooltip()).toBeNull();

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('Oca');

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('Şub');

    press(svg, 'End');
    expect(tooltip()).toHaveTextContent('Nis');

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('Nis');

    press(svg, 'Home');
    expect(tooltip()).toHaveTextContent('Oca');

    press(svg, 'ArrowLeft');
    expect(tooltip()).toHaveTextContent('Oca');

    press(svg, 'Escape');
    expect(tooltip()).toBeNull();
  });

  it('gelinen öğe DUYURULUR; ipucu ekran okuyucudan gizli', async () => {
    wrap(line());
    const svg = chart('Gelir');

    press(svg, 'ArrowRight');

    expect(tooltip()).toHaveAttribute('aria-hidden', 'true');
    await waitFor(() =>
      expect(document.getElementById('hanui-live-region-polite')).toHaveTextContent('Oca'),
    );
  });

  it('odak ayrılınca vurgu kalkar', () => {
    wrap(line());
    const svg = chart('Gelir');

    press(svg, 'ArrowRight');
    fireEvent.blur(svg);

    expect(tooltip()).toBeNull();
  });

  it('eksik değer ipucunda "—"', () => {
    wrap(line());
    const svg = chart('Gelir');

    press(svg, 'ArrowRight');
    press(svg, 'ArrowRight');
    press(svg, 'ArrowRight');

    expect(tooltip()).toHaveTextContent('Mar');
    expect(tooltip()).toHaveTextContent('—');
  });

  it('boş grafik sekme durağı DEĞİL', () => {
    wrap(<Histogram label="Boş" values={[]} valueLabel="Değer" countLabel="Adet" width={400} />);

    expect(chart('Boş')).not.toHaveAttribute('tabindex');
  });
});

describe('ChartFrame — gizli tablo ve lejant', () => {
  it('veri tablosu başlıklı ve satır başlıklı; eksik değer "—"', () => {
    wrap(line());
    const table = screen.getByRole('table', { name: 'Gelir' });

    expect(table.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(4);
    expect(table).toHaveTextContent('—');
  });

  it('tablo GİZLİ bir kabın içinde — `<table>` `width: 1px`i yok sayıp sayfayı taşırıyordu', () => {
    wrap(line());

    expect(screen.getByRole('table', { name: 'Gelir' }).parentElement).toHaveClass('chart__srOnly');
  });

  it("açıklama SVG'ye bağlanır", () => {
    wrap(line({ description: 'Nisanda en yüksek' }));

    expect(chart('Gelir')).toHaveAccessibleDescription('Nisanda en yüksek');
  });

  it('lejant seriyi gizler; SON görünen seri gizlenemez', () => {
    wrap(line());
    const gelir = screen.getByRole('button', { name: 'Gelir' });
    const gider = screen.getByRole('button', { name: 'Gider' });

    fireEvent.click(gelir);
    expect(gelir).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(gider);
    expect(gider).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(gelir);
    expect(gelir).toHaveAttribute('aria-pressed', 'true');
  });

  it('tek serili grafikte lejant çizilmez', () => {
    wrap(line({ series: [{ key: 'a', label: 'Gelir' }] }));

    expect(screen.queryByRole('button', { name: 'Gelir' })).toBeNull();
  });

  it('iki boşluk arasındaki TEK değer işaretle çizilir', () => {
    const { container } = wrap(
      <LineChart
        label="Yalnız nokta"
        xKey="day"
        data={[
          { day: 'a', v: 1 },
          { day: 'b', v: null },
          { day: 'c', v: 3 },
          { day: 'd', v: null },
        ]}
        series={[{ key: 'v', label: 'Değer' }]}
        width={400}
      />,
    );

    expect(container.querySelectorAll('circle.point')).toHaveLength(2);
  });
});

describe('ChartFrame — işaretçi', () => {
  it('çubuk grafiğinde işaretçinin altındaki kategori seçilir; çıkınca ipucu kalkar', async () => {
    wrap(
      <BarChart
        label="Satış"
        xKey="month"
        data={MONTHS}
        series={[{ key: 'a', label: 'Satış' }]}
        width={600}
      />,
    );
    const svg = chart('Satış');

    await pointAt(svg, 560, 100);
    expect(tooltip()).toHaveTextContent('Nis');

    /* Çizim alanının dışı (sağ kenar boşluğu) bir kategori seçmez. */
    await pointAt(svg, 598, 100);
    expect(tooltip()).toBeNull();

    await pointAt(svg, 560, 100);

    fireEvent.pointerLeave(svg);
    expect(tooltip()).toBeNull();
  });

  it('pasta: işaretçinin AÇISI dilimi seçer, halkanın deliği ve dışı seçmez', async () => {
    wrap(
      <PieChart
        label="Pay"
        valueLabel="Adet"
        width={300}
        height={300}
        data={[
          { id: 'a', label: 'Birinci', value: 1 },
          { id: 'b', label: 'İkinci', value: 1 },
        ]}
      />,
    );
    const svg = chart('Pay');

    /* Saat 3 yönü → ilk yarım (0-π), saat 9 → ikinci. */
    await pointAt(svg, 260, 150);
    expect(tooltip()).toHaveTextContent('Birinci');

    await pointAt(svg, 40, 150);
    expect(tooltip()).toHaveTextContent('İkinci');

    await pointAt(svg, 150, 150);
    expect(tooltip()).toBeNull();

    await pointAt(svg, 2, 2);
    expect(tooltip()).toBeNull();
  });

  it('dağılım: yakındaki nokta seçilir, uzaktaki seçilmez', async () => {
    wrap(
      <ScatterPlot
        label="Saçılım"
        xLabel="x"
        yLabel="y"
        width={400}
        height={300}
        series={[
          {
            id: 's',
            label: 'Seri',
            data: [
              { x: 0, y: 0, label: 'Köşe' },
              { x: 10, y: 10 },
            ],
          },
        ]}
      />,
    );
    const svg = chart('Saçılım');

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('Köşe');
    press(svg, 'Escape');

    await pointAt(svg, 200, 150);
    expect(tooltip()).toBeNull();
  });

  it('radar: en yakın EKSEN seçilir ve o eksendeki bütün seriler okunur', async () => {
    wrap(
      <RadarChart
        label="Radar"
        width={400}
        height={400}
        max={10}
        axes={[
          { key: 'a', label: 'Fiyat' },
          { key: 'b', label: 'Hız' },
          { key: 'c', label: 'Kalite' },
          { key: 'd', label: 'Stok' },
        ]}
        series={[
          { id: 'x', label: 'Birinci', values: { a: 5, b: 6, c: 7, d: 8 } },
          { id: 'y', label: 'İkinci', values: { a: 2, b: null, c: 4 } },
        ]}
      />,
    );
    const svg = chart('Radar');

    /* Saat 3 yönü → ikinci eksen. */
    await pointAt(svg, 330, 205);
    expect(tooltip()).toHaveTextContent('Hız');
    expect(tooltip()).toHaveTextContent('Birinci6');
    expect(tooltip()).toHaveTextContent('İkinci—');
  });
});

describe('grafiklerin kendi kuralları', () => {
  it('pasta: sıfır ve eksi değer dilim AÇMAZ ama tabloda görünür; gizlenen dilim toplamdan düşer', () => {
    const { container } = wrap(
      <PieChart
        label="Pay"
        valueLabel="Adet"
        centerLabel="Toplam"
        width={300}
        data={[
          { id: 'a', label: 'Birinci', value: 30 },
          { id: 'b', label: 'İkinci', value: 10 },
          { id: 'c', label: 'Sıfır', value: 0 },
          { id: 'd', label: 'Eksi', value: -5 },
        ]}
      />,
    );

    expect(container.querySelectorAll('path.slice')).toHaveLength(2);
    expect(screen.getByRole('table', { name: 'Pay' })).toHaveTextContent('Eksi');
    expect(container.querySelector('.center__value')).toHaveTextContent('40');

    fireEvent.click(screen.getByRole('button', { name: 'İkinci' }));
    expect(container.querySelector('.center__value')).toHaveTextContent('30');
  });

  it('ısı haritası: ↓ bir SATIR atlar; aynı adlı iki satır ayrı çizilir', () => {
    const { container } = wrap(
      <Heatmap
        label="Isı"
        valueLabel="Sipariş"
        columns={['a', 'b', 'c']}
        rows={['Pzt', 'Pzt']}
        values={[
          [1, 2, 3],
          [4, Number.NaN, 6],
        ]}
        width={400}
      />,
    );
    const svg = chart('Isı');

    press(svg, 'ArrowDown');
    expect(tooltip()).toHaveTextContent('Pzt · a');
    expect(tooltip()).toHaveTextContent('1');

    press(svg, 'ArrowDown');
    expect(tooltip()).toHaveTextContent('4');

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('—');

    const ys = new Set(
      [...container.querySelectorAll('rect')]
        .filter(
          rect =>
            rect.getAttribute('height') &&
            rect.getAttribute('x') === container.querySelector('rect')?.getAttribute('x'),
        )
        .map(rect => rect.getAttribute('y')),
    );
    expect(ys.size).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('rect.empty')).toHaveLength(1);
  });

  it('kutu grafiği: beş sayı özeti ve aykırı sayısı okunur; boş grup çökmez', () => {
    wrap(
      <BoxPlot
        label="Teslim"
        groupLabel="Firma"
        width={400}
        labels={{
          min: 'En küçük',
          q1: 'Q1',
          median: 'Medyan',
          q3: 'Q3',
          max: 'En büyük',
          outliers: 'Aykırı',
          count: 'Gözlem',
        }}
        groups={[
          { id: 'a', label: 'Aras', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 40] },
          { id: 'b', label: 'Boş', values: [] },
        ]}
      />,
    );
    const svg = chart('Teslim');

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('Medyan5,5');
    expect(tooltip()).toHaveTextContent('Aykırı1');

    press(svg, 'ArrowRight');
    expect(tooltip()).toHaveTextContent('Boş');
  });

  it('histogram: ipucu bölme ARALIĞINI okur', () => {
    wrap(
      <Histogram
        label="Dağılım"
        values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        bins={5}
        valueLabel="Gün"
        countLabel="Sipariş"
        width={400}
      />,
    );
    const svg = chart('Dağılım');

    press(svg, 'ArrowRight');
    expect(tooltip()?.textContent).toMatch(/0\s?–\s?2/);
  });
});

describe('ipucu yerleşimi', () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains('chart__tooltip') ? 150 : 0;
      },
    });
  });

  afterAll(() => {
    if (original) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original);
  });

  it('ipucu kutunun DIŞINA taşmaz — iki uçta da', () => {
    wrap(line({ width: 320 }));
    const svg = chart('Gelir');

    press(svg, 'Home');
    const first = Number.parseFloat(tooltip()?.style.left ?? 'NaN');
    press(svg, 'End');
    const last = Number.parseFloat(tooltip()?.style.left ?? 'NaN');

    expect(first).toBeGreaterThanOrEqual(0);
    expect(first + 150).toBeLessThanOrEqual(320);
    expect(last).toBeGreaterThanOrEqual(0);
    expect(last + 150).toBeLessThanOrEqual(320);
    /* Soldaki nokta ipucunu SAĞINA, sağdaki SOLUNA açar. */
    expect(first).toBeGreaterThan(last - 150);
  });

  it('pasta ipucu DIŞARI açılır; sığmazsa kenara kırpılır, merkeze çevrilmez', () => {
    wrap(
      <PieChart
        label="Pay"
        valueLabel="Adet"
        width={300}
        height={260}
        data={[
          { id: 'a', label: 'Sağ', value: 1 },
          { id: 'b', label: 'Sol', value: 1 },
        ]}
      />,
    );
    const svg = chart('Pay');

    press(svg, 'ArrowRight');
    const right = Number.parseFloat(tooltip()?.style.left ?? 'NaN');
    press(svg, 'ArrowRight');
    const left = Number.parseFloat(tooltip()?.style.left ?? 'NaN');

    /* Sağ dilim: ipucu kutunun sağ kenarına yaslanır (300 − 150). */
    expect(right).toBe(150);
    /* Sol dilim: sol kenara kırpılır — merkezin (150) sağına atlamaz. */
    expect(left).toBe(0);
  });
});
