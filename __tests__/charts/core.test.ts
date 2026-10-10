import { cartesianGeometry, type CartesianInput, toNumber } from '@/charts/core/cartesian';
import { fullNumber, tickLabels } from '@/charts/core/format';
import { plotArea, tickCount } from '@/charts/core/margins';
import { TONE_ORDER, toneAt, toneColor } from '@/charts/core/palette';
import { arcPath, areaPath, linePath, polar, polygonPath } from '@/charts/core/path';
import {
  nearestIndex,
  niceDomain,
  scaleBand,
  scaleLinear,
  tickStep,
  ticks,
} from '@/charts/core/scale';
import { spatialIndex } from '@/charts/core/spatial';
import { boxStats, extent, finite, histogram, quantile } from '@/charts/core/stats';

/*
 * GRAFİK ÇEKİRDEĞİ — saf fonksiyonlar. Her grafiğin doğruluğu buradaki ölçek, istatistik ve yol
 * hesabına dayanıyor; bileşen testleri bunları yeniden ölçmez.
 */

const numbers = (path: string): number[] => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('ölçekler', () => {
  it('doğrusal ölçek eşler ve tersine çevirir', () => {
    const scale = scaleLinear([0, 100], [300, 0]);

    expect(scale(0)).toBe(300);
    expect(scale(50)).toBe(150);
    expect(scale.invert(75)).toBe(75);
  });

  it('sıfır genişlikli tanım aralığı ortaya eşlenir — bölme hatası yok', () => {
    const scale = scaleLinear([5, 5], [0, 200]);

    expect(scale(5)).toBe(100);
    expect(Number.isFinite(scale.invert(10))).toBe(true);
  });

  it('bant ölçeği: bant genişliği, adım ve pikselden dizin', () => {
    const band = scaleBand(['a', 'b', 'c', 'd'], [0, 400], { paddingInner: 0, paddingOuter: 0 });

    expect(band.step).toBe(100);
    expect(band.bandwidth).toBe(100);
    expect(band('c')).toBe(200);
    expect(band('yok')).toBeNaN();
    expect(band.indexAt(250)).toBe(2);
    expect(band.indexAt(-50)).toBe(0);
    expect(band.indexAt(999)).toBe(3);
    expect(scaleBand([], [0, 100]).indexAt(10)).toBe(-1);
  });

  it('bölme adımı 1-2-5 dizisinde', () => {
    expect(tickStep(0, 100, 5)).toBe(20);
    expect(tickStep(0, 1, 4)).toBe(0.2);
    expect(tickStep(0, 7, 5)).toBe(1);
    expect(tickStep(3, 3, 5)).toBe(1);
  });

  it('güzel tanım aralığı genişler; tek değerli aralık çökmez', () => {
    expect(niceDomain(3, 97)).toEqual([0, 100]);
    expect(niceDomain(0, 0)).toEqual([0, 1]);
    expect(niceDomain(5, 5)).toEqual([0, 8]);
    expect(niceDomain(-5, -5)).toEqual([-8, 0]);
    expect(niceDomain(Number.NaN, 4)).toEqual([0, 1]);
  });

  it('bölmeler uçları kapsar ve kayan nokta artığı taşımaz', () => {
    expect(ticks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(ticks(0.1, 0.3, 2)).toEqual([0.1, 0.2, 0.3]);
    expect(ticks(4, 4)).toEqual([4]);
    expect(ticks(Number.NaN, 1)).toEqual([]);
  });

  it('en yakın dizin ikili aramayla bulunur', () => {
    const sorted = [0, 10, 20, 40];

    expect(nearestIndex(sorted, 14)).toBe(1);
    expect(nearestIndex(sorted, 16)).toBe(2);
    expect(nearestIndex(sorted, -100)).toBe(0);
    expect(nearestIndex(sorted, 100)).toBe(3);
    expect(nearestIndex([], 1)).toBe(-1);
  });
});

describe('istatistik', () => {
  it('sonlu olmayanı atar, aralığı yaymadan bulur', () => {
    expect(finite([1, null, undefined, Number.NaN, Infinity, 3])).toEqual([1, 3]);
    expect(extent([4, -2, 9])).toEqual([-2, 9]);
    expect(extent([])).toEqual([0, 0]);
  });

  it('YÜZ BİN gözlemde aralık yığını taşırmaz (yayma `Math.max(...)` taşırıyordu)', () => {
    const values = Array.from({ length: 200_000 }, (_, index) => index);

    expect(extent(values)).toEqual([0, 199_999]);
    expect(histogram(values).reduce((sum, bin) => sum + bin.count, 0)).toBe(200_000);
  });

  it('çeyreklik — R tip 7', () => {
    const sorted = [1, 2, 3, 4];

    expect(quantile(sorted, 0.25)).toBe(1.75);
    expect(quantile(sorted, 0.5)).toBe(2.5);
    expect(quantile([7], 0.9)).toBe(7);
    expect(quantile([], 0.5)).toBeNaN();
  });

  it('kutu özeti: bıyık ucu bir GÖZLEM, dışarıdakiler aykırı', () => {
    const stats = boxStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 40]);

    expect(stats).not.toBeNull();
    expect(stats?.median).toBe(5.5);
    expect(stats?.outliers).toEqual([40]);
    expect(stats?.whiskerHigh).toBe(9);
    expect(stats?.whiskerLow).toBe(1);
    expect(stats?.max).toBe(40);
    expect(boxStats([])).toBeNull();
  });

  it('histogram: bölmeler bitişik, son bölme en büyük değeri İÇERİR', () => {
    const bins = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);

    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(11);
    bins.slice(1).forEach((bin, index) => expect(bin.from).toBeCloseTo(bins[index].to));
    expect(bins.at(-1)?.to).toBeGreaterThanOrEqual(10);
    expect(histogram([])).toEqual([]);
    expect(histogram([3, 3, 3])).toEqual([{ from: 3, to: 4, count: 3 }]);
  });

  it('histogram kayan nokta payıyla boş bir son bölme açmaz', () => {
    const bins = histogram([0.1, 0.2, 0.3, 0.4, 0.5], 4);

    expect(bins.at(-1)?.count).toBeGreaterThan(0);
  });
});

