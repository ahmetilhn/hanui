import { isClient } from '@ahmetilhn/handy-utils';

import { applyThemeConfig, DENSITY_ATTRIBUTE, THEME_ATTRIBUTE } from '../helpers/theme.helper';
import type { HanuiColorScheme, HanuiDensity, HanuiThemeConfig } from './tokens';

export type InitHanuiOptions = Partial<{
  /** Tema ve ölçü ezmeleri. Yalnızca değiştirilen token'lar verilir. */
  theme: HanuiThemeConfig;
  /**
   * Başlangıç şeması. Verilmezse `<html data-hanui-theme>` neyse o kalır;
   * o da yoksa sistem tercihi (`prefers-color-scheme`) devreye girer.
   */
  colorScheme: HanuiColorScheme;
  /**
   * Bilgi yoğunluğu. Verilmezse `<html data-hanui-density>` neyse o kalır;
   * o da yoksa `default`.
   */
  density: HanuiDensity;
}>;

/**
 * Kütüphaneyi <strong>React ağacının dışından</strong> yapılandırır.
 *
 * @example
 * // app/layout.tsx — <head> içine, boyamadan önce.
 * <script dangerouslySetInnerHTML={{ __html: `
 * document.documentElement.dataset.hanuiTheme =
 * localStorage.getItem('theme') ?? 'light';
 * ` }} />
 */
export const initHanui = (options: InitHanuiOptions = {}): void => {
  applyThemeConfig(options.theme);

  if (!isClient()) return;

  if (options.colorScheme)
    document.documentElement.setAttribute(THEME_ATTRIBUTE, options.colorScheme);

  if (options.density) document.documentElement.setAttribute(DENSITY_ATTRIBUTE, options.density);
};

export default initHanui;
