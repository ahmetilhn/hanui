/**
 * Metin normalizasyonu — aksan ve büyük/küçük harf duyarsız arama.
 *
 * <p>{@link matchesSearch} `Combobox`ın yerel filtresidir. Sunucu araması
 * (`onSearch`) verildiğinde bileşen hiç filtrelemez; bu yol yalnızca elde
 * duran bir listeyi taramak için.
 */

/**
 * Serbest metin arama anahtarı: ASCII, küçük harf, tek boşlukla ayrılmış.
 *
 * <h3>Neden aksan sökülüyor</h3>
 * Kullanıcı "sisli" yazdığında "Şişli" bulunmalı. Doğru aksanı yakalamak
 * zorunda kalmak — özellikle mobil klavyede — aramayı bitiren bir sürtünme.
 *
 * <h3>Türkçe `İ` özel durumu</h3>
 * `toLowerCase()`ten <em>önce</em> `İ → i` eşlenir: varsayılan küçültme
 * "İSTANBUL"u "i̇stanbul" (birleşik nokta ile) yapıyor ve eşleşmeyi
 * kaçırıyordu. Aynı sorun `ı` için ters yönde yok — o zaten tek kod noktası.
 *
 * <p>Latin-1 aksanları (`é`, `ñ`, `ü`…) `NFD` ayrıştırması + birleştirici
 * işaret temizliğiyle sökülür; Türkçe harfler bu yolla çözülmediği için
 * (`ı` ve `İ` ayrı kod noktaları) önce elle eşlenir.
 */
export const normalizeSearchTerm = (value: string): string =>
  value
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    /* Birlestirici aksan isaretleri (U+0300–U+036F). */
    .replace(/[\u0300-\u036f]/g, '')
    /* NFD'nin ayristirmadigi harfler: her biri tek kod noktasi. */
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .replace(/đ/g, 'd')
    .replace(/ł/g, 'l')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Aranan metin, hedefin içinde geçiyor mu?
 *
 * <p>Aramanın tek kapısı burasıdır: her liste kendi `includes` çağrısını
 * yazdığında biri normalizasyonu atlıyor ve o listede aksanlı arama
 * çalışmıyordu.
 */
export const matchesSearch = (haystack: string, needle: string): boolean =>
  normalizeSearchTerm(haystack).includes(normalizeSearchTerm(needle));
