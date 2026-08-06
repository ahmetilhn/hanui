/** BOYUT BÜTÇESİ. */
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
