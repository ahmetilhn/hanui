'use client';

import { useEffect } from 'react';

import { isTopModal, pushModal } from '../helpers/focus.helper';

/**
 * `Escape` ile kapanma — dinleyici BELGE düzeyinde.
 * ⚠ YÜZEY YIĞINA KATILIR ve tuşu YALNIZCA EN ÜSTTEKİ tüketir.
 * ⚠ Kipsel yüzeyler (`Modal`, `Drawer`, `BottomSheet`) bu kancayı KULLANMAZ: onlar yerel `<dialog>`
 * üzerinden `cancel` olayını işler.
 * @param isActive Yüzey açık mı.
 * @param onDismiss Kapatma.
 */
const useDismissOnEscape = (isActive: boolean, onDismiss: () => void): void => {
  useEffect(() => {
    if (!isActive) return;

    const { token, pop } = pushModal();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      /* Yığının en üstünde değilsek tuş bizim değil. */
      if (!isTopModal(token)) return;
      onDismiss();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      pop();
    };
  }, [isActive, onDismiss]);
};

export default useDismissOnEscape;
