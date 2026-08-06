import { expect, test } from '@playwright/test';

import { SOLO_ONLY } from '../../playground/solo';

const ROUNDING = 1;

const openGallery = async (page: import('@playwright/test').Page, query = '') => {
  await page.goto(`/?theme=light${query}`);
  await page.evaluate(() => document.fonts.ready);
};

test('sayfa yatayda KAYMAZ', async ({ page }) => {
  await openGallery(page);

  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
  });

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + ROUNDING);
});

test.describe('kaydırma kutusu — kenar solması', () => {
  const fadeStops = (node: HTMLElement) => {
    const style = getComputedStyle(node);
    return {
      start: style.getPropertyValue('--hanui-scroll-fade-start').trim(),
      end: style.getPropertyValue('--hanui-scroll-fade-end').trim(),
    };
  };

  test('taşma YOKSA hiçbir uç solmaz', async ({ page }) => {
    await openGallery(page);

    const short = page.getByText('Tek satır').locator('..');

    expect(await short.evaluate(fadeStops)).toEqual({ start: '0px', end: '0px' });
  });

  test('en üstteyken YALNIZCA alt uç, sona inince YALNIZCA üst uç solar', async ({ page }) => {
    await openGallery(page);

    const long = page.getByRole('region', { name: 'Solmalı uzun metin' });
    await expect(long).toBeVisible();

    const atTop = await long.evaluate(fadeStops);
    expect(atTop.start).toBe('0px');
    expect(atTop.end).not.toBe('0px');
    expect(atTop.end).not.toBe('');

    await long.evaluate(node => node.scrollTo({ top: node.scrollHeight }));

    const atBottom = await expect
      .poll(async () => (await long.evaluate(fadeStops)).end)
      .toBe('0px')
      .then(() => long.evaluate(fadeStops));

    expect(atBottom.start).not.toBe('0px');
    expect(atBottom.start).not.toBe('');
  });
});

for (const name of SOLO_ONLY)
  test(`${name} görünen alanın içinde durur`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, `&solo=${name}`);

    const surface = page.locator('dialog[open]').first();
    await expect(surface).toBeVisible();

    const fits = await surface.evaluate(node => {
      const box = node.getBoundingClientRect();
      return {
        top: Math.round(box.top),
        bottom: Math.round(box.bottom),
        right: Math.round(box.right),
        left: Math.round(box.left),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });

    expect(fits.top).toBeGreaterThanOrEqual(-ROUNDING);
    expect(fits.left).toBeGreaterThanOrEqual(-ROUNDING);
    expect(fits.bottom).toBeLessThanOrEqual(fits.viewportHeight + ROUNDING);
    expect(fits.right).toBeLessThanOrEqual(fits.viewportWidth + ROUNDING);
  });

test('alt sayfa açılışında odak metin alanına düşmez', async ({ page }) => {
  await openGallery(page);

  await page.getByRole('combobox', { name: 'Sıralama' }).first().click();
  await expect(page.locator('dialog[open]')).toBeVisible();

  const focused = await page.evaluate(() => {
    const node = document.activeElement;
    return { tag: node?.tagName.toLowerCase() ?? '', type: node?.getAttribute('type') ?? '' };
  });

  expect(['input', 'textarea']).not.toContain(focused.tag);
});
