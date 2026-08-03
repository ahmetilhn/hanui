/**
 * Metin çözümlemesi: prop → sağlayıcı config'i → geliştirme uyarısı.
 *
 * <p>Sözleşme `theme/labels.ts` içinde anlatıldı. Buradaki tek iş, eksik bir
 * metni SESSİZ bırakmamak: `aria-label`ı olmayan bir kapatma düğmesi ekran
 * okuyucuda "düğme" diye okunur ve bu, ekranda hiçbir iz bırakmayan bir
 * erişilebilirlik hatası. Derleyici bunu göremiyor (sağlayıcı çalışma
 * zamanında), o yüzden geliştirme kipinde konsola iniyor.
 */

/*
 * Uyari ANAHTAR BASINA bir kez verilir.
 *
 * Uyari her render'da yazilsaydi, listedeki yirmi satirin her biri icin ayni
 * satir konsola dusuyor ve gercek hatalar o gurultunun icinde kayboluyordu.
 */
const warned = new Set<string>();

/** Uyarı durumu testler arasında sızmamalı; her test kendi durumundan başlar. */
export const resetLabelWarnings = (): void => warned.clear();

/**
 * Verilen metni çözer.
 *
 * @param key Uyarıda gösterilecek yol (`Modal.closeLabel`).
 * @param values Öncelik sırasına göre adaylar: prop önce, config sonra.
 */
export const resolveLabel = (key: string, ...values: (string | undefined)[]): string => {
  for (const value of values) if (value !== undefined) return value;

  if (process.env.NODE_ENV !== 'production' && !warned.has(key)) {
    warned.add(key);
    console.error(
      `[hanui] Eksik metin: ${key}. Prop olarak geçin ya da ` +
        '<HanuiProvider labels={…}> içinde bir kez tanımlayın. ' +
        'Metinsiz bırakılan öğe ekran okuyucuda adsız kalır.',
    );
  }

  return '';
};

/**
 * Biçimlendirici çözümü — değere bağlı metinler için.
 *
 * <p>`CopyField`in "SP-123 kopyala"sı ve `Rating`in "5 üzerinden 4,5"i bir
 * dize olamaz: içine değer giriyor. Config bir fonksiyon taşır.
 */
export const resolveFormatter = <TArgs extends unknown[]>(
  key: string,
  formatter: Formatter<TArgs> | undefined,
  ...args: TArgs
): string => {
  if (formatter) return formatter(...args);

  return resolveLabel(key);
};

type Formatter<TArgs extends unknown[]> = (...args: TArgs) => string;
