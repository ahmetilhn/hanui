/**
 * @jest-environment node
 */
/* Sunucu çizimi SINANIYOR: tema ezmesi ilk boyamada uygulanmalı, hidrasyondan sonra değil. */
import { renderToString } from 'react-dom/server';

import { THEME_STYLE_ID } from '@/helpers/theme.helper';
import HanuiProvider from '@/theme/HanuiProvider';

describe('HanuiProvider — sunucu çizimi', () => {
  it('tema ezmesi SUNUCU çıktısında ve çocuklardan önce', () => {
    const html = renderToString(
      <HanuiProvider theme={{ dark: { 'danger-solid': '#ededed' } }}>
        <p>içerik</p>
      </HanuiProvider>,
    );

    expect(html.startsWith(`<style id="${THEME_STYLE_ID}">@layer hanui {`)).toBe(true);
    expect(html).toContain('--hanui-danger-solid: #ededed;');
    expect(html.indexOf('<style')).toBeLessThan(html.indexOf('<p>'));
  });

  it('tema verilmezse hiçbir şey çizmez — sağlayıcı yalnızca bağlam', () => {
    const html = renderToString(
      <HanuiProvider>
        <p>içerik</p>
      </HanuiProvider>,
    );

    expect(html).toBe('<p>içerik</p>');
  });

  it('CSS HTML varlığına çevrilmez — seçicideki tırnak bozulmaz', () => {
    const html = renderToString(
      <HanuiProvider theme={{ light: { link: '#0d6efd' } }}>
        <p>içerik</p>
      </HanuiProvider>,
    );

    expect(html).toContain("html:root[data-hanui-theme='light']");
    expect(html).not.toContain('&#x27;');
  });
});
