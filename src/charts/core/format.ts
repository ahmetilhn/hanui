/** SAYI BİÇİMİ — eksen ve ipucu metni. Dil `labels.locale`ten, verilmezse tarayıcının dili. */

export type ValueFormat = (value: number) => string;

const cache = new Map<string, Intl.NumberFormat>();

const formatter = (
  locale: string | undefined,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let instance = cache.get(key);

  if (!instance) {
    instance = new Intl.NumberFormat(locale, options);
    cache.set(key, instance);
  }

  return instance;
};

/**
 * Eksen bölmesi: KISA gösterim ("12 B", "1,2 Mn"). Uzun bir sayı dar bir eksende üst üste biniyor;
 * tam değer ipucunda ve veri tablosunda okunur.
 */
export const compactNumber =
  (locale?: string): ValueFormat =>
  value =>
    formatter(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);

/** İpucu ve tablo: tam değer, en çok iki ondalık. */
export const fullNumber =
  (locale?: string): ValueFormat =>
  value =>
    formatter(locale, { maximumFractionDigits: 2 }).format(value);
