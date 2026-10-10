/**
 * BOYUT BÜTÇESİ.
 * ⚠ KURAL: bütçe **yeşile boyamak için** yükseltilmez.
 * ⚠ 38 → 42 kB (2026-08-15). Gerekçe: 38 kB, paket **~22 kB**ken konmuştu ve README hâlâ o eski
 * sayıyı yazıyordu (düzeltildi).
 * ⚠ 42 → 43 kB (2026-10-10). Ölçüm 42,05 kB: 5.1 bileşenleri (`Disclosure`, `StatusDot`, `Kbd`)
 * girişi tam sınıra getirmişti, `HanuiThemeScript` (5.2 — sunucu düzeninde çizilen tema betiği,
 * `themeBootScript()`in yerine) 49 B aştırdı. Sohbet ve grafikler bu bütçe yüzünden AYRI girişte;
 * ana girişe bundan sonra eklenen her bileşen önce alt girişe aday mı diye sorulur.
 */
export default [
  {
    name: 'ESM giriş noktası (tüm paket)',
    path: 'build/index.js',
    limit: '43 kB',
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
  /* GRAFİK GİRİŞİ — sohbet girişiyle aynı kural: ayrı ölçülür, ana girişte sayılmaz. */
  {
    name: 'charts girişi (tümü)',
    path: 'build/charts.js',
    ignore: ['@ahmetilhn/hanui'],
    /* İlk ölçüm (2026-10-10, 10 grafik): 14,02 kB. */
    limit: '16 kB',
    gzip: true,
  },
  {
    name: 'yalnızca LineChart (ağaç sarsma)',
    path: 'build/charts.js',
    import: '{ LineChart }',
    ignore: ['@ahmetilhn/hanui'],
    /* İlk ölçüm: 7,19 kB — ortak çekirdek (çerçeve, kartezyen geometri, eksenler) dahil. */
    limit: '8.5 kB',
    gzip: true,
  },
  {
    name: 'charts.css',
    path: 'build/charts.css',
    /* İlk ölçüm: 1,55 kB. */
    limit: '2 kB',
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
