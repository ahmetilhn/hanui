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
   *
   * <p>Uygulama başına SABİT bir karar olduğunda (operasyon paneli her zaman
   * `compact`) buradan verilir; kullanıcıya seçtiren bir uygulama özniteliği
   * kendisi yazar.
   */
  density: HanuiDensity;
}>;

/**
 * Kütüphaneyi <strong>React ağacının dışından</strong> yapılandırır.
 *
 * <h3>Ne zaman bu, ne zaman `HanuiProvider`</h3>
 * `HanuiProvider` React'in içinde yaşıyor ve yönlendirici bileşenini de
 * taşıyor — normal yol o. Bu fonksiyon iki durum için:
 *
 * <ul>
 *   <li><strong>Boyamadan önce çalışması gereken tema.</strong> Sağlayıcı
 *       ağaç monte olduktan sonra yazıyor; koyu tema seçmiş bir kullanıcı o
 *       ana kadar beyaz ekran görüyor. `<head>` içindeki satır içi bir
 *       betikten çağrıldığında ezmeler ilk boyamadan önce yerinde olur.</li>
 *   <li><strong>React kullanmayan bir kabuk.</strong> Tasarım token'ları
 *       yalnızca CSS; bir e-posta önizlemesi ya da Storybook temasında
 *       bileşen ağacı olmadan da gerekiyor.</li>
 * </ul>
 *
 * <p>İkisi birlikte kullanılabilir: aynı `<style>` etiketini paylaşırlar ve
 * son çağrı kazanır.
 *
 * @example
 * // app/layout.tsx — <head> içine, boyamadan önce.
 * <script dangerouslySetInnerHTML={{ __html: `
 *   document.documentElement.dataset.hanuiTheme =
 *     localStorage.getItem('theme') ?? 'light';
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
