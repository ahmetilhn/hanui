'use client';

import { type KeyboardEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type ListboxNavigationOptions = {
  /** Seçenek sayısı. Liste süzüldüğünde değişir. */
  count: number;
  isOpen: boolean;
  /** Açılışta etkin olacak dizin — genellikle seçili olan. */
  initialIndex?: number;
  /** `Enter` / `Space` ile seçildiğinde. */
  onSelect: (index: number) => void;
  onClose: () => void;
};

export type ListboxNavigation<T extends HTMLElement = HTMLElement> = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  /**
   * Etkin seçeneği görünür alanda tutmak için LİSTEYE bağlanır.
   *
   * <p>Tip parametresi çağıran taraf için: `Select` bu referansı `<ul>`e
   * veriyor ve panel açıldığında `focus()` çağırıyor. `HTMLElement`e sabitlense
   * çağıran ikinci bir referans tutmak ve ikisini elle eşlemek zorunda kalırdı.
   */
  listRef: RefObject<T | null>;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

/**
 * LISTBOX KLAVYE GEZİNMESİ — `Select` ve `Combobox`ın ortak modeli.
 *
 * <h3>Neden bir kanca</h3>
 * İki bileşen aynı klavye modelini <strong>kopya kod</strong> olarak
 * taşıyordu: `ArrowDown`/`ArrowUp` uçlarda dönme, `Home`/`End`, `Enter` ile
 * seçme, `Escape` ile kapatma, `Tab` ile kapatıp gezinmeye devam etme ve
 * etkin seçeneği görünür alanda tutma. Altı davranış, iki yerde. Kopya kod
 * ayrışmaya açık ve ayrışma sessiz: bir bileşende `Home` çalışıp diğerinde
 * çalışmadığında hiçbir test kırılmıyordu — ikisinin de kendi testi vardı ve
 * ikisi de kendi davranışını doğruluyordu.
 *
 * <p>Kanca yalnızca <strong>gezinmeyi</strong> taşıyor. Açılma kararı (panel
 * mi alt sayfa mı), filtreleme ve seçim sözleşmesi (`value`/`onChange`) hâlâ
 * bileşenlerin: ikisi orada gerçekten farklı ve tek bir kancaya toplamak
 * `Select`e hiç kullanmayacağı arama koduna taşıtırdı.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`ArrowDown` / `ArrowUp`</td><td>etkin seçenek; uçlarda DÖNER</td></tr>
 *   <tr><td>`Home` / `End`</td><td>ilk / son</td></tr>
 *   <tr><td>`Enter` / `Space`</td><td>etkin seçeneği seçer</td></tr>
 *   <tr><td>`Escape`</td><td>kapatır</td></tr>
 *   <tr><td>`Tab`</td><td>kapatır, gezinme SÜRER (`preventDefault` yok)</td></tr>
 * </table>
 *
 * <p>`Space` yalnızca `hasSpaceSelect` ile: `Combobox`ın arama kutusunda boşluk
 * bir KARAKTER ve onu seçime çevirmek "fren balatası" yazmayı imkânsız
 * kılıyordu.
 */
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
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
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
