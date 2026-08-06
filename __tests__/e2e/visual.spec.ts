import { expect, test } from '@playwright/test';

import { SOLO_ONLY } from '../../playground/solo';

const THEMES = ['light', 'dark'] as const;

for (const theme of THEMES) {
  test.describe(`${theme} tema`, () => {
    test('ızgara', async ({ page }) => {
      await page.goto(`/?theme=${theme}`);

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

    for (const name of SOLO_ONLY)
      test(`${name} — kipsel`, async ({ page }) => {
        await page.goto(`/?solo=${name}&theme=${theme}`);
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { fullPage: false });
      });

    test(`RTL — ${theme}`, async ({ page }) => {
      await page.goto(`/?theme=${theme}&dir=rtl`);
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`rtl-${theme}.png`, { fullPage: false });
    });

    test(`yoğun kip — ${theme}`, async ({ page }) => {
      await page.goto(`/?theme=${theme}&density=compact`);
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`compact-${theme}.png`, { fullPage: false });
    });

    test(`zorlanmış renk kipi — ${theme}`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active', colorScheme: theme });
      await page.goto(`/?theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`forced-colors-${theme}.png`, { fullPage: false });
    });
  });
}