describe('yollar', () => {
  it('çizgi `null`da KESİLİR, sıfıra inmez', () => {
    const path = linePath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      null,
      { x: 30, y: 5 },
      { x: 40, y: 0 },
    ]);

    expect(path.match(/M/g)).toHaveLength(2);
    expect(path).not.toContain('NaN');
  });

  it('monoton eğri veri noktalarının arasında AŞMAZ', () => {
    const points = [
      { x: 0, y: 100 },
      { x: 10, y: 90 },
      { x: 20, y: 10 },
      { x: 30, y: 0 },
    ];
    const ys = numbers(linePath(points, 'monotone')).filter((_, index) => index % 2 === 1);

    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
  });

  it('düz kesimde monoton eğri düz kalır (tepe yok)', () => {
    const path = linePath(
      [
        { x: 0, y: 50 },
        { x: 10, y: 50 },
        { x: 20, y: 50 },
      ],
      'monotone',
    );
    const ys = numbers(path).filter((_, index) => index % 2 === 1);

    expect(new Set(ys)).toEqual(new Set([50]));
  });

  it('alan her kesintisiz parçayı ayrı kapatır', () => {
    const top = [{ x: 0, y: 0 }, { x: 10, y: 5 }, null, { x: 30, y: 5 }, { x: 40, y: 0 }];
    const base = top.map(point => (point ? { x: point.x, y: 100 } : null));

    expect(areaPath(top, base).match(/Z/g)).toHaveLength(2);
  });

  it('kutupsal: 0 saat 12, saat yönünde artar', () => {
    const top = polar(100, 100, 50, 0);
    const right = polar(100, 100, 50, Math.PI / 2);

    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(50);
    expect(right.x).toBeCloseTo(150);
    expect(right.y).toBeCloseTo(100);
  });

  it('dilim: pasta merkezden başlar, halka iç yayla kapanır, boş dilim çizilmez', () => {
    expect(arcPath(100, 100, 50, 0, 0, Math.PI / 2)).toMatch(/^M100,100L/);
    expect(arcPath(100, 100, 50, 30, 0, Math.PI / 2).match(/A/g)).toHaveLength(2);
    expect(arcPath(100, 100, 50, 30, 1, 1)).toBe('');
    expect(arcPath(100, 100, 0, 0, 0, 1)).toBe('');
  });

  it('TAM TUR iki yarım yay olarak çizilir — tek yay kaybolurdu', () => {
    const ring = arcPath(100, 100, 50, 30, 0, Math.PI * 2);
    const pie = arcPath(100, 100, 50, 0, 0, Math.PI * 2);

    expect(ring.match(/A/g)).toHaveLength(4);
    expect(pie.match(/A/g)).toHaveLength(2);
    expect(ring).not.toContain('NaN');
  });

  it('çokgen kapanır; boş çokgen boş yol', () => {
    expect(
      polygonPath([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 5 },
      ]),
    ).toMatch(/Z$/);
    expect(polygonPath([])).toBe('');
  });
});

