'use client';

import { type FC, type ReactNode, useEffect, useMemo } from 'react';

import { applyThemeConfig } from '../helpers/theme.helper';
import type { HanuiLinkComponent } from '../types/link.type';
import HanuiContext from './context';
import type { HanuiThemeConfig } from './tokens';

type Props = {
  children: ReactNode;
  /**
   * Tema ezmeleri. Yalnızca DEĞİŞTİRİLEN token'lar verilir; verilmeyen her
   * token varsayılanında kalır.
   *
   * <p>Nesne referansı her render'da yeniden üretilirse (satır içi nesne
   * literali) `<style>` etiketi de her render'da yeniden yazılır. Bileşen
   * bunu içerik karşılaştırmasıyla engeller ama yine de sabit bir referans
   * (modül düzeyinde tanımlı bir nesne) tercih edilmeli.
   */
  theme?: HanuiThemeConfig;
  /**
   * Tüketicinin bağlantı bileşeni. Verilmezse ham `<a>` çizilir.
   *
   * @example
   * import NextLink from 'next/link';
   * <HanuiProvider linkComponent={NextLink}>…</HanuiProvider>
   */
  linkComponent?: HanuiLinkComponent;
};

/**
 * Kütüphane sağlayıcısı.
 *
 * <h3>İki iş yapar, üçüncüsünü YAPMAZ</h3>
 * <ol>
 *   <li>Tema ezmelerini belgeye yazar (`<style id="hanui-theme-overrides">`).</li>
 *   <li>Yönlendirici bileşenini bileşen ağacına dağıtır.</li>
 *   <li><strong>Açık/koyu seçimini YÖNETMEZ.</strong></li>
 * </ol>
 *
 * <h3>Neden tema seçimi burada değil</h3>
 * Seçim `<html data-hanui-theme>` üzerinde taşınır ve o özniteliğin
 * <em>boyamadan önce</em> yazılması gerekir: React ağacı monte olduktan sonra
 * yazıldığında koyu tema seçmiş kullanıcı bir kare beyaz ekran görüyor. Doğru
 * yer, sunucudan gelen HTML'in `<head>`ine konan satır içi bir betik — ve
 * oraya yazmak tüketicinin çatısının işi (Next'te `app/layout.tsx`, Vite'ta
 * `index.html`). Sağlayıcı ondan sonra monte oluyor; oraya koymak sorunu
 * çözmüyor, gizliyor.
 *
 * <p>`useHanuiTheme` kancası seçimi <em>değiştirmek</em> için var; ilk değeri
 * yazmak için değil. README "Tema" bölümünde hazır betik duruyor.
 *
 * @example
 * <HanuiProvider linkComponent={NextLink} theme={{ light: { blue: '#0d6efd' } }}>
 *   <App />
 * </HanuiProvider>
 */
const HanuiProvider: FC<Props> = ({ children, theme, linkComponent }) => {
  /*
   * `JSON.stringify` bagimlilik anahtari olarak kullaniliyor: cagiran taraf
   * neredeyse her zaman satir ici bir nesne literali veriyor ve referans her
   * render'da degisiyor. Referansa baglansaydi `<style>` etiketi saniyede
   * onlarca kez yeniden yazilirdi.
   */
  const themeKey = useMemo(() => (theme ? JSON.stringify(theme) : ''), [theme]);

  useEffect(() => {
    applyThemeConfig(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey]);

  /* Bagimlilik `themeKey`: `theme` referansi her render'da degistigi icin
     ona baglanan bir memo hicbir sey saklamaz ve tuketicideki her bilesen
     bos yere yeniden cizilir. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ theme, linkComponent }), [themeKey, linkComponent]);

  return <HanuiContext.Provider value={value}>{children}</HanuiContext.Provider>;
};

export default HanuiProvider;
