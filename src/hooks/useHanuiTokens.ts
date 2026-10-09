'use client';

import { useEffect, useState } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

import { THEME_ATTRIBUTE, THEME_STYLE_ID, TOKEN_PREFIX } from '../helpers/theme.helper';
import type { HanuiToken } from '@/types/theme.type';

/** Sunucuda ve ilk karede dönen değer: çizim kütüphaneleri boş dizeyi siyah boyuyor. */
const FALLBACK = 'currentColor';

const read = <TName extends HanuiToken>(names: readonly TName[]): Record<TName, string> => {
  const style = getComputedStyle(document.documentElement);

  return Object.fromEntries(
    names.map(name => [name, style.getPropertyValue(`${TOKEN_PREFIX}${name}`).trim() || FALLBACK]),
  ) as Record<TName, string>;
};

const isSame = (first: Record<string, string>, second: Record<string, string>): boolean =>
  Object.keys(first).every(key => first[key] === second[key]);

/**
 * Token'ların ÇÖZÜLMÜŞ değerleri — CSS değişkeni okuyamayan çizim kütüphaneleri için (recharts
 * `stroke`/`fill` prop'ları `var(--…)` kabul etmiyor).
 * Tema değiştiğinde (açık seçim, sistem tercihi, `initHanui` ezmesi) yeniden çizer.
 * ⚠ Sunucu çıktısında ve hidrasyondan önceki ilk karede her değer `currentColor`.
 * @example const colors = useHanuiTokens(['series-1', 'series-2', 'border']);
 */
const useHanuiTokens = <TName extends HanuiToken>(
  names: readonly TName[],
): Record<TName, string> => {
  /* Dizi her render'da yeni nesne olabilir; abonelik ADLARA bağlanır, kimliğe değil. */
  const key = names.join('|');

  const [values, setValues] = useState(
    () => Object.fromEntries(names.map(name => [name, FALLBACK])) as Record<TName, string>,
  );

  useEffect(() => {
    if (!isClient()) return;

    const list = key.split('|') as TName[];
    const update = () =>
      setValues(previous => {
        const next = read(list);
        return isSame(previous, next) && Object.keys(previous).length === list.length
          ? previous
          : next;
      });

    update();

    /* Açık seçim ve satır içi ezme `<html>`de; `initHanui` ezmesi `<head>`deki tek `<style>`da. */
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE, 'style'],
    });
    observer.observe(document.head, { childList: true });

    const overrides = document.getElementById(THEME_STYLE_ID);
    if (overrides)
      observer.observe(overrides, { characterData: true, childList: true, subtree: true });

    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    query?.addEventListener('change', update);

    return () => {
      observer.disconnect();
      query?.removeEventListener('change', update);
    };
  }, [key]);

  return values;
};

export default useHanuiTokens;
