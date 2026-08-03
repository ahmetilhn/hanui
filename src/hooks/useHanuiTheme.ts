'use client';

import { useCallback, useEffect, useState } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

import { THEME_ATTRIBUTE, THEME_SWITCHING_CLASS } from '../helpers/theme.helper';
import type { HanuiColorPreference, HanuiColorScheme } from '../theme/tokens';

/** Sistem tercihini okur. Betik hiç çalışmamışsa ilk değer buradan gelir. */
const readSystemScheme = (): HanuiColorScheme =>
  isClient() && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

/**
 * `<html>` üzerindeki AÇIK seçim; öznitelik yoksa `system`.
 *
 * <p>Özniteliğin yokluğu bir eksiklik değil bir DEĞER: "sistemi izle".
 */
const readPreference = (): HanuiColorPreference => {
  if (!isClient()) return 'system';

  const attribute = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return attribute === 'dark' || attribute === 'light' ? attribute : 'system';
};

type ThemeState = {
  /**
   * ÇÖZÜLMÜŞ tema — ekranda çizili olan. `preference` `system` iken bu alan
   * işletim sisteminin o anki tercihini taşır.
   */
  scheme: HanuiColorScheme;
  /**
   * Kullanıcının SEÇİMİ. Üç durumlu bir tema anahtarı (Açık / Koyu / Sistem)
   * bunu okur; `scheme` okunsaydı "Sistem" seçiliyken düğme "Koyu"yu işaretli
   * gösterirdi.
   */
  preference: HanuiColorPreference;
  /** `'system'` verildiğinde AÇIK seçim silinir ve sistem tercihi izlenir. */
  setScheme: (preference: HanuiColorPreference) => void;
  /** Açık ↔ koyu. `system` iken ÇÖZÜLMÜŞ değerin tersine geçer. */
  toggle: () => void;
  /**
   * Sunucu çıktısında ve hidrasyondan önceki ilk karede `false`.
   *
   * <p>Tema anahtarı bunu bekler: sunucu hangi temanın seçili olduğunu
   * bilmiyor ve bir tahminle çizilen anahtar, doğru tahmin edilse bile
   * hidrasyonda uyuşmazlık üretiyordu. Anahtar hazır olana kadar
   * `aria-hidden` bir yer tutucu çizilir.
   */
  isReady: boolean;
};

/**
 * Açık/koyu seçimini okur ve değiştirir.
 *
 * <h3>KALICILIK BU KANCANIN İŞİ DEĞİL</h3>
 * Seçimi nereye yazacağı tüketicinin kararı: `localStorage`, bir çerez (SSR'da
 * okunabilmesi için), kullanıcı profili. Kütüphane `localStorage`a yazsaydı
 * sunucu tarafı onu okuyamayacağı için ilk boyama yine yanlış temada
 * olurdu — ve tüketici kendi çerezini kullanmak istediğinde iki kaynak
 * çatışırdı.
 *
 * <h3>Geçiş tek karede kapatılır</h3>
 * Şema değişirken `<html>` bir kare boyunca `hanui-theme-switching` sınıfını
 * taşır. Sınıfsız hâlde her yüzey aynı anda ama FARKLI sürelerde animasyon
 * yapıyordu (kart gölgesi 140 ms, sayfa zemini 200 ms) ve geçiş dalgalı
 * görünüyordu. Ani geçiş, dalgalı geçişten iyi.
 *
 * @example
 * const { scheme, toggle, isReady } = useHanuiTheme();
 *
 * useEffect(() => {
 *   if (isReady) localStorage.setItem('theme', scheme);
 * }, [scheme, isReady]);
 */
const useHanuiTheme = (): ThemeState => {
  /*
   * Ilk deger SABIT 'light': sunucuda `document` yok ve istemcideki gercek
   * degeri ilk render'da okumak hidrasyon uyusmazligi uretiyordu (sunucu
   * "light" cizdi, istemci "dark" okudu). Gercek deger monte olduktan sonra
   * yaziliyor ve `isReady` o ana kadar false kaliyor.
   */
  const [preference, setPreferenceState] = useState<HanuiColorPreference>('light');
  const [systemScheme, setSystemScheme] = useState<HanuiColorScheme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setPreferenceState(readPreference());
    setSystemScheme(readSystemScheme());
    setIsReady(true);
  }, []);

  /*
   * Sistem tercihi HER ZAMAN izlenir, `preference` ne olursa olsun.
   *
   * Once dinleyici `preference === 'system'` iken yaziyordu ve kullanici
   * "Koyu"dan "Sistem"e dondugunde elde guncel bir sistem degeri yoktu: kanca
   * ilk montajdaki degeri hatirliyor, aradaki degisimi kacirmis oluyordu.
   * Olcum ucuz (tek bir medya sorgusu dinleyicisi); karar ise cozumleme
   * sirasinda veriliyor.
   */
  useEffect(() => {
    if (!isClient() || !window.matchMedia) return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemScheme(readSystemScheme());

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const scheme: HanuiColorScheme = preference === 'system' ? systemScheme : preference;

  const setScheme = useCallback((next: HanuiColorPreference) => {
    if (!isClient()) return;

    const root = document.documentElement;

    root.classList.add(THEME_SWITCHING_CLASS);

    /* `system` bir DEGER degil, degerin YOKLUGU: oznitelik silinir ve
       `_tokens.generated.scss` icindeki `:not([data-hanui-theme])` sorgusu
       devreye girer. `data-hanui-theme="system"` yazilsaydi o sorgu eslesmez
       ve sayfa acik temada kalirdi. */
    if (next === 'system') root.removeAttribute(THEME_ATTRIBUTE);
    else root.setAttribute(THEME_ATTRIBUTE, next);

    setPreferenceState(next);

    /*
     * Sinif BIR SONRAKI karede kaldirilir. Ayni karede kaldirilsaydi tarayici
     * hicbir zaman gecissiz bir boyama yapmayacak ve sinifin varligi hicbir
     * ise yaramayacakti.
     */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove(THEME_SWITCHING_CLASS));
    });
  }, []);

  const toggle = useCallback(
    () => setScheme(scheme === 'dark' ? 'light' : 'dark'),
    [scheme, setScheme],
  );

  return { scheme, preference, setScheme, toggle, isReady };
};

export default useHanuiTheme;
