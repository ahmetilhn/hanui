import type { CartesianSeries } from './cartesian';
import type { ValueFormat } from './format';

/** Türü sarmalayıcının sabitlediği seri: Çizgi, Alan, Çubuk. */
export type ChartSeries = Omit<CartesianSeries, 'type'> & {
  /** Bu serinin değer yazısı (ipucu, tablo) — birimi farklı seri. */
  format?: ValueFormat;
};

/** Bileşik grafiğin serisi: türü seri başına. */
export type ComposedSeries = CartesianSeries & { format?: ValueFormat };
