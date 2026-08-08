'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VirtualRange } from '@/types/hook.type';

/**
 * Ölçüm gelmediğinde varsayılan satır yüksekliği.
 *
 * ⚠ `constants/combobox.constants.ts` içindeki `OPTION_HEIGHT` ile aynı sayı ama
 * AYNI ŞEY DEĞİL: bu jenerik bir varsayılan, o bir bileşenin ölçüsü ve
 * `Combobox` zaten kendi değerini geçiyor. Katlamak, seçim kutusunun satır
 * yüksekliğini değiştiren birinin her sanal listeyi değiştirmesi olurdu.
 */
const DEFAULT_ROW_HEIGHT = 40;

/** Görünen pencerenin altında ve üstünde fazladan çizilen satır. */
const DEFAULT_OVERSCAN = 6;

/** SANALLAŞTIRMA — yalnızca görünen satırları çiz. */
const useVirtualList = (
  count: number,
  { rowHeight = DEFAULT_ROW_HEIGHT, overscan = DEFAULT_OVERSCAN, isEnabled = true } = {},
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

    /* KAPALIYKEN VE OLCUM YOKKEN TAM LISTE. */
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

    /* DEGISMEDIYSE AYNI NESNE geri verilir. */
    setRange(prev =>
      prev.start === next.start &&
      prev.end === next.end &&
      prev.totalHeight === next.totalHeight &&
      prev.offset === next.offset
        ? prev
        : next,
    );
  }, [count, isEnabled, overscan, rowHeight]);

  /* OLCUM HER BOYAMADAN SONRA — BAGIMLILIK LISTESI YOK */
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

  /** Verilen dizini görünür alana getirir. */
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
