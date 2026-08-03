'use client';

import { createContext, useContext } from 'react';

import type { HanuiLinkComponent } from '../types/link.type';
import type { HanuiThemeConfig } from './tokens';

export type HanuiContextValue = {
  /**
   * Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…).
   *
   * <p>Verilmezse ham `<a>` çizilir ve gezinme tam sayfa yenilemesi olur.
   * Bir bileşen kütüphanesi kendi yönlendiricisini SEÇEMEZ: `next/link`
   * import etmek paketi Next'e bağlar, `react-router` import etmek başka bir
   * uygulamayı kırar. Karar tüketicinin.
   */
  linkComponent?: HanuiLinkComponent;
  /** Uygulanan tema ezmeleri. Salt okunur; değiştirmek için `HanuiProvider`. */
  theme?: HanuiThemeConfig;
};

const HanuiContext = createContext<HanuiContextValue>({});

/**
 * Sağlayıcı ZORUNLU DEĞİL.
 *
 * <p>Sağlayıcısız kullanımda bağlantılar ham `<a>` olur ve tema
 * varsayılanlarda kalır — yani paket `import` edilip hiçbir kurulum
 * yapılmadan çalışır. Sağlayıcıyı zorunlu kılmak, tek bir `Badge` kullanmak
 * isteyen bir tüketiciyi de kök yerleşimi değiştirmeye zorluyordu.
 */
export const useHanui = (): HanuiContextValue => useContext(HanuiContext);

export default HanuiContext;
