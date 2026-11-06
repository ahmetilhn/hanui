/**
 * @jest-environment node
 */
/* Sunucu çizimi SINANIYOR: jsdom değil Node — tarayıcı API'si olmadan çizilebilmeli. */
import { renderToString } from 'react-dom/server';

import UiThemeScript from '@/theme/UiThemeScript';

describe('UiThemeScript', () => {
  it('SUNUCUDA çizilir — sunucu düzeninin `<head>`inde kullanılabilir', () => {
    const html = renderToString(<UiThemeScript storageKey="theme" />);

    expect(html.startsWith('<script>')).toBe(true);
    expect(html).toContain('data-ui-theme');
  });

  it('anahtar betiğe KAÇIŞLI girer — tırnak betiği kırmaz', () => {
    const html = renderToString(<UiThemeScript storageKey={'te"ma'} />);

    expect(html).toContain(`localStorage.getItem(${JSON.stringify('te"ma')})`);
  });
});
