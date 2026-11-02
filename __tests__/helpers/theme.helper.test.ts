import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildThemeCss,
  resolveTokens,
  themeBootScript,
  THEME_ATTRIBUTE,
  THEME_LAYER,
  toStyleHtml,
} from '@/helpers/theme.helper';
import { DARK_THEME, LIGHT_THEME } from '@/theme/tokens';

/** Bir CSS metnindeki kural seçicileri (`@` kuralları hariç). */
const selectorsOf = (css: string): string[] =>
  css
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.endsWith('{') && !line.startsWith('@'))
    .map(line => line.slice(0, -1).trim());

describe('buildThemeCss', () => {
  it('yapılandırma boşken hiç kural üretmez', () => {
    expect(buildThemeCss({})).toBe('');
    expect(buildThemeCss({ light: {}, dark: {} })).toBe('');
  });

  it('yalnızca EZİLEN token yazılır, tam eşleme değil', () => {
    const css = buildThemeCss({ light: { link: '#0d6efd' } });

    expect(css).toContain('--hanui-link: #0d6efd');
    expect(css).not.toContain('--hanui-surface:');
    expect(css).not.toContain('--hanui-text:');
  });

  it('açık tema ezmesi HEM `html:root` HEM açık seçim seçicisine yazılır', () => {
    const css = buildThemeCss({ light: { link: '#0d6efd' } });

    expect(css).toMatch(/html:root\s*\{[^}]*--hanui-link: #0d6efd/);
    expect(selectorsOf(css)).toEqual(['html:root', `html:root[${THEME_ATTRIBUTE}='light']`]);
  });

  it('koyu tema ezmesi sistem tercihi yedeğine de iner', () => {
    const css = buildThemeCss({ dark: { link: '#6ea8fe' } });

    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(selectorsOf(css)).toEqual([
      `html:root[${THEME_ATTRIBUTE}='dark']`,
      `html:root:not([${THEME_ATTRIBUTE}])`,
    ]);
  });

  it('ölçü ezmesi tema seçiminden bağımsız `:root`a yazılır', () => {
    const css = buildThemeCss({ metrics: { 'radius-md': '2px', 'space-4': '20px' } });

    expect(css).toContain('--hanui-radius-md: 2px;');
    expect(css).toContain('--hanui-space-4: 20px;');
    expect(css).not.toContain(`[${THEME_ATTRIBUTE}='dark']`);
  });

  it('ölçü ezmesi YOĞUN kipte de geçerli kalır', () => {
    const css = buildThemeCss({ metrics: { 'space-4': '20px' } });

    expect(css).toContain("html:root[data-hanui-density='compact'] {");
    expect(css.match(/--hanui-space-4: 20px;/g)).toHaveLength(2);
  });

  it('ölçü verilmediğinde yoğunluk bloğu HİÇ yazılmaz', () => {
    expect(buildThemeCss({ metrics: {} })).toBe('');
    expect(buildThemeCss({ light: { link: '#0d6efd' } })).not.toContain('density');
  });

  it('font ezmesi tema seçiminden bağımsız `:root`a yazılır', () => {
    const css = buildThemeCss({ fonts: { heading: 'Archivo, sans-serif' } });

    expect(css).toContain('--hanui-font-heading: Archivo, sans-serif');
    expect(css).not.toContain(THEME_ATTRIBUTE);
  });
});

describe('buildThemeCss — tüketicinin ezmesi her zaman kazanır', () => {
  const FULL = {
    light: { link: '#0d6efd' },
    dark: { link: '#6ea8fe' },
    fonts: { heading: 'Archivo, sans-serif' },
    metrics: { 'radius-md': '2px' },
  };

  /*
   * Ezme katmansızken `:root:not([data-hanui-theme])` (0,2,0) tüketicinin `html:has(.panel)`
   * (0,1,1) ezmesini hidrasyondan sonra eziyordu: koyu temada kırmızı sil düğmesi bir kare sonra
   * beyaza, alanların zemini ve çizgisi temanın griye dönüyordu (ölçüldü, 5.6.3).
   */
  it('çıktının TAMAMI kütüphanenin katmanında — dışında kural yok', () => {
    const css = buildThemeCss(FULL);

    expect(css.startsWith(`@layer ${THEME_LAYER} {\n`)).toBe(true);
    expect(css.endsWith('\n}')).toBe(true);
    expect(css.match(/^@layer/gm)).toHaveLength(1);
    /* Katmanın içindeki her satır girintili: kapanıştan önce katman dışına çıkan kural yok. */
    expect(
      css
        .split('\n')
        .slice(1, -1)
        .every(line => line === '' || line.startsWith('  ')),
    ).toBe(true);
  });

  it('katman adı derlemenin sarmaladığı katmanla AYNI', () => {
    const plugin = readFileSync(
      path.join(__dirname, '../../scripts/lib/postcss-hanui-layer.mjs'),
      'utf8',
    );

    expect(plugin).toContain(`layer = '${THEME_LAYER}'`);
  });

  /*
   * Seçici `_tokens.generated.scss`teki karşılığından bir öğe daha özgül: katman içinde ezme
   * varsayılanı kaynak sırasından bağımsız yener, açık ezme koyu varsayılana (0,2,0) yenilir.
   */
  it('her seçici `html:root` ile başlar — `:root` karşılığından bir öğe özgül', () => {
    const selectors = selectorsOf(buildThemeCss(FULL));

    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.filter(selector => !selector.startsWith('html:root'))).toEqual([]);
  });
});

