import { labelWidth } from './axes';
import type { PlotArea } from './types';

/** Çizim alanı — sol kenar en uzun sol bölme yazısı kadar, alt kenar x yazıları için. */
export const plotArea = (
  width: number,
  height: number,
  leftLabels: readonly string[],
  { top = 12, right = 16, bottom = 28 } = {},
): PlotArea => {
  const left = Math.max(32, ...leftLabels.map(labelWidth)) + 10;

  return {
    left,
    top,
    right: Math.max(left + 1, width - right),
    bottom: Math.max(top + 1, height - bottom),
    width: Math.max(1, width - right - left),
    height: Math.max(1, height - top - bottom),
  };
};

/** Eksen başına bölme sayısı: yatayda ~90 px, dikeyde ~48 px'te bir. */
export const tickCount = (length: number, horizontal: boolean): number =>
  Math.max(2, Math.floor(length / (horizontal ? 90 : 48)));
