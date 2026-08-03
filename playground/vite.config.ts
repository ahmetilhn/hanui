import { resolve } from 'node:path';

// @ts-expect-error — eklenti düz JS; tip bildirimi yok ve gerekmiyor.
import hanuiLayer from '../scripts/lib/postcss-hanui-layer.mjs';
import { defineConfig } from 'vite';

/**
 * Galeri uygulaması — kütüphane derlemesinden AYRI.
 *
 * <p>Kök `vite.config.ts` kütüphane kipinde (`build.lib`) ve tek bir giriş
 * noktası üretiyor; galeri ise sıradan bir uygulama. İkisini tek yapılandırmada
 * toplamak, `lib` ayarlarının uygulamaya sızmasına (ve `'use client'`
 * banner'ının bir HTML sayfasına eklenmesine) yol açıyordu.
 *
 * <p>CSS modülü ad şeması kütüphaneninkiyle AYNI tutulur: galeride görülen sınıf
 * adı, üretimde görülenle aynı olmalı — aksi hâlde bir hata ayıklama oturumunda
 * aranan sınıf bulunamıyor.
 */
export default defineConfig({
  root: resolve(import.meta.dirname, '.'),
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, '../src'),
    },
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