describe('toStyleHtml', () => {
  it('`</style` dizisi etiketi kapatamaz — değer veritabanından gelebilir', () => {
    const css = buildThemeCss({ light: { link: 'red;}</style><script>alert(1)</script>' } });

    expect(toStyleHtml(css)).not.toMatch(/<\/style/i);
    expect(toStyleHtml(css)).toContain('<\\/style><script>');
  });

  it('başka hiçbir şeye dokunmaz', () => {
    const css = buildThemeCss({ dark: { link: '#6ea8fe' } });

    expect(toStyleHtml(css)).toBe(css);
  });
});

describe('resolveTokens', () => {
  it('ezilmeyen her token varsayılanında kalır', () => {
    const resolved = resolveTokens('light', { light: { link: '#0d6efd' } });

    expect(resolved.link).toBe('#0d6efd');
    expect(resolved.surface).toBe(LIGHT_THEME.surface);
    expect(resolved.text).toBe(LIGHT_THEME.text);
  });

  it('koyu şema koyu varsayılanlardan türer', () => {
    expect(resolveTokens('dark').page).toBe(DARK_THEME.page);
    expect(resolveTokens('dark').page).not.toBe(LIGHT_THEME.page);
  });

  it('açık ezmesi koyu şemaya SIZMAZ', () => {
    const config = { light: { link: '#0d6efd' } };

    expect(resolveTokens('dark', config).link).toBe(DARK_THEME.link);
  });
});

describe('token sözleşmesi', () => {
  it('açık ve koyu tema AYNI anahtar kümesini taşır', () => {
    expect(Object.keys(DARK_THEME).sort()).toEqual(Object.keys(LIGHT_THEME).sort());
  });

  it('hiçbir token boş değer taşımaz', () => {
    const empty = Object.entries({ ...LIGHT_THEME, ...DARK_THEME }).filter(
      ([, value]) => !value || value.trim() === '',
    );

    expect(empty).toEqual([]);
  });
});

describe('themeBootScript', () => {
  const run = (script: string) => new Function(script)();

  beforeEach(() => {
    document.documentElement.removeAttribute('data-hanui-theme');
    localStorage.clear();
  });

  it('kayıtlı AÇIK seçimi `<html>`e yazar', () => {
    localStorage.setItem('theme', 'dark');
    run(themeBootScript({ storageKey: 'theme' }));

    expect(document.documentElement.getAttribute('data-hanui-theme')).toBe('dark');
  });

  it('kayıt yoksa ya da geçersizse öznitelik YAZMAZ — sistem tercihi izlenir', () => {
    run(themeBootScript({ storageKey: 'theme' }));
    expect(document.documentElement.hasAttribute('data-hanui-theme')).toBe(false);

    localStorage.setItem('theme', 'system');
    run(themeBootScript({ storageKey: 'theme' }));
    expect(document.documentElement.hasAttribute('data-hanui-theme')).toBe(false);
  });

  it('anahtar betiğe KAÇIŞLI girer — tırnak betiği kırmaz', () => {
    localStorage.setItem('a"b', 'light');

    expect(() => run(themeBootScript({ storageKey: 'a"b' }))).not.toThrow();
    expect(document.documentElement.getAttribute('data-hanui-theme')).toBe('light');
  });
});
