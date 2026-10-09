import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import hanuiLayer from '../scripts/lib/postcss-hanui-layer.mjs';
import { defineConfig } from 'vite';

/** Galeri uygulaması — kütüphane derlemesinden AYRI. */
export default defineConfig({
  root: resolve(import.meta.dirname, '.'),
  resolve: {
    /* `chat` bileşenleri ana girişi paket adıyla alır; galeride kaynağa eşlenir. */
    alias: [
      { find: /^@ahmetilhn\/hanui$/, replacement: resolve(import.meta.dirname, '../src/index.ts') },
      { find: '@', replacement: resolve(import.meta.dirname, '../src') },
    ],
  },
  css: {
    postcss: { plugins: [hanuiLayer()] },
    modules: {
      generateScopedName: 'hanui-[local]-[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 5273,
    strictPort: true,
  },
  preview: {
    port: 5273,
    strictPort: true,
  },
  build: {
    outDir: resolve(import.meta.dirname, '../build-playground'),
    emptyOutDir: true,
  },
});
