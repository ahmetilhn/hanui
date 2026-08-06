import { configureAxe } from 'jest-axe';

/** ERİŞİLEBİLİRLİK TARAYICISI — bileşen ölçeğinde. */
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
