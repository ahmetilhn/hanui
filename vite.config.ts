import { resolve } from 'node:path';

import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Dosya başındaki `'use client'` yönergelerini derlemeden ÖNCE söker.
 *
 * <p>Yönerge kaynakta doğru yerde: her dosya kendi başına "bu bir istemci
 * bileşeni" diyor ve bu bilgi okunurken değerli. Ama modüller tek bir bundle'a
 * toplanıyor ve orada yönerge modül düzeyinde anlamsız — Rollup her biri için
 * `MODULE_LEVEL_DIRECTIVE` uyarısı verip yirmi satır gürültü bırakıyordu.
 * Sınırı bundle'ın BAŞINDAKİ banner çiziyor (aşağıda); tüketici için sonuç
 * aynı, çıktı temiz.
 */
const stripUseClient = (): Plugin => ({
  name: 'hanui-strip-use-client',
  enforce: 'pre',
  transform(code, id) {
    if (!/\.(t|j)sx?$/.test(id)) return null;
    if (!/^\s*['"]use client['"];?/.test(code)) return null;

    return { code: code.replace(/^\s*['"]use client['"];?\s*/, ''), map: null };
  },
});

/**
 * Kütüphane derlemesi.
 *
 * <h3>Neden tek bir CSS dosyası</h3>
 * `cssCodeSplit: false` bütün SCSS modüllerini tek bir `styles.css` içinde
 * toplar. Bileşen başına CSS parçası üretmek, tüketicinin bundler'ının CSS
 * sıralamasını belirlemesi demekti: `Pagination`ın `IconButton` üzerine
 * bindirdiği kurallar (özgüllük eşit) kaynak sırasına bağlı ve o sıra
 * tüketicide değişince düğmeler bağlantı komşularından farklı görünüyordu.
 * Tek dosyada sıra bizim.
 *
 * <h3>Neden `'use client'` banner</h3>
 * Paket Next.js App Router'da sunucu bileşeninden import edilebiliyor.
 * Buradaki bileşenlerin tamamı ya kanca kullanıyor ya da kanca kullanan bir
 * kardeşle aynı dosyada; sınır paketin kendisinde çizilir. Sunucu bileşeni
 * bunları yine render edebilir (children sunucuda çizilip aktarılır) —
 * yalnızca fonksiyon prop'u geçemez, ki o zaten React'in kuralı.
 *
 * <h3>`react/jsx-runtime` neden `external`</h3>
 * `react` external ama JSX dönüşümü ayrı bir giriş noktası kullanıyor;
 * listelenmediğinde React'in bir kopyası pakete gömülüyor ve tüketicide iki
 * React örneği oluşuyordu (kanca çağrıları patlar).
 */
export default defineConfig({
  plugins: [
    stripUseClient(),
    dts({
      entryRoot: 'src',
      include: ['src'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.*', 'src/test'],
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    modules: {
      /*
       * Sınıf adları paket adıyla ön eklenir. Tüketicinin kendi CSS modülü
       * karma değeri bizimkiyle çakışabiliyordu ve çakışma sessiz: iki farklı
       * bileşen aynı sınıfı paylaşıp birbirinin kuralını alıyordu.
       */
      generateScopedName: 'hanui-[local]-[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@ahmetilhn/handy-utils',
        /*
         * İkonlar da EXTERNAL: paket tüketicide zaten var (uygulamalar kendi
         * içerik ikonlarını aynı setten alıyor). Bundle'a gömülseydi aynı
         * simgeler iki kez inecek ve ağaç sallama tüketici tarafında hiç
         * çalışmayacaktı.
         */
        'react-bootstrap-icons',
      ],
      output: {
        banner: "'use client';",
        assetFileNames: 'styles.css',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      /*
       * Rollup, dosya başındaki `'use client'` yönergelerini bundle ederken
       * uyarı veriyor: yönerge modül düzeyinde anlamlı, bundle düzeyinde değil.
       * Sınırı zaten banner ile paket düzeyinde çiziyoruz; uyarı gürültü.
       */
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
});
