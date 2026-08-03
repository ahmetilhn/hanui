import { act, renderHook } from '@testing-library/react';

import useScrollLock from '../useScrollLock';

/**
 * KAYDIRMA KİLİDİ — sayacın nöbetçisi.
 *
 * <p>Bu kancanın tek varlık sebebi İÇ İÇE panellerde doğru davranmak.
 * `Modal` ve `BottomSheet` kilidi kendi başlarına yazarken tek pencerede
 * doğru çalışıyor, iki pencerede bozuluyordu: dış pencerenin temizliği önce
 * koşabiliyor ve iç panel hâlâ açıkken kilidi AÇIYORDU — kullanıcı panelin
 * arkasındaki listeyi kaydırıyordu.
 *
 * <p>Aşağıdaki "iki panel" testi, korumalar kaldırıldığında gerçekten kırılan
 * test.
 */
describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.documentElement.style.removeProperty('scrollbar-gutter');
  });

  it('kilitler ve sökülünce ÖNCEKİ değere döner', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useScrollLock());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => unmount());
    expect(document.body.style.overflow).toBe('auto');
  });

  it('`isLocked: false` iken hiçbir şeye dokunmaz', () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  /*
   * SAYACIN ISI. Ic panel kapaninca kilit ACILMAMALI; disaridaki panel hala
   * acik ve arkasindaki liste kaydirilabilir hale geliyordu.
   */
  it('iç içe iki panelde kilit SON kapanışta açılır', () => {
    const outer = renderHook(() => useScrollLock());
    const inner = renderHook(() => useScrollLock());

    expect(document.body.style.overflow).toBe('hidden');

    act(() => inner.unmount());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => outer.unmount());
    expect(document.body.style.overflow).toBe('');
  });

  /*
   * Sokum SIRASI garantili degil: iki panel ayni commit'te kapandiginda DIS
   * pencerenin temizligi once kosabiliyor. Sayac sira duyarsiz olmali.
   */
  it('sökme sırası TERS olduğunda da kilit erken açılmaz', () => {
    const outer = renderHook(() => useScrollLock());
    const inner = renderHook(() => useScrollLock());

    act(() => outer.unmount());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => inner.unmount());
    expect(document.body.style.overflow).toBe('');
  });

  /*
   * `overflow: hidden` kaydirma cubugunu da goturuyor ve sayfa o cubugun
   * genisligi kadar YATAY OLARAK SIÇRIYOR. Kanca iki onlem aliyor:
   * `scrollbar-gutter: stable` ve — destegi olmayan tarayicida — olculen
   * genislik kadar dolgu.
   *
   * ÖLÇÜLEN SEY BURADA DOLGUNUN GERI ALINMASI. `scrollbar-gutter` jsdom'da
   * ONAYLANMIYOR (`setProperty` taninmayan ozelligi sessizce atiyor) ve
   * `innerWidth - clientWidth` her zaman 0: ikisini de test etmek jsdom'un
   * eksigini olcmek olurdu. Kanca bir dolgu YAZDIYSA onu geri almak zorunda
   * ve bunu dogrulamak icin onceki degeri bozmasi yeterli.
   */
  it('önceki satır içi dolgu kilit kalkınca geri gelir', () => {
    document.body.style.paddingRight = '4px';

    const { unmount } = renderHook(() => useScrollLock());
    act(() => unmount());

    expect(document.body.style.paddingRight).toBe('4px');
  });
});
