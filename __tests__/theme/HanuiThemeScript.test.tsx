/**
 * @jest-environment node
 */
/* Sunucu çizimi SINANIYOR: jsdom değil Node — tarayıcı API'si olmadan çizilebilmeli. */
import { renderToString } from 'react-dom/server';

import HanuiThemeScript from '@/theme/HanuiThemeScript';

describe('HanuiThemeScript', () => {
  it('SUNUCUDA çizilir — sunucu düzeninin `<head>`inde kullanılabilir', () => {
    const html = renderToString(<HanuiThemeScript storageKey="theme" />);

    expect(html.startsWith('<script>')).toBe(true);
    expect(html).toContain('data-hanui-theme');
  });

  it('anahtar betiğe KAÇIŞLI girer — tırnak betiği kırmaz', () => {
    const html = renderToString(<HanuiThemeScript storageKey={'te"ma'} />);

    expect(html).toContain(`localStorage.getItem(${JSON.stringify('te"ma')})`);
  });
});
