/**
 * SERİ RENKLERİ — hanui kategorik paleti (`cat-1…5`, `series-2`). Her ton iki temanın üç
 * yüzeyinde ≥3:1 (`check:contrast`) ve iki ton arasında ΔE ≥ 8 (palet üreteci).
 * ⚠ Marka yeşilleri (çam, mint) seri rengi OLMAZ: yeşil eylemin rengi. `cat-3` orta aydınlıkta bir
 * kategori yeşili.
 */
export type ChartTone =
  'cat-1' | 'cat-2' | 'cat-3' | 'cat-4' | 'cat-5' | 'series-1' | 'series-2' | 'muted';

/** Sıra: ilk iki seri en uzak iki ton (mavi, kil) — iki serili grafik en sık durum. */
export const TONE_ORDER: readonly ChartTone[] = [
  'cat-1',
  'cat-2',
  'cat-3',
  'cat-4',
  'cat-5',
  'series-2',
];

/** Verilmeyen tonu sıradan alır; altıdan fazla seride döner (lejant adı ayırt eder). */
export const toneAt = (index: number, tone?: ChartTone): ChartTone =>
  tone ?? TONE_ORDER[index % TONE_ORDER.length];

/** CSS rengi — tema değişince yeniden çizim gerekmez, değişken çözülür. */
export const toneColor = (tone: ChartTone): string =>
  tone === 'muted' ? 'var(--hanui-text-3)' : `var(--hanui-${tone})`;
