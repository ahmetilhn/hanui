/** Metin normalizasyonu — aksan ve büyük/küçük harf duyarsız arama. */

/** Serbest metin arama anahtarı: ASCII, küçük harf, tek boşlukla ayrılmış. */
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

/** Aranan metin, hedefin içinde geçiyor mu? */
export const matchesSearch = (haystack: string, needle: string): boolean =>
  normalizeSearchTerm(haystack).includes(normalizeSearchTerm(needle));
