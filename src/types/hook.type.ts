import type { KeyboardEvent, RefObject } from 'react';

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

/** Duyurunun aciliyeti. */
export type AnnouncePoliteness = 'polite' | 'assertive';

export type ListboxNavigation<T extends HTMLElement = HTMLElement> = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  /** Etkin seçeneği görünür alanda tutmak için LİSTEYE bağlanır. */
  listRef: RefObject<T | null>;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

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
