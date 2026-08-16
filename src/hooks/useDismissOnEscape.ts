'use client';

import { useEffect } from 'react';

import { isTopModal, pushModal } from '../helpers/focus.helper';

/**
 * `Escape` ile kapanma — dinleyici BELGE düzeyinde.
 *
 * <p>Aynı etki üç yüzeyde birebir tekrarlanıyordu (`Tooltip`, `Popover`,
 * `Toast`) ve odak yüzeyin içinde OLMAYABİLİR: fareyle açılmış bir popover'da
 * odak hâlâ tetikleyicide durur, yani dinleyici bileşene bağlanamaz.
 *
 * ⚠ YÜZEY YIĞINA KATILIR ve tuşu YALNIZCA EN ÜSTTEKİ tüketir. Önceki sürüm
 * sahiplik sormuyordu ve tek bir `Escape` üst üste binen yüzeylerin HEPSİNİ
 * birden kapatıyordu:
 *
 * <ul>
 *   <li>Kaydetme sonrası "Geri al" eylemli bir toast açıkken bir
 *   `ConfirmDialog` açıp `Escape`e basmak, pencereyi kapatırken toast'ı da
 *   siliyordu — geri alma bağlantısı kullanıcı ona ulaşamadan yok oluyordu.</li>
 *   <li>İçinde `Select` olan bir filtre `Popover`ında listeyi `Escape` ile
 *   kapatmak panelin tamamını kapatıyor, kullanıcının üzerinde çalıştığı
 *   filtreler gidiyordu.</li>
 * </ul>
 *
 * ⚠ Kipsel yüzeyler (`Modal`, `Drawer`, `BottomSheet`) bu kancayı KULLANMAZ:
 * onlar yerel `<dialog>` üzerinden `cancel` olayını işler. Ama AYNI yığına
 * katıldıkları için sıralama iki grup arasında da geçerlidir — düzeltmenin
 * çalışmasının sebebi tam olarak budur.
 *
 * @param isActive Yüzey açık mı. Kapalıyken dinleyici hiç bağlanmaz.
 * @param onDismiss Kapatma. Her render'da yeni bir kapanışsa dinleyici de her
 * render'da yeniden bağlanır; çağıran tarafta `useCallback` ile sabitlenir.
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
