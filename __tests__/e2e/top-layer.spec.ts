import { expect, test } from '@playwright/test';

/**
 * ÜST KATMAN SÖZLEŞMESİ — modalin içinden açılan yüzeyler görünür olmak zorunda.
 *
 * ⚠ BU TEST JSDOM'DA YAZILAMAZ. `<dialog>.showModal()` elemanı tarayıcının
 * **üst katmanına** taşır; üst katman `z-index`ten bağımsız olarak sayfadaki
 * her şeyin üstüne boyanır ve jsdom'un böyle bir kavramı yok. Yani bu arıza
 * 427 birim testinin hiçbirinde görünmez — yalnızca gerçek motor gösterir.
 *
 * Ölçülen arıza (2026-08-15, chromium + webkit, ikisinde de aynı): `Menu`
 * `document.body`ye portallanıyordu ve modal açıkken menü tıklama testinde
 * `<dialog>` döndürüyordu, yani menü tamamen kaplıydı.
 *
 * Düzeltme `src/helpers/portal.helper.ts` içinde ve iki parçalı — ikisi de
 * ölçümle seçildi:
 *   1. yüzey en yakın açık `<dialog>`a portallanır (yoksa `document.body`),
 *   2. o durumda `popover="manual"` + `showPopover()` ile üst katmana çıkar.
 *
 * ⚠ (1) TEK BAŞINA YETMEZ: `Modal` `translate` ile animasyonlanıyor ve `none`
 * olmayan her `translate` `position: fixed` torunlar için kapsayıcı blok
 * yaratır — yüzey görünür olur ama YANLIŞ YERDE çizilir. Bu yüzden test hem
 * görünürlüğü hem konumu ölçer.
 */

const ROUNDING = 2;

/** Menü ile tetikleyici arasındaki payı `usePositioning`in `offset`i belirler. */
const MAX_ANCHOR_GAP = 24;

test.describe('üst katman — modal içindeki yüzeyler', () => {
  test('modalin içinden açılan menü GÖRÜNÜR ve tetikleyicisinin yanında', async ({ page }) => {
    await page.goto('/?theme=light&solo=Modal');
    await page.evaluate(() => document.fonts.ready);

    /*
     * `?solo=Modal` bu bileşenin TÜM varyantlarını çiziyor, yani sayfada birden
     * fazla açık `<dialog>` var. Hedef erişilebilir adıyla daraltılır.
     */
    const dialog = page.getByRole('dialog', { name: 'Satırı düzenle' });
    await expect(dialog).toBeVisible();

    const trigger = dialog.getByRole('button', { name: 'Eylemler' });
    await trigger.click();

    const menu = page.getByRole('menu', { name: 'Satır eylemleri' });
    await expect(menu).toBeVisible();

    /*
     * `toBeVisible` YETMEZ: görünürlük DOM/CSS düzeyinde bakar, üst katman ise
     * BOYAMA sırasıdır. Modalin altında kalan bir menü hâlâ "visible" sayılır.
     * Gerçek soru "o piksele tıklarsam menüye mi basarım", ve onu yalnızca
     * isabet testi cevaplar.
     */
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

    /* Konum: menü tetikleyicisinin hemen altında olmalı, dialog offsetiyle kaymamış. */
    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    if (!triggerBox || !menuBox) throw new Error('kutu ölçülemedi');

    expect(
      Math.abs(menuBox.x - triggerBox.x),
      'menü yatayda tetikleyiciden kaymış — kapsayıcı blok değişmiş olabilir',
    ).toBeLessThanOrEqual(triggerBox.width + ROUNDING);

    /*
     * ⚠ "Menü tetikleyicinin ALTINDA" DİYE İDDİA EDİLMEZ. `usePositioning`
     * viewport'ta yer kalmadığında tarafı çevirir ve mobil yükseklikte
     * (Pixel 7 / iPhone 14) tetikleyici zaten sayfanın dibinde — menü yukarı
     * açılır ve bu DOĞRU davranıştır. İlk yazımda bu iddia vardı ve testi
     * kıran şey koddaki bir hata değil iddianın kendisiydi.
     *
     * Ölçülmesi gereken şey yön değil BAĞLILIK: menü, tetikleyicinin bir
     * kenarına bitişik mi. Dialog offseti sızsaydı bu mesafe dialogun sayfa
     * içindeki konumu kadar açılırdı.
     */
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

    /*
     * Modal yokken `popover` KULLANILMAZ. Gereksiz üst katman kullanımı
     * yüzeyi sayfa akışından koparır ve `popover` desteklemeyen bir ortamda
     * `display: none` bırakırdı — düzeltmenin dar kalması bilinçli.
     */
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
