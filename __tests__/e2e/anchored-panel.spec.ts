import { expect, test, type Locator, type Page } from '@playwright/test';

const MAX_ANCHOR_GAP = 24;

const ROUNDING = 2;

const CONTAINING_BLOCK_BREAKER = `
  .gallery__stage { transform: translateZ(0); }
`;

const positionedSurface = (listbox: Locator): Locator =>
  listbox.locator('xpath=ancestor-or-self::*[contains(@style,"position: fixed")][1]');

const anchorGap = (
  trigger: { y: number; height: number },
  panel: { y: number; height: number },
): number =>
  Math.min(
    Math.abs(panel.y - (trigger.y + trigger.height)),
    Math.abs(trigger.y - (panel.y + panel.height)),
  );

const assertAnchored = async (trigger: Locator, listbox: Locator, hint: string) => {
  const triggerBox = await trigger.boundingBox();
  const panelBox = await positionedSurface(listbox).boundingBox();
  if (!triggerBox || !panelBox) throw new Error('kutu ölçülemedi');

  expect(
    Math.abs(panelBox.x - triggerBox.x),
    `${hint}: panel yatayda tetikleyiciden kaymış — kapsayıcı blok değişmiş olabilir`,
  ).toBeLessThanOrEqual(ROUNDING);

  expect(
    anchorGap(triggerBox, panelBox),
    `${hint}: panel tetikleyiciye bitişik değil — konum kaymış`,
  ).toBeLessThanOrEqual(MAX_ANCHOR_GAP);
};

const assertHittable = async (page: Page, selector: string, hint: string) => {
  const result = await page.evaluate(sel => {
    const surface = document.querySelector(sel);
    if (!surface) return { ok: false, hit: 'panel yok' };

    const box = surface.getBoundingClientRect();
    const target = document.elementFromPoint(box.left + box.width / 2, box.top + 8);

    return { ok: surface.contains(target), hit: target?.tagName.toLowerCase() ?? 'yok' };
  }, selector);

  expect(result, `${hint}: panel örtülü ya da kırpılmış`).toMatchObject({ ok: true });
};

test.describe('açılır panel ankrajı — düz akış', () => {
  test('Combobox paneli tetikleyicisine bitişik', async ({ page }) => {
    await page.goto('/?theme=light&solo=Combobox');
    await page.evaluate(() => document.fonts.ready);

    const trigger = page.getByRole('button', { name: 'Marka seçin' }).first();
    await trigger.click();

    const panel = page.getByRole('listbox');
    await expect(panel).toBeVisible();

    await assertAnchored(trigger, panel, 'düz akış');
  });

  test('Select paneli tetikleyicisine bitişik', async ({ page }) => {
    await page.goto('/?theme=light&solo=Select');
    await page.evaluate(() => document.fonts.ready);

    const trigger = page.getByRole('combobox', { name: 'Sıralama' }).first();
    await trigger.click();

    const panel = page.getByRole('listbox');
    await expect(panel).toBeVisible();

    await assertAnchored(trigger, panel, 'düz akış');
  });
});

test.describe('açılır panel ankrajı — dönüştürülmüş ata', () => {
  test('Combobox paneli `transform` taşıyan atada KAYMAZ', async ({ page }) => {
    await page.goto('/?theme=light&solo=Combobox');
    await page.addStyleTag({ content: CONTAINING_BLOCK_BREAKER });
    await page.evaluate(() => document.fonts.ready);

    const trigger = page.getByRole('button', { name: 'Marka seçin' }).first();
    await trigger.click();

    const panel = page.getByRole('listbox');
    await expect(panel).toBeVisible();

    await assertAnchored(trigger, panel, 'dönüştürülmüş ata');
    await assertHittable(page, '[role="listbox"]', 'dönüştürülmüş ata');
  });

  test('Select paneli `transform` taşıyan atada KAYMAZ', async ({ page }) => {
    await page.goto('/?theme=light&solo=Select');
    await page.addStyleTag({ content: CONTAINING_BLOCK_BREAKER });
    await page.evaluate(() => document.fonts.ready);

    const trigger = page.getByRole('combobox', { name: 'Sıralama' }).first();
    await trigger.click();

    const panel = page.getByRole('listbox');
    await expect(panel).toBeVisible();

    await assertAnchored(trigger, panel, 'dönüştürülmüş ata');
    await assertHittable(page, '[role="listbox"]', 'dönüştürülmüş ata');
  });
});

test.describe('açılır panel ankrajı — kırpan ata', () => {
  test('Combobox paneli dönüştürülmüş + kırpan atada tam görünür', async ({ page }) => {
    await page.goto('/?theme=light&solo=Combobox');
    await page.addStyleTag({
      content: '.gallery__stage { transform: translateZ(0); overflow: hidden; height: 80px; }',
    });
    await page.evaluate(() => document.fonts.ready);

    const trigger = page.getByRole('button', { name: 'Marka seçin' }).first();
    await trigger.click();

    const panel = page.getByRole('listbox');
    await expect(panel).toBeVisible();

    await assertHittable(page, '[role="listbox"]', 'kırpan ata');
  });
});

