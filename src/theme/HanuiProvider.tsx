'use client';

import { type FC, type ReactNode, useEffect, useMemo, useRef } from 'react';

import { applyThemeConfig } from '../helpers/theme.helper';
import type { HanuiLinkComponent } from '../types/link.type';
import HanuiContext from './context';
import type { HanuiLabels, HanuiThemeConfig } from '@/types/theme.type';

type Props = {
  children: ReactNode;
  /** Tema ezmeleri. */
  theme?: HanuiThemeConfig;
  /**
   * Tüketicinin bağlantı bileşeni.
   * @example import NextLink from 'next/link'; <HanuiProvider linkComponent={NextLink}>…</Ha…
   */
  linkComponent?: HanuiLinkComponent;
  /** Arayüz metinleri — bir kez, burada. */
  labels?: HanuiLabels;
};

/**
 * Kütüphane sağlayıcısı.
 * @example <HanuiProvider linkComponent={NextLink} theme={{ light: { link: '#0a58ca' } }}> <App…
 */
const HanuiProvider: FC<Props> = ({ children, theme, linkComponent, labels }) => {
  /*
   * `JSON.stringify` bagimlilik anahtari olarak kullaniliyor: cagiran taraf neredeyse her zaman
   * satir ici bir nesne literali veriyor ve referans her…
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
    /*
     * `themeKey` denetciye GEREKSIZ gorunuyor cunku memo'nun govdesinde gecmiyor — ama tam da isi
     * bu: temanin ICERIGI degistiginde yeni bir nesne…
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeKey, linkComponent, labels],
  );

  return <HanuiContext.Provider value={value}>{children}</HanuiContext.Provider>;
};

export default HanuiProvider;
