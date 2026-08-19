import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * AÇILIR PANEL ANKRAJI — `Combobox` ve `Select` tetikleyicisine bağlı kalmak
 * zorunda.
 *
 * ⚠ BU TEST JSDOM'DA YAZILAMAZ. Ölçülen arıza bir **kapsayıcı blok** kaymasıdır:
 * `none` olmayan bir `transform`/`filter`/`contain` değeri taşıyan HER ata,
 * `position: fixed` torunları için kapsayıcı bloğu viewport'tan kendisine
 * çeker. `usePositioning` viewport koordinatı üretir; o koordinatlar artık
 * atanın sol üstüne göre yorumlanır ve panel atanın sayfa içindeki konumu
 * kadar kayar. jsdom yerleşim hesaplamaz — 500+ birim testinin hiçbiri bunu
 * görmez.
 *
 * Aynı arıza `Menu` için `top-layer.spec.ts`te kayıtlı ve orada portal +
 * üst katmanla çözüldü; `Combobox`/`Select` o düzeltmeyi ALMAMIŞTI.
 */

/** Panel ile tetikleyici arasındaki payı `usePositioning`in `offset`i belirler. */
const MAX_ANCHOR_GAP = 24;

/** Yuvarlama ve alt piksel farkı payı. */
const ROUNDING = 2;

/**
 * Kapsayıcı bloğu kıran ata. `translateZ(0)` gerçek dünyada en yaygın biçim
 * (GPU katmanı zorlama) ama `filter`, `will-change`, `contain: paint` ve
 * `backdrop-filter` de aynı sonucu verir.
 */
const CONTAINING_BLOCK_BREAKER = `
  .gallery__stage { transform: translateZ(0); }
`;

/**
 * KONUMLANDIRILAN YÜZEY, iç listbox DEĞİL.
 *
 * ⚠ `getByRole('listbox')` YANLIŞ ÖLÇER. `usePositioning` panelin KENDİSİNİ
 * konumlandırıyor ve `Combobox` panelinin tepesinde bir arama kutusu var, yani
 * listbox tetikleyiciden ~48px aşağıda başlar — ilk yazımda bu ölçüm "panel
 * kaymış" diye rapor edildi ve iddia yanlıştı, kod değil. Yüzey CSS modülü
 * sınıfına göre de aranmaz (karma isim): ölçütü kancanın kendi imzası verir,
 * yani satır içi yazılan `position: fixed`.
 */
const positionedSurface = (listbox: Locator): Locator =>
  listbox.locator('xpath=ancestor-or-self::*[contains(@style,"position: fixed")][1]');

/** Panelin tetikleyiciye bitişikliği — yön İDDİA EDİLMEZ, taraf çevrilebilir. */
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

/**
 * Panel GERÇEKTEN o piksellerde mi. `toBeVisible` DOM/CSS'e bakar; kırpan ya
 * da örten bir ata onu hâlâ "visible" bırakır. Gerçek soru "o piksele
 * tıklarsam panele mi basarım".
 */
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
  /*
   * `overflow: hidden` TEK BAŞINA `position: fixed`i kırpmaz — ama kapsayıcı
   * blok bir ataya kaydıysa kırpar. İki bozulma birlikte geldiğinde panel
   * hem yanlış yerde hem yarısı kesik oluyor; senaryo o birleşimi ölçer.
   */
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
  /*
   * ⚠ TEK BİR SIRALAMA HATASI ÜÇ ARIZA ÜRETİYORDU.
   *
   * `.combobox__clear` `position: absolute` yazıyor ama `@include tap-target`
   * ondan SONRA gelip `position: relative` yazıyordu (aynı özgüllük, son
   * bildirim kazanır). Ölçüldü (2026-08-19, chromium, `isClearable` + seçili
   * değer):
   *
   * | ne | beklenen | düzeltmeden önce |
   * |---|---|---|
   * | `✕` `position` | `absolute` | `relative` |
   * | `.combobox` kök yüksekliği | 48px | **73px** |
   * | `✕` yatay konumu | tetikleyicinin içinde | kökün **36px SOLUNDA** |
   * | caret dikey kayması | 0px | **12px** |
   *
   * Zincir: düğme akışta kaldı → tetikleyicinin ALTINA dizildi → kök şişti →
   * caret'in (köke çapalı) `top: 50%`i artık tetikleyicinin merkezi değil.
   * Caret o yüzden düz bir esnek çocuğa çevrildi: kapsayıcı bloktan BAĞIMSIZ.
   */

  /** Tetikleyici içi geometri — üç varyantın hepsi için. */
  const readTriggers = (page: Page) =>
    page.evaluate(() => {
      const roots = [...document.querySelectorAll('div')].filter(
        node => node.querySelector(':scope > button[aria-haspopup="listbox"]') !== null,
      );

      return roots.map(root => {
        const trigger = root.querySelector(':scope > button[aria-haspopup="listbox"]')!;
        const clear =
          [...root.querySelectorAll(':scope > button')].find(b => b !== trigger) ?? null;
        /* Caret tetikleyicinin SON svg'si: `icon` verildiğinde ilk svg öncü ikon. */
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

  /** Caret ile tetikleyicinin sağ kenarı arasındaki pay `$space-3` + ikon payı. */
  const CARET_MAX_INSET = 20;

  test('caret ve `✕` her varyantta tetikleyicinin İÇİNDE ve dikeyde ortalı', async ({ page }) => {
    await page.goto('/?theme=light&solo=Combobox');
    await page.evaluate(() => document.fonts.ready);

    const triggers = await readTriggers(page);
    expect(triggers.length, 'galeride Combobox bulunamadı').toBeGreaterThan(0);

    for (const [index, box] of triggers.entries()) {
      /*
       * ⚠ KÖK YÜKSEKLİĞİ = TETİKLEYİCİ YÜKSEKLİĞİ. Kök şiştiği anda köke
       * çapalı her süs kayar; ölçüm bu yüzden süslerden ÖNCE burayı tutuyor.
       */
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
    /*
     * Kökün kutusunu tetikleyiciden AYIRAN gerçekçi bir sapma: çağıran
     * `className` ile köke dolgu veriyor. Köke çapalı bir süs burada kayar,
     * esnek çocuk olan kaymaz.
     */
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
