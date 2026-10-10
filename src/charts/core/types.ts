import type { ChartTone } from './palette';

/** İpucunun bir satırı — renk karesi + ad + değer. */
export type TooltipRow = {
  id: string;
  label: string;
  value: string;
  tone?: ChartTone;
};

export type TooltipContent = {
  title?: string;
  rows: TooltipRow[];
};

/** Görsel olarak gizli veri tablosu — ekran okuyucu grafiği TABLO olarak da okur. */
export type ChartTable = {
  columns: string[];
  rows: string[][];
};

export type LegendEntry = {
  id: string;
  label: string;
  tone: ChartTone;
};

/** Grafiğin çizim alanı — eksenler kenar boşluklarında. */
export type PlotArea = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
