'use client';

import { useEffect, useRef } from 'react';

/**
 * Arama terimini geciktirip DIŞARI bildirir — her tuşta istek atmamak için.
 *
 * ⚠ `onSearch` bağımlılık listesine KONULAMAZ: çağıran taraf her render'da yeni
 * bir kapanış verebilir ve bağımlılığa konduğunda etki sonsuz döngüye girer.
 * Referansta tutulup etkiden çıkarılır; okunan değer her zaman en günceli.
 *
 * @param term Ham arama terimi. Kırpılmış hâli bildirilir.
 * @param isActive Panel açık mı. Kapalıyken istek atılmaz.
 * @param onSearch Yoksa kanca hiçbir şey yapmaz (yerel süzme yürürlüktedir).
 * @param delayMs Tuş vuruşları arasında beklenen süre.
 */
const useAsyncSearch = (
  term: string,
  isActive: boolean,
  onSearch: ((term: string) => void) | undefined,
  delayMs: number,
): void => {
  const searchRef = useRef(onSearch);
  searchRef.current = onSearch;

  useEffect(() => {
    if (!isActive || !searchRef.current) return;

    const timer = window.setTimeout(() => searchRef.current?.(term.trim()), delayMs);
    return () => window.clearTimeout(timer);
  }, [term, isActive, delayMs]);
};

export default useAsyncSearch;
