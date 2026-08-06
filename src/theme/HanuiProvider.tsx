'use client';

import { type FC, type ReactNode, useEffect, useMemo, useRef } from 'react';

import { applyThemeConfig } from '../helpers/theme.helper';
import type { HanuiLinkComponent } from '../types/link.type';
import HanuiContext from './context';
import type { HanuiLabels } from './labels';
import type { HanuiThemeConfig } from './tokens';

type Props = {
  children: ReactNode;
  /**
   * Tema ezmeleri. Yalnızca DEĞİŞTİRİLEN token'lar verilir; verilmeyen her
   * token varsayılanında kalır.
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
  /** Arayüz metinleri — bir kez, burada. */
  labels?: HanuiLabels;
};

/**
 * Kütüphane sağlayıcısı.
 *
 * @example
 * <HanuiProvider linkComponent={NextLink} theme={{ light: { blue: '#0d6efd' } }}>
 * <App />
 * </HanuiProvider>
 */
const HanuiProvider: FC<Props> = ({ children, theme, linkComponent, labels }) => {
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

  /* `theme` bir REFERANSTAN okunur, bagimliliktan degil. */
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const value = useMemo(
    () => ({ theme: themeRef.current, linkComponent, labels }),
    /* `themeKey` denetciye GEREKSIZ gorunuyor cunku memo'nun govdesinde
       gecmiyor — ama tam da isi bu: temanin ICERIGI degistiginde yeni bir
       nesne uretilmesini saglayan tetik o. Cikarilirsa tema ezmesi degisse
       de tuketiciler eski degeri gorurdu. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeKey, linkComponent, labels],
  );

  return <HanuiContext.Provider value={value}>{children}</HanuiContext.Provider>;
};

export default HanuiProvider;
