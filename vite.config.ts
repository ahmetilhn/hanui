import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import uiLayer from './scripts/lib/postcss-ui-layer.mjs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { clientDirectives, componentCss } from './vite.modules';

const BASE_ENTRY = resolve(__dirname, 'src/styles/base.ts');

/**
 * KÜTÜPHANE DERLEMESİ — bileşen başına modül (6.0; gerekçe `vite.modules.ts`).
 *
 * `preserveModules`: `src/` ağacı `build/` altına birebir iner (`build/components/Button/index.js`,
 * `build/index.js` cephe). `package.json` `exports` haritası her bileşene bir alt yol verir
 * (`@handijit/ui/button`); cephe `.` yalnızca yeniden dışa aktarım taşır.
 */
export default defineConfig({
  plugins: [
    clientDirectives(),
    componentCss({ baseEntry: BASE_ENTRY }),
    dts({
      entryRoot: 'src',
      include: ['src'],
      /* Alt girişler kendi derlemelerinde (`vite.subentry.ts`). */
      exclude: ['src/**/*.test.*', 'src/chat/**', 'src/charts/**'],
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
    postcss: { plugins: [uiLayer()] },
    modules: {
      /* Sınıf adları paket adıyla ön eklenir. */
      generateScopedName: 'ui-[local]-[hash:base64:5]',
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
    /* CSS modül başına: her bileşenin CSS'i kendi dosyasında (`vite.modules.ts`). */
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        base: BASE_ENTRY,
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@handijit/utils',
        /*
         * İkonlar da EXTERNAL: paket tüketicide zaten var (uygulamalar kendi içerik ikonlarını aynı
         * setten alıyor).
         */
        'react-bootstrap-icons',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        /* Varsayılan ve adlı dışa aktarım birlikte (`Card` + `CardBody`): CJS'de `.default`. */
        exports: 'named',
        assetFileNames: '[name][extname]',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
