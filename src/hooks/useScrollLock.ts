'use client';

import { useEffect } from 'react';

/**
 * SAYFA KAYDIRMA KİLİDİ — sayaçlı, tek yerde.
 *
 * <h3>Neden bir kanca, neden bileşenin içinde iki satır değil</h3>
 * `Modal` ve `BottomSheet` kilidi kendi başlarına yazıyordu:
 *
 * <pre>
 * const previous = document.body.style.overflow;
 * document.body.style.overflow = 'hidden';
 * return () => { document.body.style.overflow = previous; };
 * </pre>
 *
 * <p>Tek pencerede doğru; İÇ İÇE iki pencerede değil. `Select` bir kip
 * pencerenin içinde açıldığında (`Modal` → `BottomSheet`) sıra şu:
 * dış pencere `''` kaydeder ve `hidden` yazar; iç panel `'hidden'` kaydeder ve
 * `hidden` yazar; iç panel kapanınca kaydettiği `'hidden'`i geri yazar — buraya
 * kadar tesadüfen doğru. Ama React sökme sırası her zaman bu değil: iki panel
 * aynı commit'te kapandığında DIŞ pencerenin temizliği önce koşabiliyor ve
 * `''` yazıyor; iç panel hâlâ açıkken kilit AÇILIYOR ve kullanıcı panelin
 * arkasındaki listeyi kaydırıyordu.
 *
 * <p>Sayaç bunu yapısal olarak imkânsız kılıyor: kilit ilk açılışta yazılır,
 * SON kapanışta kaldırılır, arada kim ne yaparsa yapsın.
 *
 * <h3>Kaydırma çubuğu ve yatay sıçrama</h3>
 * `overflow: hidden` kaydırma çubuğunu da götürüyor ve sayfa o çubuğun
 * genişliği kadar (macOS dışında ~15 px) YATAY OLARAK SIÇRIYOR: pencere
 * açılınca arkadaki bütün içerik sağa kayıyor, kapanınca geri geliyordu.
 * `scrollbar-gutter: stable` çubuğun yerini kalıcı olarak ayırıyor —
 * desteklemeyen tarayıcıda ölçülen genişlik dolgu olarak yazılıyor.
 *
 * <h3>iOS</h3>
 * Safari'de `overflow: hidden` gövdeyi durdurmaya YETMİYOR: dokunmatik
 * kaydırma arkadaki belgeye sızıyor ("scroll chaining"). Gövde
 * `position: fixed` ile sabitlenir ve kaydırma konumu `top` ile korunur;
 * kilit kalkarken tam olarak aynı yere geri dönülür — korunmasaydı pencere
 * kapandığında kullanıcı sayfanın başına düşerdi.
 *
 * @param isLocked Kilit bu örnek için etkin mi.
 */

/* Kac tane acik panel var. Modul duzeyinde: kilit BELGENIN durumu, bir React
   agacinin degil. */
let lockCount = 0;

/** Kilit yazılmadan önceki hâl — SON kapanışta buradan geri yüklenir. */
let previous: {
  overflow: string;
  position: string;
  top: string;
  width: string;
  paddingRight: string;
  scrollY: number;
} | null = null;

/** iOS Safari mi? Gövdeyi sabitleme bedeli yalnızca orada ödenir. */
const isIOS = (): boolean =>
  /iP(hone|ad|od)/.test(navigator.platform) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const lock = (): void => {
  lockCount += 1;
  if (lockCount > 1) return;

  const { body, style: rootStyle } = { body: document.body, style: document.documentElement.style };
  const scrollY = window.scrollY;

  previous = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
    scrollY,
  };

  /*
   * Cubugun genisligi: `scrollbar-gutter` desteklenmiyorsa dolgu olarak
   * yazilir. Destekleniyorsa olcum 0 cikar ve dolgu yazilmaz.
   */
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

  rootStyle.setProperty('scrollbar-gutter', 'stable');
  body.style.overflow = 'hidden';

  if (isIOS()) {
    body.style.position = 'fixed';
    body.style.top = `${-scrollY}px`;
    body.style.width = '100%';
  }
};

const unlock = (): void => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !previous) return;

  const { body } = document;
  const { scrollY } = previous;

  body.style.overflow = previous.overflow;
  body.style.position = previous.position;
  body.style.top = previous.top;
  body.style.width = previous.width;
  body.style.paddingRight = previous.paddingRight;
  document.documentElement.style.removeProperty('scrollbar-gutter');

  previous = null;

  /* Govde sabitlenmisken kaydirma konumu sifirlaniyor; geri yazilmazsa
     kullanici pencereyi kapattiginda sayfanin en basina duser. */
  window.scrollTo(0, scrollY);
};

const useScrollLock = (isLocked = true): void => {
  useEffect(() => {
    if (!isLocked) return;

    lock();
    return unlock;
  }, [isLocked]);
};

export default useScrollLock;
