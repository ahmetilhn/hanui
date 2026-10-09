'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { STICK_TO_END_THRESHOLD } from '../constants/scroll.constants';
import type { StickToBottom } from '@/types/hook.type';

const distanceToEnd = (node: HTMLElement): number =>
  node.scrollHeight - node.scrollTop - node.clientHeight;

const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Kaydırma kutusunu SONA yapışık tutar — kullanıcı yukarı kaydırana kadar. Akan bir yanıt, canlı
 * terminal çıktısı, büyüyen akıl yürütme metni.
 * İçerik değişimini (`MutationObserver`: yeni satır, akan metin) ve kutunun kendi boyunu
 * (`ResizeObserver`: ekran klavyesi açılınca) izler; render'da yerleşim okumaz.
 * @param isEnabled `false` iken hiçbir şey izlenmez.
 * @example const { isAtEnd, scrollToEnd } = useStickToBottom(listRef);
 */
const useStickToBottom = (ref: RefObject<HTMLElement | null>, isEnabled = true): StickToBottom => {
  const isPinned = useRef(true);
  const [isAtEnd, setIsAtEnd] = useState(true);

  const stick = useCallback(() => {
    const node = ref.current;
    if (node && isPinned.current) node.scrollTop = node.scrollHeight;
  }, [ref]);

  useEffect(() => {
    const node = ref.current;
    if (!isEnabled || !node) return;

    const handleScroll = () => {
      const atEnd = distanceToEnd(node) < STICK_TO_END_THRESHOLD;
      isPinned.current = atEnd;
      setIsAtEnd(atEnd);
    };

    stick();
    node.addEventListener('scroll', handleScroll, { passive: true });

    const mutations = new MutationObserver(stick);
    mutations.observe(node, { childList: true, subtree: true, characterData: true });

    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(stick);
    resize?.observe(node);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      mutations.disconnect();
      resize?.disconnect();
    };
  }, [isEnabled, ref, stick]);

  /* "En yeniye in": yeniden yapışır. Azaltılmış harekette ANİ. */
  const scrollToEnd = useCallback(() => {
    const node = ref.current;
    if (!node) return;

    isPinned.current = true;
    setIsAtEnd(true);
    node.scrollTo({
      top: node.scrollHeight,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
  }, [ref]);

  return { isAtEnd, scrollToEnd };
};

export default useStickToBottom;
