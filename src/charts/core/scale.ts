/** ÖLÇEKLER — değer → piksel. Grafik kütüphanesi bağımlılığı yok; davranış testlerde sabit. */

export type LinearScale = {
  (value: number): number;
  domain: readonly [number, number];
  range: readonly [number, number];
  invert: (pixel: number) => number;
};

export type BandScale = {
  /** Kategorinin bandının BAŞLANGICI (px). Bilinmeyen kategori `NaN`. */
  (key: string): number;
  domain: readonly string[];
  range: readonly [number, number];
  /** Bandın genişliği — çubuğun kalınlığı. */
  bandwidth: number;
  /** İki bant başlangıcı arası. */
  step: number;
  /** Piksele en yakın kategorinin dizini (`-1`: boş ölçek). */
  indexAt: (pixel: number) => number;
};

/** Doğrusal ölçek. Sıfır genişlikli tanım aralığı aralığın ortasına eşlenir (bölme hatası yok). */
export const scaleLinear = (
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;

  const scale = ((value: number) =>
    span === 0 ? (r0 + r1) / 2 : r0 + ((value - d0) / span) * (r1 - r0)) as LinearScale;

  scale.domain = domain;
  scale.range = range;
  scale.invert = pixel => (r1 === r0 ? d0 : d0 + ((pixel - r0) / (r1 - r0)) * span);

  return scale;
};

/**
 * Kategorik (band) ölçek. `paddingInner` bantlar arası boşluğun adıma oranı, `paddingOuter` iki
 * uçtaki boşluğun adıma oranı.
 */
export const scaleBand = (
  domain: readonly string[],
  range: readonly [number, number],
  { paddingInner = 0.2, paddingOuter = 0.1 } = {},
): BandScale => {
  const [r0, r1] = range;
  const count = domain.length;
  const step = count === 0 ? 0 : (r1 - r0) / Math.max(1, count - paddingInner + paddingOuter * 2);
  const bandwidth = step * (1 - paddingInner);
  const start = r0 + step * paddingOuter;
  const index = new Map(domain.map((key, position) => [key, position]));

  const scale = ((key: string) => {
    const position = index.get(key);
    return position === undefined ? Number.NaN : start + position * step;
  }) as BandScale;

  scale.domain = domain;
  scale.range = range;
  scale.bandwidth = bandwidth;
  scale.step = step;
  scale.indexAt = pixel =>
    count === 0
      ? -1
      : Math.min(
          count - 1,
          Math.max(
            0,
            Math.floor((pixel - r0 - step * paddingOuter + (step - bandwidth) / 2) / step),
          ),
        );

  return scale;
};

/** 1-2-5 × 10ⁿ adımı — "güzel" eksen bölmesi. */
export const tickStep = (min: number, max: number, count: number): number => {
  const span = Math.abs(max - min);
  if (span === 0 || !Number.isFinite(span) || count <= 0) return 1;

  const raw = span / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const error = raw / power;
  const factor = error >= 7.5 ? 10 : error >= 3.5 ? 5 : error >= 1.5 ? 2 : 1;

  return factor * power;
};

/** Kayan nokta artığını siler: 0.1 + 0.2 → 0.3. */
const clean = (value: number, step: number): number => {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(value.toFixed(Math.min(decimals, 12)));
};

/**
 * Tanım aralığını adımın katlarına genişletir — eksen "güzel" bir sayıda başlar ve biter.
 * ⚠ Tek değerli (ya da boş) aralık genişletilir: 0 → [0, 1], 5 → [0, 8]; aksi hâlde ölçek çöker.
 */
export const niceDomain = (min: number, max: number, count = 5): [number, number] => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];

  let low = Math.min(min, max);
  let high = Math.max(min, max);

  if (low === high) {
    if (low === 0) return [0, 1];
    const pad = Math.abs(low) * 0.5;
    low = low > 0 ? 0 : low - pad;
    high = high < 0 ? 0 : high + pad;
  }

  const step = tickStep(low, high, count);
  return [clean(Math.floor(low / step) * step, step), clean(Math.ceil(high / step) * step, step)];
};

/** Aralığı kapsayan bölme değerleri; uçlar dahil. */
export const ticks = (min: number, max: number, count = 5): number[] => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const step = tickStep(min, max, count);
  /* 1e-9 payı: 0.3 / 0.1 = 2.9999999999999996 → uçtaki bölme sessizce düşüyordu. */
  const first = Math.ceil(min / step - 1e-9);
  const last = Math.floor(max / step + 1e-9);
  const values: number[] = [];

  for (let index = first; index <= last && values.length < 1000; index += 1)
    values.push(clean(index * step, step));

  return values;
};

/** Sıralı dizide değere en yakın öğenin dizini — işaretçi isabeti için ikili arama. */
export const nearestIndex = (sorted: readonly number[], value: number): number => {
  if (sorted.length === 0) return -1;

  let low = 0;
  let high = sorted.length - 1;

  while (low < high) {
    const middle = (low + high) >> 1;
    if (sorted[middle] < value) low = middle + 1;
    else high = middle;
  }

  if (low > 0 && Math.abs(sorted[low - 1] - value) <= Math.abs(sorted[low] - value)) return low - 1;
  return low;
};
