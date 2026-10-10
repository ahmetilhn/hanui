'use client';

import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

/** Ölçüm gelmeden (sunucu, ilk kare) kullanılan genişlik: grafik boş bir kutu değil, makul bir şekil çizer. */
const FALLBACK_WIDTH = 640;

/** `useLayoutEffect` sunucuda uyarı basar; orada etkisiz bir eşdeğer. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? () => {} : useLayoutEffect;

/**
 * Kapsayıcının genişliği — `ResizeObserver` ile, BOYAMADAN ÖNCE ölçülür (ilk karede yanlış boyutta
 * çizilip zıplamasın). `fixed` verilirse ölçüm yapılmaz.
 */
const useChartWidth = (fixed?: number): [RefObject<HTMLDivElement | null>, number] => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fixed ?? FALLBACK_WIDTH);

  useIsomorphicLayoutEffect(() => {
    if (fixed !== undefined) {
      setWidth(fixed);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const measure = (next: number) => {
      /* Kesirli genişlik her alt piksel değişiminde yeniden çizdiriyordu. */
      const rounded = Math.floor(next);
      if (rounded > 0) setWidth(current => (current === rounded ? current : rounded));
    };

    measure(node.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, [fixed]);

  return [ref, width];
};

export default useChartWidth;
