import { expect, test } from '@playwright/test';

const ROUNDING = 2;

const MAX_ANCHOR_GAP = 24;

test.describe('üst katman — modal içindeki yüzeyler', () => {
  test('modalin içinden açılan menü GÖRÜNÜR ve tetikleyicisinin yanında', async ({ page }) => {
    await page.goto('/?theme=light&solo=Modal');
    await page.evaluate(() => document.fonts.ready);

    const dialog = page.getByRole('dialog', { name: 'Satırı düzenle' });
    await expect(dialog).toBeVisible();

    const trigger = dialog.getByRole('button', { name: 'Eylemler' });
    await trigger.click();

    const menu = page.getByRole('menu', { name: 'Satır eylemleri' });
    await expect(menu).toBeVisible();

    const hitsMenu = await page.evaluate(() => {
      const surface = document.querySelector('[role="menu"]');
      if (!surface) return { ok: false, hit: 'menü yok' };

      const box = surface.getBoundingClientRect();
      const target = document.elementFromPoint(box.left + box.width / 2, box.top + 8);

      return {
        ok: surface.contains(target),
        hit: target ? target.tagName.toLowerCase() : 'yok',
      };
    });

    expect(hitsMenu, 'menü modalin altında kalıyor — üst katmana çıkmamış').toMatchObject({
      ok: true,
    });

    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    if (!triggerBox || !menuBox) throw new Error('kutu ölçülemedi');

    expect(
      Math.abs(menuBox.x - triggerBox.x),
      'menü yatayda tetikleyiciden kaymış — kapsayıcı blok değişmiş olabilir',
    ).toBeLessThanOrEqual(triggerBox.width + ROUNDING);

    const gap = Math.min(
      Math.abs(menuBox.y - (triggerBox.y + triggerBox.height)),
      Math.abs(triggerBox.y - (menuBox.y + menuBox.height)),
    );

    expect(gap, 'menü tetikleyiciye bitişik değil — konum kaymış').toBeLessThanOrEqual(
      MAX_ANCHOR_GAP,
    );
  });

  test('modal DIŞINDA menü hâlâ body portalını kullanır', async ({ page }) => {
    await page.goto('/?theme=light');
    await page.evaluate(() => document.fonts.ready);

    await page.getByRole('button', { name: 'Eylemler' }).first().click();
    const menu = page.getByRole('menu', { name: 'Satır eylemleri' });
    await expect(menu).toBeVisible();

    const placement = await page.evaluate(() => {
      const surface = document.querySelector('[role="menu"]');
      return {
        parent: surface?.parentElement?.tagName.toLowerCase() ?? 'yok',
        hasPopover: surface?.hasAttribute('popover') ?? false,
      };
    });

    expect(placement).toMatchObject({ parent: 'body', hasPopover: false });
  });
});