describe('palet, biçim, kenar boşluğu', () => {
  it('ton sırası dizinle döner; verilen ton kazanır', () => {
    expect(toneAt(0)).toBe(TONE_ORDER[0]);
    expect(toneAt(TONE_ORDER.length)).toBe(TONE_ORDER[0]);
    expect(toneAt(2, 'series-1')).toBe('series-1');
    expect(toneColor('cat-3')).toBe('var(--hanui-cat-3)');
    expect(toneColor('muted')).toBe('var(--hanui-text-3)');
  });

  it('sayı biçimi yerele göre; eksen kısa, ipucu tam', () => {
    expect(tickLabels('tr-TR')([12_500])[0]).toMatch(/^12,5\sB$/);
    expect(fullNumber('tr-TR')(12_500)).toBe('12.500');
    expect(fullNumber('en-US')(1234.5)).toBe('1,234.5');
  });

  /*
   * ⚠ Eksen eskiden sabit "en çok bir ondalık" yazıyordu: 0,005 adımlı maliyet ekseni "0 · 0 · 0 · 0"
   * okunuyordu (ölçüldü: tüketicide). Basamak artık bölme LİSTESİNDEN çıkıyor.
   */
  it('eksen bölmesi: basamak listeden — 0,1 altındaki adım sıfıra çökmez, kısa gösterim çakışmaz', () => {
    const axis = (values: readonly number[], locale = 'tr-TR') =>
      tickLabels(locale)(values).map(label => label.replace(/\s/g, ' '));

    expect(axis([0, 0.005, 0.01, 0.015])).toEqual(['0', '0,005', '0,01', '0,015']);
    expect(axis(ticks(0, 0.014, 3))).toEqual(['0', '0,005', '0,01']);
    expect(axis([12_000, 12_050, 12_100])).toEqual(['12 B', '12,05 B', '12,1 B']);
    expect(axis([0, 5_000, 10_000, 15_000])).toEqual(['0', '5 B', '10 B', '15 B']);
    expect(axis([0, 200_000, 1_000_000, 1_200_000])).toEqual(['0', '200 B', '1 Mn', '1,2 Mn']);
    expect(axis([-0.02, -0.01, 0, 0.01])).toEqual(['-0,02', '-0,01', '0', '0,01']);
    expect(axis([0, 20, 40, 60])).toEqual(['0', '20', '40', '60']);
    expect(axis([0, 0.002, 0.004], 'en-US')).toEqual(['0', '0.002', '0.004']);
  });

  it('eksen bölmesi: kayan nokta artığı basamak sayılmaz; sıfır ve tek bölme', () => {
    const axis = tickLabels('tr-TR');

    expect(axis([0.1, 0.2, 0.1 + 0.2])).toEqual(['0,1', '0,2', '0,3']);
    expect(axis([0])).toEqual(['0']);
    expect(axis([0.005])).toEqual(['0,005']);
    expect(axis([])).toEqual([]);
  });

  it('çizim alanı en uzun sol yazıya göre genişler, hiç sıfıra inmez', () => {
    const narrow = plotArea(400, 200, ['0', '10']);
    const wide = plotArea(400, 200, ['1.000.000']);

    expect(wide.left).toBeGreaterThan(narrow.left);
    expect(plotArea(10, 10, ['uzun bir yazı']).width).toBeGreaterThanOrEqual(1);
    expect(tickCount(480, false)).toBe(10);
    expect(tickCount(10, true)).toBe(2);
  });
});

describe('mekânsal kova', () => {
  const points = [
    { x: 10, y: 10 },
    { x: 100, y: 100 },
    { x: 105, y: 96 },
    { x: Number.NaN, y: 4 },
  ];

  it('yarıçap içindeki EN YAKIN noktayı bulur', () => {
    const index = spatialIndex(points);

    expect(index.nearest(104, 97, 20)).toBe(2);
    expect(index.nearest(12, 12, 20)).toBe(0);
  });

  it('yarıçap dışında `null`; sonlu olmayan nokta yok sayılır', () => {
    const index = spatialIndex(points);

    expect(index.nearest(300, 300, 20)).toBeNull();
    expect(index.nearest(0, 4, 5)).toBeNull();
  });

  it('kova sınırını aşan komşuyu da görür', () => {
    expect(spatialIndex([{ x: 25, y: 25 }], 24).nearest(22, 22, 10)).toBe(0);
  });
});

