import { defineConfig, devices } from '@playwright/test';

/** GÖRSEL REGRESYON. */
/** Piksel karsilastiran tek dosya; cihaz projeleri onu dislar. */
const VISUAL_SPEC = /visual\.spec\.ts/;

/**
 * MASAÜSTÜ DAVRANIŞ TESTLERİ — geniş ekranda ölçülmesi ZORUNLU olanlar.
 * ⚠ ÖLÇÜLMÜŞ BOŞLUK. Bu proje eklenmeden önce davranış ölçen HER spec yalnızca `ios` + `android`
 * projelerinde koşuyordu (tek masaüstü projesi…
 */
const DESKTOP_BEHAVIOR_SPEC = /anchored-panel\.spec\.ts/;

/**
 * HER GÖRÜNÜMDE ölçülen davranış: masaüstünde de cihazlarda da. Kaydırma kabı sızıntısı tüketicide
 * MASAÜSTÜNDE ölçüldü; cihaz projeleri bu dosyayı zaten koşuyor, masaüstü projesi ayrıca alır.
 */
const ANY_VIEWPORT_SPEC = /scroll-containment\.spec\.ts/;

export default defineConfig({
  testDir: './__tests__/e2e',
  /* Bir bilesenin degismesi digerlerinin ciktisini etkilemiyor: tam paralel. */
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? 'line' : 'list',

  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}',

  use: {
    baseURL: 'http://localhost:5273',
    /*
     * Animasyon KAPALI ve imlec gizli: donen gosterge (`Spinner`) ile iskelet parlamasi
     * (`Skeleton`) her karede baska bir goruntu verir
     */
    launchOptions: { args: ['--font-render-hinting=none'] },
  },

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      /* Sifir tolerans DEGIL. */
      maxDiffPixelRatio: 0.002,
      threshold: 0.2,
    },
  },

  /* IKI AYRI KOSU, IKI AYRI PROJE KUMESI. */
  projects: [
    {
      name: 'desktop',
      testMatch: VISUAL_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: VISUAL_SPEC,
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },

    /*
     * Piksel DEGIL geometri: yapışkan panelin tetikleyicisine bağlı kalması yalnızca geniş ekranda
     * ölçülebilir (dar ekranda panel alt sayfaya döner).
     */
    {
      name: 'desktop-behavior',
      testMatch: [DESKTOP_BEHAVIOR_SPEC, ANY_VIEWPORT_SPEC],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },

    /* iOS = WEBKIT, ve bu bir tercih degil: */
    {
      name: 'ios',
      testIgnore: [VISUAL_SPEC, DESKTOP_BEHAVIOR_SPEC],
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'android',
      testIgnore: [VISUAL_SPEC, DESKTOP_BEHAVIOR_SPEC],
      use: { ...devices['Pixel 7'] },
    },
  ],

  /*
   * Gelistirme sunucusu DEGIL onizleme: dev sunucusu modulleri tek tek servis ediyor ve ilk boyama,
   * modul sayisina bagli olarak degisen bir gecikmeyle…
   */
  webServer: {
    command: 'npm run playground:build && npx vite preview --config playground/vite.config.ts',
    url: 'http://localhost:5273',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
