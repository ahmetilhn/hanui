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

/** Eksen bölmelerinin yazısı — tek değerden değil LİSTEDEN: gereken basamak bölmelerin hepsinden çıkar. */
export type TickFormat = (values: readonly number[]) => string[];

/**
 * Bilimsel gösterimde ilk ve son anlamlı basamağın üssü (12 050 → 4 ve 1, 0,005 → −3 ve −3). On
 * basamakta yuvarlanır: kayan nokta artığı (`0.30000000000000004`) basamak sayılmaz.
 */
const digitExponents = (value: number): { first: number; last: number } | null => {
  if (value === 0 || !Number.isFinite(value)) return null;

  const [mantissa, exponent] = Math.abs(value).toExponential(9).split('e');
  const first = Number(exponent);

  return { first, last: first - (mantissa.replace('.', '').replace(/0+$/, '').length - 1) };
};

/**
 * Eksen bölmeleri: KISA gösterim ("12 B", "1,2 Mn"). Uzun bir sayı dar bir eksende üst üste biniyor;
 * tam değer ipucunda ve veri tablosunda okunur.
 *
 * Basamak sayısı bölmelerin HEPSİNİ tam yazan en az basamak: en küçük anlamlı basamağı en ince olan
 * bölme belirler, her bölme o basamağa kadar yazılır. 0,005 adımlı eksen "0 · 0,005 · 0,01 · 0,015",
 * 50 adımlı "12 B · 12,05 B · 12,1 B".
 *
 * ⚠ Eskiden sabit "en çok bir ondalık" yazıyordu ve adımı 0,1'in altında kalan HER eksen sıfıra
 * çöküyordu: 0,001-0,014 USD'lik maliyet grafiği "0 · 0 · 0 · 0" okunuyordu (ölçüldü: tüketicide).
 * Kısa gösterimde de aynı hata vardı — 12 050 ile 12 100 ikisi de "12,1 B".
 */
export const tickLabels =
  (locale?: string): TickFormat =>
  values => {
    const last = values.reduce(
      (finest, value) => Math.min(finest, digitExponents(value)?.last ?? finest),
      Number.POSITIVE_INFINITY,
    );

    return values.map(value =>
      formatter(locale, {
        notation: 'compact',
        maximumSignificantDigits: Math.min(
          21,
          Math.max(1, (digitExponents(value)?.first ?? 0) - last + 1),
        ),
      }).format(value),
    );
  };

/** İpucu ve tablo: tam değer, en çok iki ondalık. */
export const fullNumber =
  (locale?: string): ValueFormat =>
  value =>
    formatter(locale, { maximumFractionDigits: 2 }).format(value);
