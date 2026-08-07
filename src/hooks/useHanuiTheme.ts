'use client';

import { useCallback, useEffect, useState } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

import { THEME_ATTRIBUTE, THEME_SWITCHING_CLASS } from '../helpers/theme.helper';
import type { HanuiColorPreference, HanuiColorScheme, HanuiThemeState } from '@/types/theme.type';

/** Sistem tercihini okur. Betik hiç çalışmamışsa ilk değer buradan gelir. */
const readSystemScheme = (): HanuiColorScheme =>
  isClient() && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

/** `<html>` üzerindeki AÇIK seçim; öznitelik yoksa `system`. */
const readPreference = (): HanuiColorPreference => {
  if (!isClient()) return 'system';

  const attribute = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return attribute === 'dark' || attribute === 'light' ? attribute : 'system';
};

/**
 * Açık/koyu seçimini okur ve değiştirir.
 *
 * @example
 * const { scheme, toggle, isReady } = useHanuiTheme();
 */
const useHanuiTheme = (): HanuiThemeState => {
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

  /* Sistem tercihi HER ZAMAN izlenir, `preference` ne olursa olsun. */
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
