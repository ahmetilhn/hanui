'use client';

import { useEffect } from 'react';

/**
 * `Escape` ile kapanma — dinleyici BELGE düzeyinde.
 *
 * <p>Aynı etki üç yüzeyde birebir tekrarlanıyordu (`Tooltip`, `Popover`,
 * `Toast`) ve odak yüzeyin içinde OLMAYABİLİR: fareyle açılmış bir popover'da
 * odak hâlâ tetikleyicide durur, yani dinleyici bileşene bağlanamaz.
 *
 * ⚠ Kipsel yüzeyler (`Modal`, `Drawer`, `BottomSheet`) bunu KULLANMAZ: onlar
 * yerel `<dialog>` üzerinden `cancel` olayını işler ve yığının yalnızca en
 * üstteki panelinde kapanır. Belge düzeyinde ikinci bir dinleyici o yığın
 * kuralını sessizce bozardı.
 *
 * @param isActive Yüzey açık mı. Kapalıyken dinleyici hiç bağlanmaz.
 * @param onDismiss Kapatma. Her render'da yeni bir kapanışsa dinleyici de her
 * render'da yeniden bağlanır; çağıran tarafta `useCallback` ile sabitlenir.
 */
const useDismissOnEscape = (isActive: boolean, onDismiss: () => void): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onDismiss]);
};

export default useDismissOnEscape;
