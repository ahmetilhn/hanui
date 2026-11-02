import { isClient } from '@ahmetilhn/handy-utils';

import { DARK_THEME, DEFAULT_FONTS, LIGHT_THEME } from '../theme/tokens';
import type { HanuiColorScheme, HanuiResolvedTokens, HanuiThemeConfig } from '@/types/theme.type';

/** CSS özel özelliği öneki — `_tokens.generated.scss` ile aynı olmak zorunda. */
export const TOKEN_PREFIX = '--hanui-';

/** Ezme kurallarını taşıyan `<style>` etiketinin kimliği. */
export const THEME_STYLE_ID = 'hanui-theme-overrides';

/** Temanın taşındığı öznitelik. `<html data-hanui-theme="dark">`. */
export const THEME_ATTRIBUTE = 'data-hanui-theme';

/** Bilgi yoğunluğunun taşındığı öznitelik. `<html data-hanui-density="compact">`. */
export const DENSITY_ATTRIBUTE = 'data-hanui-density';

/** Geçiş animasyonlarını tek kare boyunca kapatan sınıf (bkz. `base.scss`). */
export const THEME_SWITCHING_CLASS = 'hanui-theme-switching';

/** Ezmelerin katmanı — `scripts/lib/postcss-hanui-layer.mjs`in varsayılanıyla aynı olmak zorunda. */
export const THEME_LAYER = 'hanui';

/**
 * Ezme kurallarının kök seçicisi: `_tokens.generated.scss`teki karşılığından bir öğe (`html`) daha
 * özgül — (0,1,1) > (0,1,0), (0,2,1) > (0,2,0). Katman içinde ezme varsayılanı KAYNAK SIRASINDAN
 * bağımsız yener. Açık temanın `html:root`u (0,1,1) koyu varsayılanın `:root:not([…])`ına
 * (0,2,0) yenilir: açık ezme koyu temaya sızmaz.
 */
const THEME_ROOT = 'html:root';

/** Verilen şemanın tam token eşlemesi — ezmeler uygulanmış hâliyle. */
export const resolveTokens = (
  scheme: HanuiColorScheme,
  config?: HanuiThemeConfig,
): HanuiResolvedTokens => {
  const base = scheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const overrides = (scheme === 'dark' ? config?.dark : config?.light) ?? {};

  return { ...base, ...overrides };
};

/**
 * Yapılandırmayı CSS metnine çevirir. Çıktının tamamı `@layer hanui` içinde: tüketicinin katmansız
 * her kuralı ezmeyi özgüllükten ve sıradan bağımsız yener (README, "CSS'imizi ezmek").
 * ⚠ 5.6.2'ye kadar ezme katmansızdı: `:root:not([data-hanui-theme])` (0,2,0) tüketicinin `<html>`e
 * yazdığı ezmeyi (`html:has(.panel)`, 0,1,1) hidrasyondan SONRA eziyordu — sunucu çiziminde
 * tüketicinin rengi, bir kare sonra temanınki (ölçüldü: panelin kırmızı sil düğmesi koyu temada
 * beyaza dönüyordu). Katmansız açık ezme koyu varsayılanı da yeniyor, koyu temaya sızıyordu.
 */
