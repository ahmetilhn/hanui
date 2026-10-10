/** KARTEZYEN GEOMETRİ — Çizgi, Alan, Çubuk ve Bileşik grafiğin ortak, saf (DOM'suz) motoru. */

import { fitLabel, labelWidth, type Tick } from './axes';
import type { ValueFormat } from './format';
import { type ChartTone } from './palette';
import { areaPath, type Curve, linePath, type MaybePoint } from './path';
import {
  type LinearScale,
  niceDomain,
  scaleBand,
  scaleLinear,
  ticks as linearTicks,
} from './scale';
import { extent } from './stats';
import type { PlotArea } from './types';

export type CartesianSeriesType = 'line' | 'area' | 'bar';

export type CartesianSeries = {
  /** Satırdaki alanın adı. */
  key: string;
  label: string;
  type: CartesianSeriesType;
  tone?: ChartTone;
  /** İkinci değer ekseni (sağ) — farklı birimdeki seri. */
  axis?: 'left' | 'right';
};

export type Orientation = 'vertical' | 'horizontal';

export type CartesianInput = {
  rows: readonly Record<string, unknown>[];
  xKey: string;
  /** Yalnızca GÖRÜNÜR seriler, tonları çözülmüş. */
  series: readonly (CartesianSeries & { tone: ChartTone })[];
  width: number;
  height: number;
  isStacked: boolean;
  orientation: Orientation;
  curve: Curve;
  formatX: (value: unknown) => string;
  formatLeft: ValueFormat;
  formatRight: ValueFormat;
  /** Değer ekseninin sabit uçları; verilmeyen uç veriden. */
  domain?: readonly [number | undefined, number | undefined];
};

