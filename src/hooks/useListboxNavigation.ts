'use client';

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { scrollIntoViewIfPossible } from '../helpers/scroll.helper';
import type { ListboxNavigation, ListboxNavigationOptions } from '@/types/hook.type';

/*
 * Govde `types/hook.type.ts`e tasindi (kardesleri `VirtualRange`,
 * `AnnouncePoliteness`, `ListboxNavigationOptions` zaten oradaydi); tip
 * BURADAN da disa aciliyor cunku `src/index.ts` onu bu yoldan veriyor ve
 * yalnizca dosya yeri degisti diye bir surum kirilmasi olmamali. Ayni karar
 * `Combobox` tiplerinde de uygulandi.
 */
export type { ListboxNavigation } from '@/types/hook.type';

/** LISTBOX KLAVYE GEZİNMESİ — `Select` ve `Combobox`ın ortak modeli. */
const useListboxNavigation = <T extends HTMLElement = HTMLElement>(
  { count, isOpen, initialIndex = 0, onSelect, onClose }: ListboxNavigationOptions,
  { hasSpaceSelect = false } = {},
): ListboxNavigation<T> => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef<T | null>(null);

  /* Panel her acildiginda etkin secenek SECILI olandan baslar; kullanici
     listeyi bastan taramak zorunda kalmaz. */
  useEffect(() => {
    if (isOpen) setActiveIndex(initialIndex);
  }, [isOpen, initialIndex]);

  /*
   * Liste SUZULDUGUNDE etkin dizin listenin disinda kalabiliyor: uc secenek
   * gorunurken `activeIndex` 7'de kaldiginda `Enter` hicbir sey secmiyordu.
   */
  useEffect(() => {
    setActiveIndex(current => (current >= count ? Math.max(0, count - 1) : current));
  }, [count]);

  /* Etkin secenek gorunur alanin disina cikmamali. */
  useEffect(() => {
    if (!isOpen) return;
    scrollIntoViewIfPossible(listRef.current?.querySelector(`[data-index="${activeIndex}"]`), {
      block: 'nearest',
    });
  }, [activeIndex, isOpen, count]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const lastIndex = count - 1;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex(current => (current >= lastIndex ? 0 : current + 1));
          break;

        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex(current => (current <= 0 ? lastIndex : current - 1));
          break;

        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setActiveIndex(lastIndex);
          break;

        case ' ':
        case 'Enter': {
          /* Arama kutusunda BOSLUK bir KARAKTER: onu secime cevirmek "fren
             balatasi" yazmayi imkansiz kiliyordu. `Enter` her iki kipte de
             secer. */
          if (event.key === ' ' && !hasSpaceSelect) break;

          event.preventDefault();
          if (count > 0) onSelect(activeIndex);
          break;
        }

        case 'Escape':
          event.preventDefault();
          onClose();
          break;

        case 'Tab':
          /* Kapatir ama varsayilan gezinme SURER. */
          onClose();
          break;

        default:
          break;
      }
    },
    [activeIndex, count, hasSpaceSelect, onClose, onSelect],
  );

  return { activeIndex, setActiveIndex, listRef, handleKeyDown };
};

export default useListboxNavigation;
