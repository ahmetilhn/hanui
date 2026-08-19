'use client';

import { useEffect } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

import { POPOVER_RESET, resolvePortalTarget, showTopLayer } from '../helpers/portal.helper';

/** Portallanan yüzeye yayılacak nitelik + stil parçaları. */
export type PortalSurface = {
  /** `null` iken yüzey ÇİZİLMEZ: hedef yalnızca açıkken ve istemcide çözülür. */
  container: HTMLElement | null;
  /** Üst katman gerekiyorsa `popover="manual"`; gerekmiyorsa boş. */
  attributes: { popover?: 'manual' };
  /** UA'nın `inset: 0` + `margin: auto` çiftini geri alan sıfırlama. */
  style: typeof POPOVER_RESET | Record<string, never>;
};

const NO_ATTRIBUTES: { popover?: 'manual' } = {};
const NO_STYLE: Record<string, never> = {};

/**
 * ANKRAJLI YÜZEYİN PORTAL SÖZLEŞMESİ — `Menu`, `Popover`, `Tooltip`,
 * `Combobox` ve `Select` için TEK kaynak.
 *
 * ⚠ `position: fixed` TEK BAŞINA "viewport'a göre konumlan" demek DEĞİL.
 * `none` olmayan bir `transform`/`translate`/`scale`/`rotate`, bir `filter`,
 * `backdrop-filter`, `perspective`, `will-change` ya da `contain: paint|layout`
 * taşıyan HER ata sabit konumlu torunları için **kapsayıcı blok** yaratır.
 * `usePositioning` viewport koordinatı üretiyor; kapsayıcı blok kayınca o
 * koordinatlar atanın sol üstüne göre yorumlanır ve yüzey atanın sayfa
 * içindeki konumu kadar kayar. Aynı ata `overflow: hidden` de taşıyorsa yüzey
 * ayrıca KIRPILIR.
 *
 * Yüzeyi tetikleyicinin yanından koparıp `document.body`e (ya da içinde
 * bulunduğu açık `<dialog>`a) portallamak bu zinciri tümüyle keser: yüzeyin
 * atası artık uygulamanın düzen ağacı değil.
 *
 * ⚠ Bu kancanın varlık sebebi DRY. Aynı altı satır `Menu`, `Popover` ve
 * `Tooltip`ta birebir tekrarlanıyordu; `Combobox`/`Select`e dördüncü ve beşinci
 * kopya olarak yazmak yerine tek yere alındı. Kopya kalsaydı ayrışması
 * ölçülebilir bir arıza üretirdi: `POPOVER_RESET`i unutan bir kopyada yüzey
 * ORTALANIR (gerekçe `helpers/portal.helper.ts`).
 *
 * Hedef seçimi ve üst katman kararı `helpers/portal.helper.ts`te; ölçülen dört
 * senaryo da orada.
 */
const usePortalSurface = (
  isOpen: boolean,
  anchorRef: { current: HTMLElement | null },
  surfaceRef: { current: HTMLElement | null },
): PortalSurface => {
  /*
   * Hedef HER RENDER'DA degil, yalnizca acikken cozulur. `closest` ucuzdur ama
   * tetikleyicinin DOM konumu acilistan sonra degismedigi icin tekrar
   * hesaplamanin da anlami yok — kapaliyken `null`.
   */
  const target = isOpen && isClient() ? resolvePortalTarget(anchorRef.current) : null;
  const needsTopLayer = target?.needsTopLayer ?? false;

  /*
   * ⚠ `popover` niteligi TEK BASINA yetmez: eleman `showPopover()` cagrilana
   * kadar `display: none` kalir. Cagri yuzey MONTE EDILDIKTEN sonra olmali,
   * bu yuzden `useEffect` — render sirasinda ref henuz dolu degil.
   */
  useEffect(() => {
    if (!isOpen || !needsTopLayer) return;
    return showTopLayer(surfaceRef.current);
  }, [isOpen, needsTopLayer, surfaceRef]);

  return {
    container: target?.container ?? null,
    attributes: needsTopLayer ? { popover: 'manual' } : NO_ATTRIBUTES,
    style: needsTopLayer ? POPOVER_RESET : NO_STYLE,
  };
};

export default usePortalSurface;
