import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import hanuiLayer from './scripts/lib/postcss-hanui-layer.mjs';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

/** Dosya başındaki `'use client'` yönergelerini derlemeden ÖNCE söker. */
const stripUseClient = (): Plugin => ({
  name: 'hanui-strip-use-client',
  enforce: 'pre',
  transform(code, id) {
    if (!/\.(t|j)sx?$/.test(id)) return null;
    if (!/^\s*['"]use client['"];?/.test(code)) return null;

    return { code: code.replace(/^\s*['"]use client['"];?\s*/, ''), map: null };
  },
});

/** Kütüphane derlemesi. */
export default defineConfig({
  plugins: [
    stripUseClient(),
    dts({
      entryRoot: 'src',
      include: ['src'],
      exclude: ['src/**/*.test.*'],
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  /*
   * ⚠ Agac sallama icin bu dosyada AYAR YOK ve olmamasi bilincli: cozum
   * KAYNAKTA (`#__PURE__` acilamasi + `helpers/component.helper` `named()`).
   * Vite'in `esbuild.pure` secenegi denendi, cikisa acilama birakmiyor.
   */
  css: {
    postcss: { plugins: [hanuiLayer()] },
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
