import { defineConfig, devices } from '@playwright/test';

/**
 * GÖRSEL REGRESYON.
 *
 * <h3>Amaç piksel takıntısı DEĞİL</h3>
 * Bir token'ı bir kademe kaydırmak on iki bileşeni birden etkiliyor ve
 * bunların hangileri olduğu yalnızca bakınca görülüyor. Anlık görüntüler o
 * "hangileri" sorusunun cevabı: bir palet değişikliğinin diff'i, değişmesi
 * beklenen dosyaların listesi olarak okunur.
 *
 * <h3>Neden `npm run verify` İÇİNDE DEĞİL</h3>
 * Ekran görüntüsü PLATFORMA bağlı: yazı tipi tarama (rasterization), alt
 * piksel yumuşatma ve `system-ui`nin çözüldüğü gerçek font macOS ile Linux'ta
 * farklı. macOS'te üretilmiş bir referans, ubuntu üzerinde koşan CI'da 232
 * dosyanın 232'sinde birden kırmızı döner — ve her seferinde kırmızı dönen bir
 * nöbetçi, bakılmayan bir nöbetçidir.
 *
 * <p>Bu yüzden referanslar PLATFORM BAŞINA saklanıyor
 * (`__screenshots__/{platform}/…`) ve görsel koşu ayrı bir komutta:
 * `npm run test:visual`. CI'da açılacağı gün doğru yol, Playwright'ın resmi
 * konteynerinde koşup `linux` referanslarını orada üretmek — konteyner dışında
 * üretilen bir Linux referansı da aynı sorunu yaşar.
 *
 * <p>Referans güncelleme: `npm run test:visual -- --update-snapshots`. Diff'e
 * BAKILMADAN güncellenmez; nöbetçinin tek işi o diff.
 */
/** Piksel karsilastiran tek dosya; cihaz projeleri onu dislar. */
const VISUAL_SPEC = /visual\.spec\.ts/;

export default defineConfig({
  testDir: './e2e',
  /* Bir bilesenin degismesi digerlerinin ciktisini etkilemiyor: tam paralel. */
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? 'line' : 'list',

  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}',

  use: {
    baseURL: 'http://localhost:5273',
    /*
     * Animasyon KAPALI ve imlec gizli: donen gosterge (`Spinner`) ile iskelet
     * parlamasi (`Skeleton`) her karede baska bir goruntu verir; imlec de
     * yanip soner. Ucu de "degisiklik" olarak raporlanip gercek diff'i gomer.
     */
    launchOptions: { args: ['--font-render-hinting=none'] },
  },

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      /*
       * Sifir tolerans DEGIL. Ayni platformda bile GPU/derleyici surumu bir
       * kac pikselde yuvarlama farki birakabiliyor; sifir esik bu gurultuyu
       * hata olarak raporlar. 0,2 tek bir pikselin gozle gorulur sekilde
       * degismesini yine yakalar.
       */
      maxDiffPixelRatio: 0.002,
      threshold: 0.2,
    },
  },

  /*
   * IKI AYRI KOSU, IKI AYRI PROJE KUMESI.
   *
   * `masaüstü` / `mobil` PIKSEL karsilastirir; referanslari platform basina
   * saklaniyor ve `npm run test:visual` ile ayri kosuyorlar (yukaridaki not).
   *
   * `ios` / `android` ise SAYI olcer — yukseklik, tasma, odak, hesaplanmis CSS
   * degeri. Platformdan bagimsizlar, referans dosyalari yok ve `npm run
   * test:device` ile CI'da da kosabilirler.
   *
   * Ayrim `testMatch`/`testIgnore` ile: gorsel projeler YALNIZCA `visual.spec`i
   * alir, cihaz projeleri onu DISLAR. Boylece yeni yazilan her davranis
   * senaryosu cihaz kosusuna kendiliginden girer — dosya adini bir listeye
   * eklemek gerekmiyor; unutuldugunda sessizce kosmayan bir nobetci kalirdi.
   */
  projects: [
    {
      name: 'masaüstü',
      testMatch: VISUAL_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'mobil',
      testMatch: VISUAL_SPEC,
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },

    /*
     * iOS = WEBKIT, ve bu bir tercih degil: App Store kurali geregi iOS'taki
     * HER tarayici (Chrome dahil) WebKit kullaniyor. Chromium'da dogru olan
     * orada dogru olmak zorunda degil — bu depoda kayitli iki hata da
     * (`bottom-sheet` gorunen alan payi, `<dialog>` ust katman gecisleri)
     * once gercek bir iPhone'da bildirildi.
     */
    {
      name: 'ios',
      testIgnore: VISUAL_SPEC,
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'android',
      testIgnore: VISUAL_SPEC,
      use: { ...devices['Pixel 7'] },
    },
  ],

  /*
   * Gelistirme sunucusu DEGIL onizleme: dev sunucusu modulleri tek tek servis
   * ediyor ve ilk boyama, modul sayisina bagli olarak degisen bir gecikmeyle
   * geliyor — anlik goruntu bazen yari cizilmis bir sayfayi yakaliyordu.
   */
  webServer: {
    command: 'npm run playground:build && npx vite preview --config playground/vite.config.ts',
    url: 'http://localhost:5273',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
