import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import hanuiLayer from './scripts/lib/postcss-hanui-layer.mjs';
import { defineConfig } from 'vite';

/**
 * `@ahmetilhn/hanui/chat` — sohbet bileşenlerinin AYRI girişi.
 *
 * ⚠ Ana giriş (`@ahmetilhn/hanui`) DIŞSAL: sohbet bileşenleri onu paket adıyla alır. Paketlenseydi
 * `HanuiProvider`ın bağlamı (metinler, yönlendirici) ve kipsel yüzey yığını iki kopyaya bölünür,
 * sohbet bileşenleri sağlayıcının metinlerini göremez ve ana bileşenlerin CSS'i `chat.css`e de
 * girerdi. Sohbet kodu ve CSS'i ana pakete hiç girmez; Hanparça'nın bütçesi değişmez.
 *
 * Tipler bu derlemede DEĞİL, `tsconfig.chat.json` ile dosya başına üretilir (`build/types/chat`):
 * `vite-plugin-dts`in toplama adımı girişi `<outDir>/index.d.ts` diye hesaplıyor ve ANA girişin
 * tiplerini topluyordu. Dosya başına çıktıda `@ahmetilhn/hanui` paket adı olarak kalır ve paketin
 * kendi `exports`u üzerinden ana `index.d.ts`e çözülür.
 */
export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  css: {
    postcss: { plugins: [hanuiLayer()] },
    modules: { generateScopedName: 'hanui-[local]-[hash:base64:5]' },
    preprocessorOptions: { scss: { api: 'modern-compiler' } },
  },
  build: {
    outDir: 'build',
    /* Ana derlemenin çıktısı silinmez — bu derleme ONUN ardından koşar. */
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/chat/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es' ? 'chat.js' : 'chat.cjs'),
    },
    rollupOptions: {
      external: [
        '@ahmetilhn/hanui',
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@ahmetilhn/handy-utils',
        'react-bootstrap-icons',
      ],
      output: {
        banner: "'use client';",
        assetFileNames: 'chat.css',
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
});
