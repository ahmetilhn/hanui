/**
 * @jest-environment node
 */
/* Sunucu çizimi SINANIYOR: tema ezmesi ilk boyamada uygulanmalı, hidrasyondan sonra değil. */
import { renderToString } from 'react-dom/server';

import { THEME_STYLE_ID } from '@/helpers/theme.helper';
import UiProvider from '@/theme/UiProvider';

describe('UiProvider — sunucu çizimi', () => {
  it('tema ezmesi SUNUCU çıktısında ve çocuklardan önce', () => {
    const html = renderToString(
      <UiProvider theme={{ dark: { 'danger-solid': '#ededed' } }}>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(html.startsWith(`<style id="${THEME_STYLE_ID}">@layer ui {`)).toBe(true);
    expect(html).toContain('--ui-danger-solid: #ededed;');
    expect(html.indexOf('<style')).toBeLessThan(html.indexOf('<p>'));
  });

  it('tema verilmezse hiçbir şey çizmez — sağlayıcı yalnızca bağlam', () => {
    const html = renderToString(
      <UiProvider>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(html).toBe('<p>içerik</p>');
  });

  it('CSS HTML varlığına çevrilmez — seçicideki tırnak bozulmaz', () => {
    const html = renderToString(
      <UiProvider theme={{ light: { link: '#0d6efd' } }}>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(html).toContain("html:root[data-ui-theme='light']");
    expect(html).not.toContain('&#x27;');
  });
});
