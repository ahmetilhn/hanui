import { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
/* Tarayıcı yapısı jsdom'da olmayan `MessageChannel`ı istiyor; çıktı aynı. */
import { renderToString } from 'react-dom/server.node';

import { THEME_STYLE_ID } from '@/helpers/theme.helper';
import UiProvider from '@/theme/UiProvider';

const THEME = { light: { link: '#0d6efd' }, dark: { link: '#6ea8fe' } };

describe('UiProvider — tema ezmesi', () => {
  it('ezme çocuklardan ÖNCE ağaçta çizilir, `<head>`e yazılmaz', () => {
    const { container } = render(
      <UiProvider theme={THEME}>
        <p>içerik</p>
      </UiProvider>,
    );

    const style = document.getElementById(THEME_STYLE_ID);

    expect(container.firstElementChild).toBe(style);
    expect(document.head.querySelector(`#${THEME_STYLE_ID}`)).toBeNull();
    expect(style?.textContent).toContain('@layer ui {');
  });

  /*
   * 5.6.2'ye kadar ezme sağlayıcının efektinde yazılıyordu: efektler çocuktan ebeveyne koştuğu
   * için çocuk ilk efektinde varsayılan paleti okuyordu.
   */
  it('çocuk ilk efektinde ezmeyi belgede bulur', () => {
    let seen: string | null | undefined;
    const Probe = () => {
      useEffect(() => {
        seen = document.getElementById(THEME_STYLE_ID)?.textContent;
      }, []);
      return null;
    };

    render(
      <UiProvider theme={THEME}>
        <Probe />
      </UiProvider>,
    );

    expect(seen).toContain('--ui-link: #0d6efd;');
  });

  it('tema değişince AYNI etiket güncellenir, kaldırılınca etiket gider', () => {
    const { rerender } = render(
      <UiProvider theme={THEME}>
        <p>içerik</p>
      </UiProvider>,
    );

    rerender(
      <UiProvider theme={{ light: { link: '#123456' } }}>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(document.querySelectorAll(`#${THEME_STYLE_ID}`)).toHaveLength(1);
    expect(document.getElementById(THEME_STYLE_ID)?.textContent).toContain('#123456');

    rerender(
      <UiProvider>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(document.getElementById(THEME_STYLE_ID)).toBeNull();
  });

  it('sunucu çıktısı uyuşmazlıksız hidrate olur — etiket yeniden yaratılmaz', async () => {
    const tree = (
      <UiProvider theme={THEME}>
        <p>içerik</p>
      </UiProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);

    const serverStyle = container.querySelector('style');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onRecoverableError = jest.fn();

    await act(async () => {
      hydrateRoot(container, tree, { onRecoverableError });
    });

    expect(consoleError).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('style')).toBe(serverStyle);

    consoleError.mockRestore();
    container.remove();
  });
});