describe('kartezyen geometri', () => {
  const input = (overrides: Partial<CartesianInput> = {}): CartesianInput => ({
    rows: [
      { x: 'a', up: 10, down: -4 },
      { x: 'b', up: 20, down: -6 },
      { x: 'c', up: null, down: 3 },
    ],
    xKey: 'x',
    series: [
      { key: 'up', label: 'Artı', type: 'bar', tone: 'cat-1' },
      { key: 'down', label: 'Eksi', type: 'bar', tone: 'cat-2' },
    ],
    width: 400,
    height: 240,
    isStacked: false,
    orientation: 'vertical',
    curve: 'linear',
    formatX: String,
    formatLeft: values => values.map(String),
    formatRight: values => values.map(String),
    ...overrides,
  });

  it('sayıya çevirir; eksik ve sonlu olmayan `null`', () => {
    expect(toNumber(4)).toBe(4);
    expect(toNumber('4')).toBeNull();
    expect(toNumber(Number.NaN)).toBeNull();
  });

  it('eksi değer sıfırın ALTINA iner ve sıfır çizgisi verilir', () => {
    const geometry = cartesianGeometry(input());
    const negative = geometry.bars.find(bar => bar.key === 'down' && bar.index === 0);

    expect(geometry.zero).not.toBeNull();
    expect(negative?.y).toBeCloseTo(geometry.zero as number, 0);
    expect(negative?.height).toBeGreaterThan(0);
  });

  it('yığında artı ve eksi AYRI birikir', () => {
    const geometry = cartesianGeometry(input({ isStacked: true }));
    const up = geometry.bars.find(bar => bar.key === 'up' && bar.index === 2);
    const down = geometry.bars.find(bar => bar.key === 'down' && bar.index === 2);

    /* `up` eksik (sıfır yüksekliğinde), `down` = 3 kendi tabanından — eksi yığının üstüne değil. */
    expect(up?.height ?? 0).toBeCloseTo(0);
    expect(down?.y).toBeLessThan(geometry.zero ?? Infinity);
  });

  it('çubuk varken sıfır tanım aralığında — çubuk sıfırdan başlamazsa boyu yalan söyler', () => {
    const geometry = cartesianGeometry(
      input({
        rows: [
          { x: 'a', up: 80 },
          { x: 'b', up: 90 },
        ],
        series: [{ key: 'up', label: 'Artı', type: 'bar', tone: 'cat-1' }],
      }),
    );

    expect(geometry.leftTicks[0].label).toBe('0');
  });

  it('yalnızca çubuk serisi YATAY çizilebilir', () => {
    const horizontal = cartesianGeometry(input({ orientation: 'horizontal' }));
    const mixed = cartesianGeometry(
      input({
        orientation: 'horizontal',
        series: [
          { key: 'up', label: 'Artı', type: 'bar', tone: 'cat-1' },
          { key: 'down', label: 'Eksi', type: 'line', tone: 'cat-2' },
        ],
      }),
    );

    expect(horizontal.bars[0].height).toBeLessThan(horizontal.bars[0].width + 200);
    expect(mixed.lines).toHaveLength(1);
    expect(mixed.categoryTicks.every(tick => tick.position >= mixed.area.left)).toBe(true);
  });

  it('çubuksuz ve sayısal x SÜREKLİ eksen kurar', () => {
    const geometry = cartesianGeometry(
      input({
        rows: [
          { x: 1, up: 1 },
          { x: 2, up: 4 },
          { x: 10, up: 2 },
        ],
        series: [{ key: 'up', label: 'Artı', type: 'line', tone: 'cat-1' }],
      }),
    );

    expect(geometry.isContinuous).toBe(true);
    expect(geometry.bandwidth).toBe(0);
    /* Aralıklar orantılı: 1→2 adımı 2→10 adımının sekizde biri. */
    const [a, b, c] = geometry.centers;
    expect((c - b) / (b - a)).toBeCloseTo(8);
  });

  it('sağ eksen yalnızca bir seri ona bağlıysa', () => {
    const left = cartesianGeometry(input());
    const right = cartesianGeometry(
      input({
        series: [
          { key: 'up', label: 'Artı', type: 'bar', tone: 'cat-1' },
          { key: 'down', label: 'Oran', type: 'line', tone: 'cat-2', axis: 'right' },
        ],
      }),
    );

    expect(left.hasRightAxis).toBe(false);
    expect(right.hasRightAxis).toBe(true);
    expect(right.rightTicks.length).toBeGreaterThan(1);
  });

  it('boş veri bir şekil üretmez ve çökmez', () => {
    const geometry = cartesianGeometry(input({ rows: [] }));

    expect(geometry.bars).toEqual([]);
    expect(geometry.centers).toEqual([]);
  });
});