export const buildThemeCss = (config: HanuiThemeConfig): string => {
  const blocks: string[] = [];

  const declarations = (tokens: Record<string, string>, indent = '  ') =>
    Object.entries(tokens)
      .map(([name, value]) => `${indent}${TOKEN_PREFIX}${name}: ${value};`)
      .join('\n');

  const fonts = config.fonts ?? {};
  const fontEntries = Object.entries(fonts).filter(([, value]) => Boolean(value)) as [
    keyof typeof DEFAULT_FONTS,
    string,
  ][];

  if (fontEntries.length > 0)
    blocks.push(
      `${THEME_ROOT} {\n${fontEntries
        .map(([role, stack]) => `  ${TOKEN_PREFIX}font-${role}: ${stack};`)
        .join('\n')}\n}`,
    );

  /* OLCU EZMELERI TEMA BASINA DEGIL, TEK BLOKTA. */
  const metrics = config.metrics ?? {};

  if (Object.keys(metrics).length > 0) {
    const body = declarations(metrics as Record<string, string>);
    blocks.push(`${THEME_ROOT} {\n${body}\n}`);
    blocks.push(`${THEME_ROOT}[${DENSITY_ATTRIBUTE}='compact'] {\n${body}\n}`);
  }

  /*
   * Acik tema iki secicide birden yazilir: `html:root` (varsayilan) ve
   * `html:root[data-hanui-theme='light']` (kullanicinin acik secimi).
   */
  if (config.light && Object.keys(config.light).length > 0) {
    const body = declarations(config.light);
    blocks.push(`${THEME_ROOT} {\n${body}\n}`);
    blocks.push(`${THEME_ROOT}[${THEME_ATTRIBUTE}='light'] {\n${body}\n}`);
  }

  if (config.dark && Object.keys(config.dark).length > 0) {
    const body = declarations(config.dark);
    blocks.push(`${THEME_ROOT}[${THEME_ATTRIBUTE}='dark'] {\n${body}\n}`);
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n  ${THEME_ROOT}:not([${THEME_ATTRIBUTE}]) {\n${declarations(
        config.dark,
        '    ',
      )}\n  }\n}`,
    );
  }

  if (blocks.length === 0) return '';

  return `@layer ${THEME_LAYER} {\n${blocks.join('\n\n').replace(/^(?=.)/gm, '  ')}\n}`;
};

/**
 * `<style>` içine HTML olarak yazılacak CSS: `</style` dizisi etiketi kapatamaz. Değerler
 * yapılandırmadan (kiracının veritabanındaki marka rengi) gelebilir; `\/` CSS'te `/` demek.
 */
export const toStyleHtml = (css: string): string => css.replace(/<\/style/gi, '<\\/style');

/**
 * Ezmeleri `<head>`in sonuna yazar — React dışındaki yol (`initHanui`); sağlayıcı ezmeyi ağaçta
 * çizer.
 * ⚠ Stil sayfalarından SONRA çağrılmalı: `@layer hanui` belgede ilk kez burada görülürse katman
 * sırası buradan kurulur ve tüketicinin sonra gelen `@layer reset, hanui;` bildirimi `reset`i
 * `hanui`nin üstüne koyar.
 */
export const applyThemeConfig = (config: HanuiThemeConfig | undefined): void => {
  if (!isClient()) return;

  const css = config ? buildThemeCss(config) : '';
  const existing = document.getElementById(THEME_STYLE_ID);

  if (css === '') {
    existing?.remove();
    return;
  }

  const element = existing ?? document.createElement('style');
  element.id = THEME_STYLE_ID;
  element.textContent = css;

  if (!existing) document.head.appendChild(element);
};

/**
 * İLK BOYAMADAN ÖNCE çalışacak tema betiği — `<head>` içine, React ağacından ÖNCE.
 * Kayıtlı açık seçimi (`light` / `dark`) `<html data-hanui-theme>`e yazar; kayıt yoksa öznitelik
 * yazılmaz ve sistem tercihi izlenir.
 * ⚠ React ağacına konamaz: sağlayıcı ağaç monte olduktan sonra çalışıyor ve koyu tema seçmiş
 * kullanıcı o ana kadar bir kare beyaz ekran görüyordu. İki tüketici bu betiği ELLE yazıyordu.
 * ⚠ Depolama okunamazsa (gizli pencere, engellenmiş site verisi) sessizce sistem tercihine düşer.
 * @example <script dangerouslySetInnerHTML={{ __html: themeBootScript({ storageKey: 'theme' }) }} />
 */
export const themeBootScript = ({ storageKey }: { storageKey: string }): string =>
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)});` +
  `if(t==="light"||t==="dark")document.documentElement.setAttribute("${THEME_ATTRIBUTE}",t)}` +
  `catch(e){}})()`;
