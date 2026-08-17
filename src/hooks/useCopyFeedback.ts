'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

/** "Kopyalandı" geri bildiriminin ekranda kalma süresi (ms). */
const COPIED_FEEDBACK_MS = 1600;

type CopyFeedback = {
  isCopied: boolean;
  copy: () => Promise<void>;
  /** Değeri taşıyan düğüme bağlanır; pano izni yoksa içerik seçili bırakılır. */
  nodeRef: RefObject<HTMLSpanElement | null>;
};

/**
 * Pano kopyalama + zamanlı geri bildirim — `CopyField` ile `CodeBadge`in
 * ORTAK çekirdeği. İki bileşen bu davranışı ayrı ayrı taşısaydı zaman aşımı,
 * temizlik ve pano-izni geri düşüşü sessizce ayrışabilirdi.
 */
export const useCopyFeedback = (value: string): CopyFeedback => {
  const [isCopied, setIsCopied] = useState(false);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // Bilesen sokulurse zamanlayici da gitmeli; aksi halde React "unmounted
  // component" uyarisi veriyor.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const selectValue = useCallback(() => {
    const node = nodeRef.current;
    if (!node) return;

    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      timerRef.current = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Pano yoksa/izin verilmediyse en azindan secili birakilir.
      selectValue();
    }
  }, [value, selectValue]);

  return { isCopied, copy, nodeRef };
};
