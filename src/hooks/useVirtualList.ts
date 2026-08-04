'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VirtualRange = {
  /** Çizilecek ilk öğenin dizini. */
  start: number;
  /** Çizilecek son öğenin dizini (dahil DEĞİL). */
  end: number;
  /** Listenin gerçek toplam yüksekliği — kaydırma çubuğu doğru boyda olmalı. */
  totalHeight: number;
  /** Görünen ilk öğenin üstünde bırakılacak boşluk. */
  offset: number;
};

/**
 * SANALLAŞTIRMA — yalnızca görünen satırları çiz.
 *
 * <h3>Ölçülen sorun</h3>
 * 1121 markalı bir `Combobox` listesinde DOM 1121 satır taşıyordu. Panel
 * açılışı mobilde gözle görülür şekilde donuyor, her tuş vuruşunda liste
 * yeniden çiziliyordu. Ekran okuyucu tarafında da bedeli var: 1121 öğelik bir
 * `listbox`ta gezinmek pratikte imkânsız.
 *
 * <h3>Neden kütüphane içinde</h3>
 * `react-window` / `@tanstack/virtual` bu işi yapıyor ve iyi yapıyor; ama
 * paketin tek çalışma zamanı bağımlılığının ikon seti olması bilinçli bir
 * karar. Burada gereken şey o kütüphanelerin küçük bir alt kümesi: SABİT
 * yükseklikli satırlar, tek eksen, yatay yok, değişken yükseklik yok.
 *
 * <h3>SABİT satır yüksekliği — ve bu bir kısıt</h3>
 * Değişken yükseklikli sanallaştırma her satırın ölçülmesini ve bir konum
 * haritası tutulmasını gerektiriyor. Açılır liste satırları zaten sabit
 * yükseklikte (`min-height` + tek satır metin); ikincil satır taşıyan
 * seçeneklerde ölçü `rowHeight` ile verilir.
 *
 * <h3>`overscan` neden var</h3>
 * Yalnızca görünen satırlar çizilseydi hızlı kaydırmada alt kenarda bir kare
 * boyunca boşluk görünüyordu — tarayıcı kaydırma olayını boyamadan sonra
 * veriyor. Görünür alanın üstüne ve altına birkaç satır fazladan çizilir.
 *
 * <h3>Klavye gezinmesiyle ilişkisi</h3>
 * Etkin seçeneği görünür tutan `scrollIntoView`, o seçenek ÇİZİLMEMİŞSE
 * çalışmaz. `scrollToIndex` bu yüzden var: klavyeyle listenin dibine giden
 * kullanıcı için konum önce hesaplanır, satır sonra çizilir.
 */
const useVirtualList = (
  count: number,
  { rowHeight = 40, overscan = 6, isEnabled = true } = {},
) => {
  const scrollRef = useRef<HTMLElement | null>(null);
  const [range, setRange] = useState<VirtualRange>({
    start: 0,
    end: count,
    totalHeight: count * rowHeight,
    offset: 0,
  });

  const measure = useCallback(() => {
    const node = scrollRef.current;

    /*
     * KAPALIYKEN VE OLCUM YOKKEN TAM LISTE.
     *
     * Kutu daha olculmemisken (ilk kare, `display: none`) `clientHeight` 0
     * doner ve sifir satir cizilirdi: liste bir kare boyunca BOS gorunuyor,
     * ekran okuyucu da o karede "0 secenek" diyordu.
     */
    const next =
      !isEnabled || !node || node.clientHeight === 0
        ? { start: 0, end: count, totalHeight: count * rowHeight, offset: 0 }
        : (() => {
            const visibleCount = Math.ceil(node.clientHeight / rowHeight);
            const first = Math.floor(node.scrollTop / rowHeight);

            const start = Math.max(0, first - overscan);
            const end = Math.min(count, first + visibleCount + overscan);

            return { start, end, totalHeight: count * rowHeight, offset: start * rowHeight };
          })();

    /*
     * DEGISMEDIYSE AYNI NESNE geri verilir.
     *
     * Olcum her boyamadan sonra kosuyor (asagidaki bagimliliksiz etki) ve her
     * seferinde yeni bir nesne yazsaydi React'in cikis kapisi kapanir, olcum
     * kendi kendini tetikleyen sonsuz bir donguye donerdi.
     */
    setRange(prev =>
      prev.start === next.start &&
      prev.end === next.end &&
      prev.totalHeight === next.totalHeight &&
      prev.offset === next.offset
        ? prev
        : next,
    );
  }, [count, isEnabled, overscan, rowHeight]);

  /*
   * ═══ OLCUM HER BOYAMADAN SONRA — BAGIMLILIK LISTESI YOK ═══
   *
   * Kaydiran oge bir REF ve ref'e deger yazmak hicbir etkiyi tetiklemez:
   * liste ILK cizildiginde (acilir panel acildiginda) asagidaki etki
   * kosmuyordu, cunku `measure` kimligi degismemisti.
   *
   * Olculen kirilma: secenekler bilesen KURULDUKTAN SONRA geliyorsa
   * (arac secicisinde marka listesi bir istekten sonra iniyor, model listesi
   * marka secilince) baslangic araligi `end: 0` ile donuyor ve panel
   * acildiginda liste TAMAMEN BOS goruluyordu — yalnizca arama kutusu. Kutuya
   * bir harf yazmak seceneklerin sayisini degistirdigi icin liste o an
   * kendine geliyor, yani "arama yapmadan hicbir secenek yok" davranisi.
   *
   * Bedeli bir `clientHeight` okumasi; karsiliginda olcum, kaydiran ogenin ne
   * zaman baglandigini bilmek zorunda kalmiyor.
   */
  useEffect(measure);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    node.addEventListener('scroll', measure, { passive: true });

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);

    return () => {
      node.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [measure]);

  /**
   * Verilen dizini görünür alana getirir.
   *
   * <p>`scrollIntoView` çizilmemiş bir satırda çalışmıyor; klavyeyle listenin
   * dibine giden kullanıcı için konum önce hesaplanmak zorunda.
   */
  const scrollToIndex = useCallback(
    (index: number) => {
      const node = scrollRef.current;
      if (!node || !isEnabled) return;

      const top = index * rowHeight;
      const bottom = top + rowHeight;

      if (top < node.scrollTop) node.scrollTop = top;
      else if (bottom > node.scrollTop + node.clientHeight)
        node.scrollTop = bottom - node.clientHeight;
    },
    [isEnabled, rowHeight],
  );

  return { scrollRef, range, scrollToIndex, measure };
};

export default useVirtualList;