export type BarShape = {
  key: string;
  index: number;
  tone: ChartTone;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CartesianGeometry = {
  area: PlotArea;
  /** Kategori ekseni boyunca her satırın merkezi (px). */
  centers: number[];
  /** Kategori bandının genişliği; sürekli eksende 0. */
  bandwidth: number;
  isContinuous: boolean;
  categoryTicks: Tick[];
  leftTicks: Tick[];
  rightTicks: Tick[];
  hasRightAxis: boolean;
  lines: { key: string; tone: ChartTone; d: string }[];
  areas: { key: string; tone: ChartTone; d: string }[];
  bars: BarShape[];
  /** Seri → dizin → çizgi/alan noktası (vurgu halkası için). */
  points: Record<string, MaybePoint[]>;
  /** Dizin → ipucunun bağlanacağı en üst değer noktası. */
  anchors: { x: number; y: number }[];
  /** Sol değer ekseninde SIFIRIN konumu — yalnızca tanım aralığı eksiye indiğinde (yoksa `null`). */
  zero: number | null;
};

/** Sayıya çevirir; sonlu olmayan değer `null` (eksik veri). */
export const toNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const MARGIN = { top: 12, right: 16, bottom: 28, minLeft: 32 };

/** Yığın: her dizin için artı ve eksi değerler AYRI birikir (eksi çubuk sıfırın altına iner). */
const stack = (
  rows: readonly Record<string, unknown>[],
  keys: readonly string[],
): Record<string, { base: number; top: number }[]> => {
  const positive = rows.map(() => 0);
  const negative = rows.map(() => 0);
  const result: Record<string, { base: number; top: number }[]> = {};

  for (const key of keys)
    result[key] = rows.map((row, index) => {
      const value = toNumber(row[key]) ?? 0;
      if (value >= 0) {
        const base = positive[index];
        positive[index] += value;
        return { base, top: positive[index] };
      }
      const base = negative[index];
      negative[index] += value;
      return { base, top: negative[index] };
    });

  return result;
};

export const cartesianGeometry = (input: CartesianInput): CartesianGeometry => {
  const { rows, xKey, series, width, height, isStacked, curve, formatX } = input;
  const hasBars = series.some(item => item.type === 'bar');
  const orientation: Orientation =
    hasBars && series.every(item => item.type === 'bar') ? input.orientation : 'vertical';
  const isHorizontal = orientation === 'horizontal';

  const xValues = rows.map(row => row[xKey]);
  const isContinuous =
    !hasBars &&
    !isHorizontal &&
    xValues.length > 1 &&
    xValues.every(value => toNumber(value) !== null);

  /* --- Yığınlar: aynı eksen + aynı tür birlikte yığılır; çizgi yığılmaz. --- */
  const stacks: Record<string, { base: number; top: number }[]> = {};
  if (isStacked)
    for (const axis of ['left', 'right'] as const)
      for (const type of ['bar', 'area'] as const) {
        const keys = series
          .filter(item => (item.axis ?? 'left') === axis && item.type === type)
          .map(item => item.key);
        Object.assign(stacks, stack(rows, keys));
      }

  const valueOf = (key: string, index: number): { base: number; top: number } | null => {
    if (stacks[key]) return stacks[key][index];
    const value = toNumber(rows[index][key]);
    return value === null ? null : { base: 0, top: value };
  };

  /* --- Değer tanım aralıkları (eksen başına). --- */
  const domainFor = (axis: 'left' | 'right'): [number, number] | null => {
    const members = series.filter(item => (item.axis ?? 'left') === axis);
    if (members.length === 0) return null;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const item of members)
      for (let index = 0; index < rows.length; index += 1) {
        const value = valueOf(item.key, index);
        if (!value) continue;
        min = Math.min(min, value.top, value.base);
        max = Math.max(max, value.top, value.base);
      }

    /* Çubuk ve alan sıfırdan çizilir: sıfır tanım aralığında OLMALI. */
    if (members.some(item => item.type !== 'line')) {
      min = Math.min(min, 0);
      max = Math.max(max, 0);
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];

    const [fixedMin, fixedMax] =
      axis === 'left' ? (input.domain ?? [undefined, undefined]) : [undefined, undefined];
    const nice = niceDomain(fixedMin ?? min, fixedMax ?? max);
    return [fixedMin ?? nice[0], fixedMax ?? nice[1]];
  };

  const leftDomain = domainFor('left') ?? [0, 1];
  const rightDomain = domainFor('right');
  const hasRightAxis = rightDomain !== null && !isHorizontal;

  /* --- Kenar boşlukları: bölme yazısının en uzunu kadar. --- */
  const leftLabels = linearTicks(leftDomain[0], leftDomain[1], 5).map(input.formatLeft);
  const rightLabels = rightDomain
    ? linearTicks(rightDomain[0], rightDomain[1], 5).map(input.formatRight)
    : [];
  const categoryLabels = rows.map(row => formatX(row[xKey]));

  const left = isHorizontal
    ? Math.min(width * 0.4, Math.max(MARGIN.minLeft, ...categoryLabels.map(labelWidth)) + 12)
    : Math.max(MARGIN.minLeft, ...leftLabels.map(labelWidth)) + 10;
  const right = hasRightAxis
    ? Math.max(MARGIN.minLeft, ...rightLabels.map(labelWidth)) + 10
    : MARGIN.right;

  const area: PlotArea = {
    left,
    top: MARGIN.top,
    right: Math.max(left + 1, width - right),
    bottom: Math.max(MARGIN.top + 1, height - MARGIN.bottom),
    width: Math.max(1, width - right - left),
    height: Math.max(1, height - MARGIN.bottom - MARGIN.top),
  };

  /* --- Ölçekler. Kategori ekseni dikeyde yatay, yatayda dikey. --- */
  const categoryRange: [number, number] = isHorizontal
    ? [area.top, area.bottom]
    : [area.left, area.right];
  const valueRange: [number, number] = isHorizontal
    ? [area.left, area.right]
    : [area.bottom, area.top];

  const leftScale = scaleLinear(leftDomain, valueRange);
  const rightScale = rightDomain ? scaleLinear(rightDomain, valueRange) : leftScale;
  const scaleFor = (item: CartesianSeries) =>
    (item.axis ?? 'left') === 'right' && rightDomain ? rightScale : leftScale;

  let centers: number[];
  let bandwidth = 0;
  /* Sürekli eksenin ölçeği; bölmeler de bundan. ⚠ `Math.min(...dizi)` değil `extent`: on binlerce
     noktada yayılan argüman çağrı yığınını taşırıyordu. */
  let xScale: LinearScale | null = null;

  if (isContinuous) {
    const numeric = xValues.map(value => toNumber(value) as number);
    xScale = scaleLinear(extent(numeric), categoryRange);
    centers = numeric.map(xScale);
  } else {
    const band = scaleBand(
      rows.map((_, index) => String(index)),
      categoryRange,
      hasBars ? { paddingInner: 0.24, paddingOuter: 0.12 } : { paddingInner: 0, paddingOuter: 0 },
    );
    bandwidth = band.bandwidth;
    centers = rows.map((_, index) => band(String(index)) + band.bandwidth / 2);
  }

  /* Yön dönüşümü: (kategori, değer) → (x, y). */
  const at = (category: number, value: number) =>
    isHorizontal ? { x: value, y: category } : { x: category, y: value };

  /* --- Şekiller. --- */
  const bars: BarShape[] = [];
  const barSeries = series.filter(item => item.type === 'bar');
  const slots = isStacked ? 1 : Math.max(1, barSeries.length);
  const slotGap = slots > 1 ? Math.min(2, bandwidth * 0.04) : 0;
  const slotWidth = Math.max(1, (bandwidth - slotGap * (slots - 1)) / slots);

  barSeries.forEach((item, seriesIndex) => {
    const scale = scaleFor(item);
    const slot = isStacked ? 0 : seriesIndex;

    rows.forEach((_, index) => {
      const value = valueOf(item.key, index);
      if (!value || value.top === value.base) return;

      const start = centers[index] - bandwidth / 2 + slot * (slotWidth + slotGap);
      const v0 = scale(value.base);
      const v1 = scale(value.top);
      const low = Math.min(v0, v1);
      const span = Math.max(1, Math.abs(v1 - v0));

      bars.push(
        isHorizontal
          ? {
              key: item.key,
              index,
              tone: item.tone,
              x: low,
              y: start,
              width: span,
              height: slotWidth,
            }
          : {
              key: item.key,
              index,
              tone: item.tone,
              x: start,
              y: low,
              width: slotWidth,
              height: span,
            },
      );
    });
  });

  const points: Record<string, MaybePoint[]> = {};
  const lines: CartesianGeometry['lines'] = [];
  const areas: CartesianGeometry['areas'] = [];

  for (const item of series) {
    if (item.type === 'bar') continue;
    const scale = scaleFor(item);
    const top = rows.map((_, index) => {
      const value = valueOf(item.key, index);
      return value ? at(centers[index], scale(value.top)) : null;
    });
    points[item.key] = top;

    if (item.type === 'area') {
      const base = rows.map((_, index) => {
        const value = valueOf(item.key, index);
        return value ? at(centers[index], scale(value.base)) : null;
      });
      areas.push({ key: item.key, tone: item.tone, d: areaPath(top, base, curve) });
    }

    lines.push({ key: item.key, tone: item.tone, d: linePath(top, curve) });
  }

  /* --- İpucu çapası: dizindeki en uç değer (dikeyde en üst, yatayda en sağ). --- */
  const anchors = rows.map((_, index) => {
    let extreme: number | null = null;
    for (const item of series) {
      const value = valueOf(item.key, index);
      if (!value) continue;
      const pixel = scaleFor(item)(value.top);
      extreme =
        extreme === null
          ? pixel
          : isHorizontal
            ? Math.max(extreme, pixel)
            : Math.min(extreme, pixel);
    }
    const fallback = isHorizontal ? area.left : area.bottom;
    return at(centers[index], extreme ?? fallback);
  });

  /* --- Bölmeler. --- */
  const toTicks = (
    scale: typeof leftScale,
    domain: readonly [number, number],
    format: ValueFormat,
  ): Tick[] =>
    linearTicks(
      domain[0],
      domain[1],
      isHorizontal
        ? Math.max(2, Math.floor(area.width / 90))
        : Math.max(2, Math.floor(area.height / 48)),
    ).map(value => ({
      position: scale(value),
      label: format(value),
    }));

  const categoryTicks: Tick[] = xScale
    ? linearTicks(xScale.domain[0], xScale.domain[1], Math.max(2, Math.floor(area.width / 90))).map(
        value => ({
          position: (xScale as LinearScale)(value),
          label: formatX(value),
        }),
      )
    : rows.map((_, index) => ({
        position: centers[index],
        label: isHorizontal ? fitLabel(categoryLabels[index], left - 12) : categoryLabels[index],
      }));

  return {
    zero: leftDomain[0] < 0 && leftDomain[1] > 0 ? leftScale(0) : null,
    area,
    centers,
    bandwidth,
    isContinuous,
    categoryTicks,
    leftTicks: toTicks(leftScale, leftDomain, input.formatLeft),
    rightTicks:
      hasRightAxis && rightDomain ? toTicks(rightScale, rightDomain, input.formatRight) : [],
    hasRightAxis,
    lines,
    areas,
    bars,
    points,
    anchors,
  };
};
