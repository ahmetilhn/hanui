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
 *
 * ⚠ Button 4,5 → 5,2 kB · Badge 3,8 → 4,5 kB · styles.css 22 → 24 kB (4.0.0).
 * Gerekçe **akışkan ölçek**: metrik token'ları artık tek bir punto değil bir
 * `clamp()` ifadesi taşıyor (`47px` → `calc(clamp(30px, 1.4592rem + 1.8478vw,
 * 47px) * var(--hanui-type-scale))`) ve `tokens.ts` her bileşenin ağacında
 * duruyor. Ölçüldü: Button 4,86 kB (+358 B), Badge 4,14 kB (+339 B).
 *
 * ⚠ `styles.css` bu turda bütçeyi AŞMADI (21,86 kB) ve yükseltmenin sebebi
 * bugünkü ölçüm değil, **kalan pay**: 140 bayt. Duyarlılık turu 60'a yakın
 * yeni medya bloğu ekliyor ve o iş bütçeye takılırsa doğru tepki bloğu
 * silmek olmaz. 24 kB, ölçülenin ~%10 üstü.
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
    limit: '24 kB',
    gzip: true,
  },
  /* ASIL koruma: tuketici bunlari cekiyor. */
  {
    name: 'yalnızca Button (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ Button }',
    limit: '5.2 kB',
    gzip: true,
  },
  {
    name: 'yalnızca Badge (ağaç sarsma)',
    path: 'build/index.js',
    import: '{ Badge }',
    limit: '4.5 kB',
    gzip: true,
  },
];
