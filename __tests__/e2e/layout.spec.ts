import { expect, test } from '@playwright/test';

const CONSTRAINED_HEIGHT = 240;

test('kısıtlı sütunda akordeon EZİLMEZ, sütun kayar', async ({ page }) => {
  await page.goto('/?theme=light');
  await page.evaluate(() => document.fonts.ready);

  const result = await page.evaluate(height => {
    const source = document.querySelector('[data-gallery="Accordion"] details')?.closest('div');
    if (!source) return { error: 'galeride akordeon bulunamadı' };

    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: `${height}px`,
      overflowY: 'auto',
      width: '280px',
      position: 'fixed',
      top: '0',
      left: '0',
    });

    for (let index = 0; index < 4; index += 1) sidebar.append(source.cloneNode(true));
    document.body.append(sidebar);

    const clipped = [...sidebar.children].map(node => {
      const drawn = Math.round(node.getBoundingClientRect().height);
      const wanted = Math.round(node.scrollHeight);
      return wanted - drawn;
    });

    return {
      clipped: clipped.reduce((sum, value) => sum + Math.max(0, value), 0),
      scrolls: sidebar.scrollHeight > sidebar.clientHeight,
      children: sidebar.children.length,
    };
  }, CONSTRAINED_HEIGHT);

  expect(result.error).toBeUndefined();
  expect(result.children).toBe(4);
  expect(result.clipped).toBe(0);
  expect(result.scrolls).toBe(true);
});
