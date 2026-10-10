import { expect, type Locator, type Page, test } from '@playwright/test';

/*
 * KAYDIRMA KABI KAPSAYICI BLOKTUR.
 *
 * Görsel olarak gizli metin (`visually-hidden`: `StatusDot` adı, `TerminalOutput` stderr öneki)
 * `position: absolute` yazar ve en yakın KONUMLU ataya göre yerleşir. Kaydırma kabı konumlu değilse
 * o ata kabın DIŞINDADIR: etiket kırpılmaz, kabın içindeki statik yerinde (katlamanın çok altında)
 * durur ve her atanın kaydırılabilir taşmasını uzatır.
 *
 * ⚠ TÜKETİCİDE ÖLÇÜLDÜ (hanration, 2026-10-10): `ChatThread` içindeki `ToolCall` kartlarının nokta
 * adları ana bölgenin `scrollHeight`ini 843 → 1053 px'e çıkardı; `overflow: hidden` uygulama
 * çerçevesi programla kaydırılabilir oldu ve kipsel pencere kapanıp odağı geri verdiğinde tüm
 * yerleşim ~210 px yukarı kaydı.
 *
 * Bu koşu piksel değil geometri ölçer: gizli bir etiketi kabın DİBİNE koyar ve hiçbir atanın
 * taşmasının büyümediğini, odak/kaydırma isteğinin yalnızca kabı kaydırdığını doğrular.
 */

/** Etiketin kabın içinde durduğu derinlik (px) — her kabın görünen yüksekliğinin çok üstünde. */
const DEPTH = 1200;

type Case = {
  component: string;
  scroller: (page: Page) => Locator;
};

const CASES: readonly Case[] = [
  {
    component: 'ChatThread',
    scroller: page => page.locator('[data-gallery="ChatThread"] [role="region"]').first(),
  },
  {
    component: 'TerminalOutput',
    scroller: page => page.getByRole('region', { name: 'Komut çıktısı' }),
  },
  {
    component: 'ScrollArea',
    scroller: page => page.getByRole('region', { name: 'Uzun metin', exact: true }),
  },
  {
    component: 'ActionList',
    scroller: page => page.getByRole('list', { name: 'Uzun bağlam haritası' }).locator('..'),
  },
];

for (const { component, scroller } of CASES)
  test(`${component}: gizli etiket kaydırma kabından TAŞMAZ`, async ({ page }) => {
    await page.goto(`/?theme=light&solo=${component}`);
    await page.evaluate(() => document.fonts.ready);

    const target = scroller(page);
    await expect(target).toBeVisible();

    const result = await target.evaluate((element, depth) => {
      const ancestors: Element[] = [];
      for (let node = element.parentElement; node; node = node.parentElement) ancestors.push(node);

      const describe = (node: Element): string =>
        `${node.tagName.toLowerCase()}${node.className ? `.${String(node.className).split(' ')[0]}` : ''}`;
      const heights = () => ancestors.map(node => node.scrollHeight);
      const offsets = () => [window.scrollY, ...ancestors.map(node => node.scrollTop)];

      /*
       * Önce yalnızca dolgu: kabın kendisi `max-height`ine kadar büyüyebilir (meşru). Ölçülen tek şey
       * ETİKETİN etkisi — dolgudan sonra eklenen gizli etiket hiçbir atanın taşmasını büyütmemeli.
       */
      const spacer = document.createElement('div');
      spacer.style.blockSize = `${depth}px`;
      element.append(spacer);

      const before = heights();
      const label = document.createElement('span');
      label.className = 'hanui-visually-hidden';
      label.textContent = 'Çalışıyor';
      element.append(label);

      const after = heights();
      const grown = ancestors
        .map((node, index) => ({ node: describe(node), by: after[index] - before[index] }))
        .filter(entry => entry.by > 0);

      /* Odak iadesinin ve ekran okuyucu imlecinin yaptığı şey: etiketi görünür alana getirmek. */
      const offsetsBefore = offsets();
      label.scrollIntoView({ block: 'nearest' });
      const scrolledAncestors = offsets().some((value, index) => value !== offsetsBefore[index]);

      return {
        ownHeight: element.scrollHeight,
        ownScrolled: element.scrollTop > 0,
        grown,
        scrolledAncestors,
      };
    }, DEPTH);

    /* Ölçümün kendisi doğru kaba mı uygulandı: dolgu kabın kendi taşmasında. */
    expect(result.ownHeight, 'dolgu kabın içine girmedi').toBeGreaterThanOrEqual(DEPTH);

    expect(result.grown, `${component}: gizli etiket ataların taşmasını büyüttü`).toEqual([]);
    expect(result.scrolledAncestors, `${component}: etiket ataları kaydırdı`).toBe(false);
    expect(result.ownScrolled, `${component}: etiketi kab göstermedi`).toBe(true);
  });
