import { DENSITY_ATTRIBUTE, THEME_ATTRIBUTE, THEME_STYLE_ID } from '../../helpers/theme.helper';
import initHanui from '../initHanui';

/**
 * React ağacının DIŞINDAN yapılandırma.
 *
 * <p>Bu fonksiyonun tek varlık sebebi ZAMANLAMA: `HanuiProvider` ağaç monte
 * olduktan sonra yazıyor ve koyu tema seçmiş bir kullanıcı o ana kadar beyaz
 * ekran görüyor. `<head>` içindeki satır içi bir betikten çağrıldığında ezmeler
 * ilk boyamadan önce yerinde olur. Test o sözleşmeyi kilitliyor: çağrı, tek bir
 * `<style>` etiketi ve isteğe bağlı olarak `<html>` özniteliği bırakır — başka
 * hiçbir şeye dokunmaz.
 */
describe('initHanui', () => {
  beforeEach(() => {
    document.getElementById(THEME_STYLE_ID)?.remove();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    document.documentElement.removeAttribute(DENSITY_ATTRIBUTE);
  });

  it('yapılandırmasız çağrı hiçbir şey bırakmaz', () => {
    initHanui();

    expect(document.getElementById(THEME_STYLE_ID)).toBeNull();
    expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it('ezmeleri tek bir `<style>` etiketine yazar', () => {
    initHanui({ theme: { light: { blue: '#0d6efd' } } });

    const style = document.getElementById(THEME_STYLE_ID);

    expect(style?.textContent).toContain('--hanui-blue: #0d6efd;');
  });

  /*
   * Her cagrida yeni bir etiket eklemek, birbirini ezen onlarca blok
   * birakiyordu; ustelik son cagrinin kazandigi CSS sirasina bagli kaliyordu.
   */
  it('ikinci çağrı AYNI etiketi yeniden kullanır', () => {
    initHanui({ theme: { light: { blue: '#0d6efd' } } });
    initHanui({ theme: { light: { blue: '#123456' } } });

    expect(document.querySelectorAll(`#${THEME_STYLE_ID}`)).toHaveLength(1);
    expect(document.getElementById(THEME_STYLE_ID)?.textContent).toContain('#123456');
  });

  it('boş yapılandırma etiketi KALDIRIR — bayat ezme kalmaz', () => {
    initHanui({ theme: { light: { blue: '#0d6efd' } } });
    initHanui({ theme: {} });

    expect(document.getElementById(THEME_STYLE_ID)).toBeNull();
  });

  /*
   * OLCU EZMESI BELGEYE GERCEKTEN INIYOR MU.
   *
   * `buildThemeCss` ayrica test ediliyor ama o yalnizca METIN uretiyor; bu
   * test zinciri sonuna kadar izliyor: cagri → `<style>` etiketi → belge.
   * Aradaki `applyThemeConfig` yolu kopsaydi CSS dogru uretilir ve hicbir
   * yere yazilmazdi.
   */
  it('ölçü ezmesi belgeye yazılır', () => {
    initHanui({ theme: { metrics: { 'radius-md': '2px' } } });

    expect(document.getElementById(THEME_STYLE_ID)?.textContent).toContain(
      '--hanui-radius-md: 2px;',
    );
  });

  it('`density` özniteliği yazar', () => {
    initHanui({ density: 'compact' });

    expect(document.documentElement.getAttribute(DENSITY_ATTRIBUTE)).toBe('compact');
  });

  it('`density` verilmezse mevcut seçim KORUNUR', () => {
    document.documentElement.setAttribute(DENSITY_ATTRIBUTE, 'compact');

    initHanui({ colorScheme: 'dark' });

    expect(document.documentElement.getAttribute(DENSITY_ATTRIBUTE)).toBe('compact');
  });

  it('`colorScheme` özniteliği yazar', () => {
    initHanui({ colorScheme: 'dark' });

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('`colorScheme` verilmezse mevcut seçim KORUNUR', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');

    initHanui({ theme: { light: { blue: '#0d6efd' } } });

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });
});
