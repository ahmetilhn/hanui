/**
 * BOYUT BÜTÇESİ.
 * ⚠ KURAL: bütçe **yeşile boyamak için** yükseltilmez.
 * ⚠ 38 → 42 kB (2026-08-15). Gerekçe: 38 kB, paket **~22 kB**ken konmuştu ve README hâlâ o eski
 * sayıyı yazıyordu (düzeltildi).
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
  /*
   * SOHBET GİRİŞİ — ana girişten AYRI ölçülür ve ana giriş içinde SAYILMAZ (`@ahmetilhn/hanui`
   * dışsal: tüketici onu zaten indiriyor). Bütçe ilk ölçümden konur, yeşile boyamak için büyümez.
   */
  {
    name: 'chat girişi (tümü)',
    path: 'build/chat.js',
    ignore: ['@ahmetilhn/hanui'],
    /* İlk ölçüm (2026-10-10, 20 bileşen): 6,29 kB. */
    limit: '8 kB',
    gzip: true,
  },
  {
    name: 'chat.css',
    path: 'build/chat.css',
    /* İlk ölçüm (2026-10-10): 3,90 kB. */
    limit: '5 kB',
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
