import { isClient } from '@handijit/utils';

import { applyThemeConfig, DENSITY_ATTRIBUTE, THEME_ATTRIBUTE } from '../helpers/theme.helper';
import type { InitUiOptions } from '@/types/theme.type';

/**
 * Kütüphaneyi React ağacının dışından yapılandırır.
 * @example // app/layout.tsx — <head> içine, boyamadan önce. <script…
 */
export const initUi = (options: InitUiOptions = {}): void => {
  applyThemeConfig(options.theme);

  if (!isClient()) return;

  if (options.colorScheme)
    document.documentElement.setAttribute(THEME_ATTRIBUTE, options.colorScheme);

  if (options.density) document.documentElement.setAttribute(DENSITY_ATTRIBUTE, options.density);
};

export default initUi;
