/** Sınıf birleştiricinin kabul ettiği değerler. */
export type ClassValue = string | false | null | undefined;

/**
 * Sınıf adı birleştirici.
 *
 * <h3>Neden `clsx` değil</h3>
 * Kaynak tasarım sistemi `clsx` kullanıyordu ve orada doğruydu — bir
 * uygulamada 500 baytlık bir bağımlılık bedava. Bir <em>kütüphanede</em> aynı
 * bağımlılık tüketicinin ağacına ineriyor ve `clsx`ın desteklediği yedi
 * girdi biçiminden (nesne, iç içe dizi, sayı…) burada yalnızca ikisi
 * kullanılıyor: dize ve koşullu dize.
 *
 * <p>Bilerek DAR: nesne biçimi (`{ active: true }`) desteklenmez. Desteklemek
 * çağrı yerlerinde iki ayrı yazım stiline yol açıyor ve hangisinin kullanıldığı
 * dosyadan dosyaya değişiyordu.
 */
export const cx = (...values: ClassValue[]): string => {
  let result = '';

  for (const value of values) {
    if (!value) continue;
    result = result === '' ? value : `${result} ${value}`;
  }

  return result;
};
