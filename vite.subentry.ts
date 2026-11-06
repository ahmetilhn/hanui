import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import uiLayer from './scripts/lib/postcss-ui-layer.mjs';
import { defineConfig, type UserConfig } from 'vite';

/**
 * ALT GİRİŞ DERLEMESİ — `@handijit/ui/chat`, `@handijit/ui/charts`.
 *
 * ⚠ Ana giriş (`@handijit/ui`) DIŞSAL: alt giriş onu paket adıyla alır. Paketlenseydi
 * `UiProvider`ın bağlamı (metinler, yönlendirici) ve kipsel yüzey yığını iki kopyaya bölünür,
 * alt girişin bileşenleri sağlayıcının metinlerini göremez ve ana bileşenlerin CSS'i alt girişin
 * CSS'ine de girerdi. Alt girişin kodu ve CSS'i ana pakete hiç girmez; ana girişi kullanan uygulamanın bütçesi değişmez.
 *
 * Tipler bu derlemede DEĞİL, `tsconfig.subentries.json` ile dosya başına üretilir
 * (`build/types/<giriş>`): `vite-plugin-dts`in toplama adımı girişi `<outDir>/index.d.ts` diye
 * hesaplıyor ve ANA girişin tiplerini topluyordu.
 */
export const defineSubEntry = (name: 'chat' | 'charts'): UserConfig =>
  defineConfig({
    resolve: {
      alias: { '@': resolve(__dirname, 'src') },
    },
    css: {
      postcss: { plugins: [uiLayer()] },
      modules: { generateScopedName: 'ui-[local]-[hash:base64:5]' },
      preprocessorOptions: { scss: { api: 'modern-compiler' } },
    },
    build: {
      outDir: 'build',
      /* Ana derlemenin çıktısı silinmez — bu derleme ONUN ardından koşar. */
      emptyOutDir: false,
      sourcemap: true,
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, `src/${name}/index.ts`),
        formats: ['es', 'cjs'],
        fileName: format => (format === 'es' ? `${name}.js` : `${name}.cjs`),
      },
      rollupOptions: {
        external: [
          '@handijit/ui',
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@handijit/utils',
          'react-bootstrap-icons',
        ],
        output: {
          banner: "'use client';",
          assetFileNames: `${name}.css`,
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
  }) as UserConfig;
