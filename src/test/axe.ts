import { configureAxe } from 'jest-axe';

/**
 * ERİŞİLEBİLİRLİK TARAYICISI — bileşen ölçeğinde.
 *
 * <h3>Sayfa kuralları KAPALI, ve bu bir taviz değil</h3>
 * `axe` varsayılan olarak bir SAYFAYI denetler: "her içerik bir landmark'ın
 * içinde olmalı", "sayfada bir `<h1>` olmalı", "`<html lang>` yazılmalı".
 * Bunlar doğru kurallar ama muhatabı kütüphane değil TÜKETİCİ: `Badge` tek
 * başına çizildiğinde hiçbir zaman bir `<main>`in içinde olmayacak ve bu,
 * `Badge`in bir kusuru değil testin yanlış soruyu sorması olurdu. Kapatılmadan
 * bırakıldıklarında 57 bileşenin 57'si de aynı üç ihlalle kırmızı döner ve
 * nöbetçi ilk günden yok sayılır.
 *
 * <h3>`color-contrast` neden burada değil</h3>
 * jsdom YERLEŞİM YAPMIYOR: hesaplanmış renk, gerçek yazı boyutu ve üst üste
 * binen katmanlar yok. axe bu kuralı jsdom'da "incomplete" olarak bırakır —
 * yani hiçbir şey ölçmez ama ölçmüş gibi görünür. Kontrast ayrı ve GERÇEK bir
 * nöbetçiyle ölçülüyor: `scripts/check-contrast.mjs`, token değerlerinin
 * üzerinden.
 */
export const axe = configureAxe({
  rules: {
    /* Sayfa kuralları — tüketicinin yerleşimine ait. */
    region: { enabled: false },
    'page-has-heading-one': { enabled: false },
    'landmark-one-main': { enabled: false },
    'html-has-lang': { enabled: false },
    bypass: { enabled: false },

    /* Ayrı nöbetçisi var (bkz. yukarıdaki not). */
    'color-contrast': { enabled: false },
  },
});
