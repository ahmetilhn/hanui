import { buildThemeCss, resolveTokens, THEME_ATTRIBUTE } from '../theme.helper';
import { DARK_THEME, LIGHT_THEME } from '../../theme/tokens';

describe('buildThemeCss', () => {
  it('yapılandırma boşken hiç kural üretmez', () => {
    expect(buildThemeCss({})).toBe('');
    expect(buildThemeCss({ light: {}, dark: {} })).toBe('');
  });

  it('yalnızca EZİLEN token yazılır, tam eşleme değil', () => {
    const css = buildThemeCss({ light: { blue: '#0d6efd' } });

    expect(css).toContain('--hanui-blue: #0d6efd');
    /*
     * Tam eslemeyi yazmak da calisirdi ama kutuphane bir sonraki surumde bir
     * token'in varsayilanini degistirdiginde tuketicinin sayfasi ESKI degeri
     * yazmaya devam ederdi — ustelik ezmedigi bir token icin.
     */
    expect(css).not.toContain('--hanui-surface:');
    expect(css).not.toContain('--hanui-text:');
  });

  it('açık tema ezmesi HEM `:root` HEM açık seçim seçicisine yazılır', () => {
    const css = buildThemeCss({ light: { blue: '#0d6efd' } });

    /*
     * Yalnizca `:root` yazilsaydi, sistem tercihi koyu olan bir cihazda acik
     * temayi ELLE secen kullanicida ezme dusuyordu: uretilmis koyu blok
     * `[data-hanui-theme='light']` ile yarisip ozgullukte kazaniyordu.
     */
    expect(css).toMatch(/:root\s*\{[^}]*--hanui-blue: #0d6efd/);
    expect(css).toContain(`:root[${THEME_ATTRIBUTE}='light']`);
  });

  it('koyu tema ezmesi sistem tercihi yedeğine de iner', () => {
    const css = buildThemeCss({ dark: { blue: '#6ea8fe' } });

    expect(css).toContain(`:root[${THEME_ATTRIBUTE}='dark']`);
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    /* Kullanicinin ACIK bir secimi varsa sistem tercihi onu ezmemeli. */
    expect(css).toContain(`:root:not([${THEME_ATTRIBUTE}])`);
  });

  it('font ezmesi tema seçiminden bağımsız `:root`a yazılır', () => {
    const css = buildThemeCss({ fonts: { heading: 'Archivo, sans-serif' } });

    expect(css).toContain('--hanui-font-heading: Archivo, sans-serif');
    expect(css).not.toContain(THEME_ATTRIBUTE);
  });
});

describe('resolveTokens', () => {
  it('ezilmeyen her token varsayılanında kalır', () => {
    const resolved = resolveTokens('light', { light: { blue: '#0d6efd' } });

    expect(resolved.blue).toBe('#0d6efd');
    expect(resolved.surface).toBe(LIGHT_THEME.surface);
    expect(resolved.text).toBe(LIGHT_THEME.text);
  });

  it('koyu şema koyu varsayılanlardan türer', () => {
    expect(resolveTokens('dark').page).toBe(DARK_THEME.page);
    expect(resolveTokens('dark').page).not.toBe(LIGHT_THEME.page);
  });

  it('açık ezmesi koyu şemaya SIZMAZ', () => {
    const config = { light: { blue: '#0d6efd' } };

    expect(resolveTokens('dark', config).blue).toBe(DARK_THEME.blue);
  });
});

describe('token sözleşmesi', () => {
  /*
   * Bir token yalnizca bir temada tanimlandiginda o temada renk DUSUYOR ve
   * hata sessiz: bilesen `var(--hanui-yok)` okuyup rengini kaybediyor, derleme
   * yesil donuyor.
   */
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
