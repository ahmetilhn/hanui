/** SVG YOLLARI — dize üretimi; DOM'a dokunmaz, saf fonksiyon (test edilebilir, sunucuda çalışır). */

export type Point = { x: number; y: number };

const round = (value: number): number => Math.round(value * 100) / 100;

/** `null` boşluk demektir: çizgi orada KESİLİR, sıfıra inmez (eksik veri ≠ sıfır). */
export type MaybePoint = Point | null;

const segments = (points: readonly MaybePoint[]): Point[][] => {
  const result: Point[][] = [];
  let current: Point[] = [];

  for (const point of points) {
    if (point === null || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      if (current.length > 0) result.push(current);
      current = [];
    } else current.push(point);
  }

  if (current.length > 0) result.push(current);
  return result;
};

/** Doğrusal parça. */
const linear = (points: readonly Point[]): string =>
  points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${round(point.x)},${round(point.y)}`)
    .join('');

/**
 * Monoton kübik eğri (Fritsch–Carlson). Veri noktalarının ARASINDA aşma yapmaz: tepe ya da dip
 * olmayan bir yerde eğri, sıradan bir Catmull-Rom'un yaptığı gibi verinin üstüne çıkmaz — grafik
 * olmayan bir değeri göstermez.
 */
const monotone = (points: readonly Point[]): string => {
  const count = points.length;
  if (count < 3) return linear(points);

  const slopes: number[] = [];
  const deltas: number[] = [];

  for (let index = 0; index < count - 1; index += 1) {
    const dx = points[index + 1].x - points[index].x;
    deltas.push(dx === 0 ? 0 : (points[index + 1].y - points[index].y) / dx);
  }

  slopes.push(deltas[0]);
  for (let index = 1; index < count - 1; index += 1)
    slopes.push(
      deltas[index - 1] * deltas[index] <= 0 ? 0 : (deltas[index - 1] + deltas[index]) / 2,
    );
  slopes.push(deltas[count - 2]);

  for (let index = 0; index < count - 1; index += 1) {
    if (deltas[index] === 0) {
      slopes[index] = 0;
      slopes[index + 1] = 0;
      continue;
    }

    const alpha = slopes[index] / deltas[index];
    const beta = slopes[index + 1] / deltas[index];
    const magnitude = alpha * alpha + beta * beta;

    if (magnitude > 9) {
      const tau = 3 / Math.sqrt(magnitude);
      slopes[index] = tau * alpha * deltas[index];
      slopes[index + 1] = tau * beta * deltas[index];
    }
  }

  let path = `M${round(points[0].x)},${round(points[0].y)}`;

  for (let index = 0; index < count - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const third = (end.x - start.x) / 3;

    path +=
      `C${round(start.x + third)},${round(start.y + slopes[index] * third)} ` +
      `${round(end.x - third)},${round(end.y - slopes[index + 1] * third)} ` +
      `${round(end.x)},${round(end.y)}`;
  }

  return path;
};

export type Curve = 'linear' | 'monotone';

/** Çizgi yolu; `null` noktalarda kesilir. */
export const linePath = (points: readonly MaybePoint[], curve: Curve = 'linear'): string =>
  segments(points)
    .map(part => (curve === 'monotone' ? monotone(part) : linear(part)))
    .join('');

/**
 * Alan yolu: üst çizgi + taban çizgisi (yığılmış alanda bir alttaki serinin üstü). Her kesintisiz
 * parça kendi kapalı şekli.
 */
export const areaPath = (
  top: readonly MaybePoint[],
  base: readonly MaybePoint[],
  curve: Curve = 'linear',
): string => {
  const paths: string[] = [];
  let upper: Point[] = [];
  let lower: Point[] = [];

  const flush = () => {
    if (upper.length > 0) {
      const draw = curve === 'monotone' ? monotone : linear;
      const back = draw([...lower].reverse()).replace(/^M/, 'L');
      paths.push(`${draw(upper)}${back}Z`);
    }
    upper = [];
    lower = [];
  };

  top.forEach((point, index) => {
    const floor = base[index];
    if (point === null || floor === null || floor === undefined) flush();
    else {
      upper.push(point);
      lower.push(floor);
    }
  });
  flush();

  return paths.join('');
};

/** Kutupsal → kartezyen; açı radyan, 0 = saat 12 yönü, saat yönünde artar. */
export const polar = (cx: number, cy: number, radius: number, angle: number): Point => ({
  x: cx + radius * Math.sin(angle),
  y: cy - radius * Math.cos(angle),
});

/**
 * Halka / pasta dilimi. `inner` 0 ise pasta. ⚠ Tam tur (2π) TEK bir yay olarak çizilemez (başlangıç
 * ve bitiş aynı nokta, yay kaybolur); iki yarım yaya bölünür.
 */
export const arcPath = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string => {
  const sweep = end - start;
  if (sweep <= 0 || outer <= 0) return '';

  if (sweep >= Math.PI * 2 - 1e-6) {
    /*
     * Tam tur: iki yarım çember; iç çember TERS yönde çizilir ve sıfır-olmayan kuralı deliği kendisi
     * açar. İki ayrı dilime bölmek, ayırıcı kenar çizgisinde görünür bir dikiş bırakıyordu.
     */
    const ring = (radius: number, sweepFlag: 0 | 1) =>
      `M${round(cx)},${round(cy - radius)}` +
      `A${radius},${radius} 0 1 ${sweepFlag} ${round(cx)},${round(cy + radius)}` +
      `A${radius},${radius} 0 1 ${sweepFlag} ${round(cx)},${round(cy - radius)}Z`;

    return ring(outer, 1) + (inner > 0 ? ring(inner, 0) : '');
  }

  const large = sweep > Math.PI ? 1 : 0;
  const o0 = polar(cx, cy, outer, start);
  const o1 = polar(cx, cy, outer, end);

  if (inner <= 0)
    return `M${round(cx)},${round(cy)}L${round(o0.x)},${round(o0.y)}A${outer},${outer} 0 ${large} 1 ${round(o1.x)},${round(o1.y)}Z`;

  const i1 = polar(cx, cy, inner, end);
  const i0 = polar(cx, cy, inner, start);

  return (
    `M${round(o0.x)},${round(o0.y)}A${outer},${outer} 0 ${large} 1 ${round(o1.x)},${round(o1.y)}` +
    `L${round(i1.x)},${round(i1.y)}A${inner},${inner} 0 ${large} 0 ${round(i0.x)},${round(i0.y)}Z`
  );
};

/** Kapalı çokgen (radar). */
export const polygonPath = (points: readonly Point[]): string =>
  points.length === 0 ? '' : `${linear(points)}Z`;
