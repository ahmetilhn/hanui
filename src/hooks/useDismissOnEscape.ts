'use client';

import { useEffect } from 'react';

import { isTopModal, pushModal } from '../helpers/focus.helper';

/**
 * `Escape` ile kapanma — dinleyici BELGE düzeyinde.
 * ⚠ YÜZEY YIĞINA KATILIR ve tuşu YALNIZCA EN ÜSTTEKİ tüketir.
 * ⚠ Tüketilen tuş `preventDefault` ile İŞARETLENİR: sayfa düzeyindeki dinleyici yüzeyi kapatan tuşu
 * kendi eylemine saymaz (bkz. `hasOpenSurface`).
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
      /*
       * Yüzey bu tuş vuruşunda kapanır ve gerçek tarayıcıda React onu sonraki dinleyiciler koşmadan
       * yığından düşürür: onlara kalan tek kanıt bu işaret.
       */
      event.preventDefault();
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
