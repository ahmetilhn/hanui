/**
 * BOYUT BÜTÇESİ.
 *
 * <h3>Hangi sayı neyi koruyor</h3>
 * Gerçek uygulamalar paketin TAMAMINI çekmiyor: `import { Button }` yazan bir
 * tüketiciye yalnızca `Button` iniyor. Tüketiciyi koruyan sayılar bu yüzden
 * BİLEŞEN BAŞINA olanlar — tüm paket girişi ise ağaç sarsmanın gerçekten
 * çalıştığının kanıtı (3,3 kB ile 36 kB arasındaki fark bunu ölçüyor).
 *
 * <h3>36 kB → 38 kB (bu tur)</h3>
 * Bütçe 532 B aşıldı ve YÜKSELTİLDİ. Karşılığında gelenler: `useVirtualList`
 * (1121 satırlık listede DOM'u 16 satıra indiriyor), `useListboxNavigation`
 * (iki bileşenden kopya klavye kodunu topluyor — net olarak KÜÇÜLTÜYOR),
 * `Textarea` otomatik büyüme + sayaç, `Tabs` manuel etkinleştirme,
 * `Pagination` sonuç duyurusu, `Price` opsiyonel `Intl`.
 *
 * <p>Yükseltme yalnızca bu giriş için: bileşen başına bütçelere DOKUNULMADI ve
 * ikisi de payla geçiyor (Button 3,93/4,5 · Badge 3,29/3,8). Bütçeyi her
 * aşıldığında yükseltmek onu anlamsız kılar; yükseltmenin kuralı, karşılığında
 * ne alındığının BURAYA yazılması.
 */
export default [
  {
    name: 'ESM giriş noktası (tüm paket)',
    path: 'build/index.js',
    limit: '38 kB',
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
