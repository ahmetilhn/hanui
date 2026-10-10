/** İSTATİSTİK — kutu grafiği ve histogram. Sonlu olmayan değerler (`NaN`, `±Infinity`) atılır. */

import { tickStep } from './scale';

export const finite = (values: readonly (number | null | undefined)[]): number[] =>
  values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

/** `[en küçük, en büyük]`; boş girdide `[0, 0]`. Dizi YAYILMAZ: büyük veride çağrı yığını taşmaz. */
export const extent = (values: readonly number[]): [number, number] => {
  if (values.length === 0) return [0, 0];

  let min = values[0];
  let max = values[0];
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return [min, max];
};

/** Sıralı dizide çeyreklik — doğrusal ara değer (R tip 7 / Excel / NumPy varsayılanı). */
export const quantile = (sorted: readonly number[], probability: number): number => {
  if (sorted.length === 0) return Number.NaN;
  if (sorted.length === 1) return sorted[0];

  const position = (sorted.length - 1) * Math.min(1, Math.max(0, probability));
  const lower = Math.floor(position);
  const fraction = position - lower;

  return lower + 1 < sorted.length
    ? sorted[lower] + (sorted[lower + 1] - sorted[lower]) * fraction
    : sorted[lower];
};

export type BoxStats = {
  count: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  /** Bıyıkların ucu: 1,5 × IQR içindeki en uç GÖZLEM (Tukey). */
  whiskerLow: number;
  whiskerHigh: number;
  /** Bıyık dışında kalan gözlemler. */
  outliers: number[];
};

/** Beş sayı özeti + Tukey bıyıkları. Boş girdide `null`. */
export const boxStats = (values: readonly number[]): BoxStats | null => {
  const sorted = finite(values).sort((first, second) => first - second);
  if (sorted.length === 0) return null;

  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const fence = (q3 - q1) * 1.5;
  const inside = sorted.filter(value => value >= q1 - fence && value <= q3 + fence);

  return {
    count: sorted.length,
    min: sorted[0],
    q1,
    median: quantile(sorted, 0.5),
    q3,
    max: sorted[sorted.length - 1],
    whiskerLow: inside[0] ?? q1,
    whiskerHigh: inside[inside.length - 1] ?? q3,
    outliers: sorted.filter(value => value < q1 - fence || value > q3 + fence),
  };
};

export type Bin = {
  /** Dahil alt sınır. */
  from: number;
  /** Hariç üst sınır — SON bölme dahil. */
  to: number;
  count: number;
};

/**
 * Histogram bölmeleri. Bölme sayısı verilmezse Sturges (`⌈log₂ n⌉ + 1`); sınırlar "güzel" bir adıma
 * oturur, yani bölmeler 0-10-20 gibi okunur.
 * ⚠ Son bölme üst ucu DAHİL eder: en büyük değer dışarıda kalmaz.
 */
export const histogram = (values: readonly number[], binCount?: number): Bin[] => {
  const data = finite(values);
  if (data.length === 0) return [];

  const [min, max] = extent(data);
  if (min === max) return [{ from: min, to: min + 1, count: data.length }];

  const target = binCount ?? Math.ceil(Math.log2(data.length)) + 1;
  const step = tickStep(min, max, Math.max(1, target));
  const start = Math.floor(min / step) * step;
  /* 1e-9 payı: (max - start) / step kayan noktada 5.000000001 çıkıp boş bir altıncı bölme açıyordu. */
  const count = Math.max(1, Math.ceil((max - start) / step - 1e-9));

  const bins: Bin[] = Array.from({ length: count }, (_, index) => ({
    from: start + index * step,
    to: start + (index + 1) * step,
    count: 0,
  }));

  for (const value of data) {
    const index = Math.min(bins.length - 1, Math.floor((value - start) / step));
    bins[index].count += 1;
  }

  return bins;
};
