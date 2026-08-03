import { isClient } from '@ahmetilhn/handy-utils';

import {
  DARK_THEME,
  DEFAULT_FONTS,
  LIGHT_THEME,
  type HanuiColorScheme,
  type HanuiResolvedTokens,
  type HanuiThemeConfig,
} from '../theme/tokens';

/** CSS özel özelliği öneki — `_tokens.generated.scss` ile aynı olmak zorunda. */
export const TOKEN_PREFIX = '--hanui-';

/** Ezme kurallarını taşıyan `<style>` etiketinin kimliği. */
export const THEME_STYLE_ID = 'hanui-theme-overrides';

/** Temanın taşındığı öznitelik. `<html data-hanui-theme="dark">`. */
export const THEME_ATTRIBUTE = 'data-hanui-theme';

/**
 * Bilgi yoğunluğunun taşındığı öznitelik.
 * `<html data-hanui-density="compact">`.
 *
 * <p>Tema gibi BELGE düzeyinde: portal ile gövdeye taşınan kip pencere de aynı
 * yoğunlukta olmalı ve bir React ağacına bağlanan değer onu kapsamıyor.
 */
export const DENSITY_ATTRIBUTE = 'data-hanui-density';

/** Geçiş animasyonlarını tek kare boyunca kapatan sınıf (bkz. `base.scss`). */
export const THEME_SWITCHING_CLASS = 'hanui-theme-switching';

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
 * Yapılandırmayı CSS metnine çevirir.
 *
 * <h3>Neden yalnızca EZİLEN token'lar yazılıyor</h3>
 * Tam eşlemeyi yazmak da çalışırdı ama iki bedeli var: çıktı 90 satır yerine
 * 4 satır olurdu ve daha önemlisi, kütüphane bir sonraki sürümde bir token'ın
 * varsayılanını değiştirdiğinde tüketicinin sayfası ESKİ değeri yazmaya devam
 * ederdi — üstelik ezmediği bir token için. Ezmeler ne ise o yazılır.
 *
 * <h3>Neden `<style>`, neden satır içi stil değil</h3>
 * Satır içi stil yalnızca `<html>` üzerinde durur ve `[data-hanui-theme]`
 * seçicisinden daha yüksek özgüllüktedir: kullanıcı temayı değiştirdiğinde
 * ezmeler HER İKİ temada da aynı kalıyordu. Ayrı bir kural bloğu, açık ve
 * koyu ezmeleri kendi seçicilerine bağlar.
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
      `:root {\n${fontEntries
        .map(([role, stack]) => `  ${TOKEN_PREFIX}font-${role}: ${stack};`)
        .join('\n')}\n}`,
    );

  /*
   * OLCU EZMELERI TEMA BASINA DEGIL, TEK BLOKTA.
   *
   * Bir markanin yuvarlakligi acik temada 12 px, koyu temada 8 px olmaz. Ayri
   * verilebilseydi iki degerin ayrismasi kacinilmazdi ve fark yalnizca tema
   * degistirildiginde gorunurdu — yani neredeyse hic.
   *
   * `:root` YETERLI: renk ezmelerinde iki secici gerekiyordu cunku uretilmis
   * koyu blok `[data-hanui-theme='dark']` ile ozgullukte yarisiyor. Olcuye
   * karsilik gelen uretilmis blok ise `:root` (base-tokens) — esit ozgulluk,
   * kaynak sirasi kazandiriyor ve bu etiket `<head>`in SONUNA ekleniyor.
   *
   * TEK ISTISNA yogun kip: `[data-hanui-density='compact']` daha yuksek
   * ozgullukte ve ezmeyi yener. Ezme orada da gecerli olsun diye ayni govde
   * ikinci kez, o secici altinda yaziliyor — aksi halde tuketicinin verdigi
   * `space-4`, compact acilir acilmaz kutuphanenin varsayilanina donuyordu.
   */
  const metrics = config.metrics ?? {};

  if (Object.keys(metrics).length > 0) {
    const body = declarations(metrics as Record<string, string>);
    blocks.push(`:root {\n${body}\n}`);
    blocks.push(`:root[${DENSITY_ATTRIBUTE}='compact'] {\n${body}\n}`);
  }

  /*
   * Acik tema iki secicide birden yazilir: `:root` (varsayilan) ve
   * `:root[data-hanui-theme='light']` (kullanicinin acik secimi). Yalnizca
   * `:root` yazilsaydi, sistem tercihi koyu olan bir cihazda acik temayi ELLE
   * secen kullanicida ezmeler dusuyordu — cunku uretilmis koyu blok
   * `:root:not([data-hanui-theme])` degil `[data-hanui-theme='light']` ile
   * yarisiyor ve ozgullukte kazaniyor.
   */
  if (config.light && Object.keys(config.light).length > 0) {
    const body = declarations(config.light);
    blocks.push(`:root {\n${body}\n}`);
    blocks.push(`:root[${THEME_ATTRIBUTE}='light'] {\n${body}\n}`);
  }

  if (config.dark && Object.keys(config.dark).length > 0) {
    const body = declarations(config.dark);
    blocks.push(`:root[${THEME_ATTRIBUTE}='dark'] {\n${body}\n}`);
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n  :root:not([${THEME_ATTRIBUTE}]) {\n${declarations(
        config.dark,
        '    ',
      )}\n  }\n}`,
    );
  }

  return blocks.join('\n\n');
};

/**
 * Ezmeleri belgeye yazar. Aynı `<style>` etiketi tekrar kullanılır: her
 * çağrıda yeni bir etiket eklemek, birbirini ezen onlarca blok bırakıyordu.
 *
 * <p>Etiket `<head>`in SONUNA eklenir — paket CSS'i ondan önce yüklenmiş
 * olmalı ki eşit özgüllükte ezme kazansın.
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
