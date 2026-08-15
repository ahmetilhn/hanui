/**
 * BOYUT BÜTÇESİ.
 *
 * ⚠ KURAL: bütçe **yeşile boyamak için** yükseltilmez. Önce `npm run size` ile
 * ölçülür, artışın NEDEN olduğu yazılır, sonra ölçülen değerin üstüne
 * tanımlı bir pay konur.
 *
 * ⚠ 38 → 42 kB (2026-08-15). Gerekçe: 38 kB, paket **~22 kB**ken konmuştu ve
 * README hâlâ o eski sayıyı yazıyordu (düzeltildi). Kütüphane aradaki sürümlerde
 * meşru şekilde 37,83 kB'ye büyümüş, yani bütçe *kasıtlı olarak* değil
 * *kazara* daralmıştı: kalan pay **170 bayt**tı ve bu, gerçek bir hatayı
 * düzelten sonraki her değişikliği bloklardı (üst katman düzeltmesi tek başına
 * 290 bayt yedi). 42 kB, bugünkü ölçümün ~%11 üstü.
 */
export default [
  {
    name: 'ESM giriş noktası (tüm paket)',
    path: 'build/index.js',
    limit: '42 kB',
    gzip: true,
  },
  {
    name: 'styles.css (TEK dosya — bkz. README)',
    path: 'build/styles.css',
    limit: '22 kB',
    gzip: true,
  },
  /* ASIL koruma: tuketici bunlari cekiyor. */
  {
    name: 'yalnızca Button (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ Button }',
    limit: '4.5 kB',
    gzip: true,
  },
  {
    name: 'yalnızca Badge (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ Badge }',
    limit: '3.8 kB',
    gzip: true,
  },
];
