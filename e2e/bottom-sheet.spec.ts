import { expect, test } from '@playwright/test';

/** ALT SAYFA ÖLÇÜ NÖBETÇİSİ — gerçek cihazda bildirilen hatanın karşılığı. */

/** Panelin gövdesi bu değerin altına inerse liste kullanılamaz sayılır. */
const MIN_USABLE_BODY = 120;

const openSortSheet = async (page: import('@playwright/test').Page) => {
  await page.goto('/?theme=light');
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('combobox', { name: 'Sıralama' }).first().click();

  const sheet = page.locator('dialog[open]');
  await expect(sheet).toBeVisible();

  return sheet;
};

/** Panelin ve gövdesinin ölçülen yüksekliği. */
const readSizes = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const sheet = document.querySelector('dialog[open]') as HTMLElement;
    const body = sheet.querySelector('[class*="sheet__body"]') as HTMLElement;

    return {
      sheet: Math.round(sheet.getBoundingClientRect().height),
      body: Math.round(body.getBoundingClientRect().height),
      scrollable: body.scrollHeight > body.clientHeight,
    };
  });

test.describe('alt sayfa ölçüsü', () => {
  /*
   * YALNIZCA DAR EKRAN. `Select` masaustunde listeyi tetikleyiciye yapisan bir
   * PANELDE aciyor, alt sayfada degil — orada `dialog[open]` hic olusmuyor.
   * Kosul yazilmasaydi masaustu projesi "oge bulunamadi" ile kirmizi doner ve
   * bu, bir hatanin degil senaryonun yanlis yerde kosmasinin isareti olurdu.
   */
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) > 640,
    'Alt sayfa yalnızca dar ekranda açılır.',
  );

  test('kısa liste: panel içeriğe göre boylanır', async ({ page }) => {
    await openSortSheet(page);

    const sizes = await readSizes(page);

    expect(sizes.body).toBeGreaterThan(MIN_USABLE_BODY);
    expect(sizes.scrollable).toBe(false);
  });

  test('uzun liste: gövde görünüm alanını doldurur ve KAYAR', async ({ page }) => {
    await openSortSheet(page);

    /* Gercek vakada marka listesi uzun; galerideki uc secenek yetmiyor. */
    await page.evaluate(() => {
      const list = document.querySelector('dialog[open] ul') as HTMLElement;
      const row = list.children[0] as HTMLElement;
      for (let index = 0; index < 30; index += 1) list.appendChild(row.cloneNode(true));
    });

    const sizes = await readSizes(page);
    const viewportHeight = page.viewportSize()?.height ?? 0;

    /* Panel gorunum alaninin yarisindan fazlasini kaplamali. */
    expect(sizes.sheet).toBeGreaterThan(viewportHeight * 0.5);
    expect(sizes.scrollable).toBe(true);
  });

  /*
   * ASIL NOBETCI. Olcum bacagi `useSheetViewport` icinde ayrica korunuyor ama
   * taban CSS'te DE olmak zorunda: degiskeni tuketici de yazabilir ve bir
   * arayuz ogesi tek bir hatali sayi yuzunden kullanilamaz hale gelmemeli.
   */
  for (const bogus of ['200px', '120px', '60px', '0px']) {
    test(`ölçüm ${bogus} gelse bile panel ÇÖKMEZ`, async ({ page }) => {
      await openSortSheet(page);

      await page.evaluate(value => {
        document.documentElement.style.setProperty('--hanui-sheet-height', value);
      }, bogus);

      const sizes = await readSizes(page);

      expect(sizes.body).toBeGreaterThan(MIN_USABLE_BODY);
    });
  }
});
