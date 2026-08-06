import { expect, test } from '@playwright/test';

import { SOLO_ONLY } from '../playground/solo';

/** Her bileşen × {açık, koyu} × {masaüstü, mobil}. */

const THEMES = ['light', 'dark'] as const;

for (const theme of THEMES) {
  test.describe(`${theme} tema`, () => {
    test('ızgara', async ({ page }) => {
      await page.goto(`/?theme=${theme}`);

      /* Yazi tipleri yerine oturmadan cekilen goruntu her kosuda baska. */
      await page.evaluate(() => document.fonts.ready);

      const names = await page
        .locator('[data-gallery]')
        .evaluateAll(nodes => nodes.map(node => node.getAttribute('data-gallery') ?? ''));

      expect(names.length).toBeGreaterThan(0);

      for (const name of names) {
        const section = page.locator(`[data-gallery="${name}"]`);

        await expect(section).toBeVisible();
        await expect(section).toHaveScreenshot(`${name}-${theme}.png`);
      }
    });

    /*
     * Kipsel bilesenler `?solo=` ile tek baslarina aciliyor: `showModal()`
     * sayfanin geri kalanini inert birakiyor ve dort pencere ayni anda
     * acildiginda galeri tek bir gri perdeye donuyor.
     */
    for (const name of SOLO_ONLY)
      test(`${name} — kipsel`, async ({ page }) => {
        await page.goto(`/?solo=${name}&theme=${theme}`);
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { fullPage: false });
      });

    /*
     * RTL. Faz 1'de 34 fiziksel yon bildirimi mantiksal ozelliklere cevrildi
     * (`padding-inline-start`, `inset-inline`, `text-align: start`) ve yon
     * TASIYAN ikonlar aynalandi. Bu senaryo o isin nobetcisi: fiziksel bir
     * bildirim geri sizdiginde diff burada gorunur.
     */
    test(`RTL — ${theme}`, async ({ page }) => {
      await page.goto(`/?theme=${theme}&dir=rtl`);
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`rtl-${theme}.png`, { fullPage: false });
    });

    /*
     * YOGUN KIP. Olcek token duzeyinde iniyor; hicbir bilesende yogunluga
     * ozel kural YOK. Anlik goruntu bunun kanit: kural yazilmadan gorunum
     * degisiyorsa is dogru yerde yapilmis demektir.
     */
    test(`yoğun kip — ${theme}`, async ({ page }) => {
      await page.goto(`/?theme=${theme}&density=compact`);
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`compact-${theme}.png`, { fullPage: false });
    });

    /* ZORLANMIS RENK KIPI (Windows Yuksek Kontrast). */
    test(`zorlanmış renk kipi — ${theme}`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active', colorScheme: theme });
      await page.goto(`/?theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`forced-colors-${theme}.png`, { fullPage: false });
    });
  });
}