test.describe('tetikleyici içi süsler — caret ve temizleme düğmesi', () => {
  const readTriggers = (page: Page) =>
    page.evaluate(() => {
      const roots = [...document.querySelectorAll('div')].filter(
        node => node.querySelector(':scope > button[aria-haspopup="listbox"]') !== null,
      );

      return roots.map(root => {
        const trigger = root.querySelector(':scope > button[aria-haspopup="listbox"]')!;
        const clear =
          [...root.querySelectorAll(':scope > button')].find(b => b !== trigger) ?? null;
        const carets = trigger.querySelectorAll('svg');
        const caret = carets[carets.length - 1] ?? null;

        const t = trigger.getBoundingClientRect();
        const c = caret?.getBoundingClientRect();
        const x = clear?.getBoundingClientRect();

        return {
          rootHeight: Math.round(root.getBoundingClientRect().height),
          triggerHeight: Math.round(t.height),
          caret: c
            ? {
                insetEnd: Math.round(t.right - c.right),
                verticalDrift: Math.round(Math.abs(c.top + c.height / 2 - (t.top + t.height / 2))),
                isInside: c.left >= t.left - 1 && c.right <= t.right + 1 && c.top >= t.top - 1,
              }
            : null,
          clear: x
            ? {
                position: getComputedStyle(clear!).position,
                verticalDrift: Math.round(Math.abs(x.top + x.height / 2 - (t.top + t.height / 2))),
                isInside: x.left >= t.left - 1 && x.right <= t.right + 1,
              }
            : null,
        };
      });
    });

  const CARET_MAX_INSET = 20;

  test('caret ve `✕` her varyantta tetikleyicinin İÇİNDE ve dikeyde ortalı', async ({ page }) => {
    await page.goto('/?theme=light&solo=Combobox');
    await page.evaluate(() => document.fonts.ready);

    const triggers = await readTriggers(page);
    expect(triggers.length, 'galeride Combobox bulunamadı').toBeGreaterThan(0);

    for (const [index, box] of triggers.entries()) {
      expect(
        box.rootHeight,
        `#${index}: kök tetikleyiciden yüksek — akışta kalan bir çocuk var`,
      ).toBe(box.triggerHeight);

      expect(box.caret, `#${index}: caret bulunamadı`).not.toBeNull();
      expect(box.caret!.isInside, `#${index}: caret tetikleyicinin dışına düşmüş`).toBe(true);
      expect(box.caret!.insetEnd, `#${index}: caret sağ kenardan kopmuş`).toBeLessThanOrEqual(
        CARET_MAX_INSET,
      );
      expect(box.caret!.verticalDrift, `#${index}: caret dikeyde ortalanmamış`).toBeLessThanOrEqual(
        ROUNDING,
      );

      if (!box.clear) continue;

      expect(
        box.clear.position,
        `#${index}: \`✕\` mutlak konumlu değil — mixin ezmiş olabilir`,
      ).toBe('absolute');
      expect(box.clear.isInside, `#${index}: \`✕\` tetikleyicinin dışına düşmüş`).toBe(true);
      expect(box.clear.verticalDrift, `#${index}: \`✕\` dikeyde ortalanmamış`).toBeLessThanOrEqual(
        ROUNDING,
      );
    }
  });

  test('kök ile tetikleyici AYRIŞTIĞINDA da süsler tetikleyiciye bağlı kalır', async ({ page }) => {
    await page.goto('/?theme=light&solo=Combobox');
    await page.addStyleTag({ content: '.gallery__stage > div { padding-top: 28px; }' });
    await page.evaluate(() => document.fonts.ready);

    const triggers = await readTriggers(page);

    for (const [index, box] of triggers.entries()) {
      expect(box.caret!.isInside, `#${index}: caret kökün dolgusuyla birlikte kaymış`).toBe(true);
      expect(
        box.caret!.verticalDrift,
        `#${index}: caret tetikleyicinin değil kökün merkezine hizalanmış`,
      ).toBeLessThanOrEqual(ROUNDING);
    }
  });
});

/*
 * Odak GERCEK tarayicida olculur: yuzey konumu olculene kadar `visibility: hidden` tasir ve gizli
 * oge odak ALMAZ. jsdom gorunurlugu bilmedigi icin birim testleri bunu goremiyordu.
 */
test.describe('menü açılışında odak', () => {
  test('Menu açılınca odak İLK öğede', async ({ page }) => {
    await page.goto('/?theme=light&solo=Menu');
    await page.getByRole('button', { name: 'Eylemler' }).click();

    await expect(page.getByRole('menuitem', { name: 'Kopyala' })).toBeFocused();
  });

  test('ContextMenu açılınca odak İLK öğede', async ({ page }) => {
    await page.goto('/?theme=light&solo=ContextMenu');

    await expect(page.getByRole('menuitem', { name: 'Verisini kopyala' })).toBeFocused();
  });
});
