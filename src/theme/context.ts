'use client';

import { createContext, useContext } from 'react';

import type { HanuiLinkComponent } from '../types/link.type';
import type { HanuiLabels } from './labels';
import type { HanuiThemeConfig } from './tokens';

export type HanuiContextValue = {
  /** Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…). */
  linkComponent?: HanuiLinkComponent;
  /** Uygulanan tema ezmeleri. Salt okunur; değiştirmek için `HanuiProvider`. */
  theme?: HanuiThemeConfig;
  /**
   * Arayüz metinleri. Bir bileşen metnini prop olarak almadıysa buradan okur
   * (bkz. `theme/labels.ts`).
   */
  labels?: HanuiLabels;
};

const HanuiContext = createContext<HanuiContextValue>({});

/** Sağlayıcı ZORUNLU DEĞİL. */
export const useHanui = (): HanuiContextValue => useContext(HanuiContext);

export default HanuiContext;
