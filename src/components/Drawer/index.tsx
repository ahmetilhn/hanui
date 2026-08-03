'use client';

import {
  memo,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';

import { XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import {
  captureFocus,
  focusFirstMeaningful,
  isTopModal,
  preventAutoKeyboard,
  pushModal,
} from '../../helpers/focus.helper';
import { resolveLabel } from '../../helpers/label.helper';
import useScrollLock from '../../hooks/useScrollLock';
import { useHanui } from '../../theme/context';
import IconButton from '../IconButton';

import styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Kapatma düğmesinin erişilebilir adı. Verilmezse `labels.close`. */
  closeLabel?: string;
  children: ReactNode;
  /**
   * Panelin hangi kenardan geldiği. Mantıksal: `end` RTL'de sola açılır.
   *
   * <p>Varsayılan `end` — filtre ve ayrıntı panelleri okuma yönünün SONUNDAN
   * gelir; `start` gezinme panelleri içindir.
   */
  side?: 'start' | 'end';
  size?: 'sm' | 'md' | 'lg';
  /** Dipte duran eylem şeridi; gövde kaydırılırken yerinde kalır. */
  footer?: ReactNode;
  /** Başlığın altında duran, gövdeyle birlikte kaymayan şerit. */
  toolbar?: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * Çekmece (drawer) — kenardan açılan kipsel panel.
 *
 * <h3>{@link BottomSheet} ile farkı: EKRAN, tercih değil</h3>
 * İkisi de kipsel bir yan panel; ayrım hangi ekranda doğru olduklarında:
 *
 * <ul>
 *   <li>`BottomSheet` DAR ekran içindir. Baş parmağın erişebildiği yer
 *       ekranın dibi; kenardan gelen bir panel telefonda ekranın tamamını
 *       kaplıyor ve "panel" olmaktan çıkıyor.</li>
 *   <li><b>`Drawer` GENİŞ ekran içindir.</b> Filtre paneli ve ayrıntı
 *       incelemesi sayfanın yanında durur; kullanıcı listeyi görmeye devam
 *       eder. Aynı panel dipten gelseydi 1440 px'lik bir ekranda içeriğin
 *       tamamını örtüyordu.</li>
 * </ul>
 *
 * <h3>`isOpen` alır — ve bu {@link BottomSheet}ten bilinçli bir AYRILIK</h3>
 * `BottomSheet` "açıkken çizilir, kapatmak için kaldırılır" sözleşmesini
 * kullanıyor ve bunun bir bedeli var: React sökülen bir ağacı bekletmediği
 * için <strong>çıkış animasyonu çizilemiyor</strong>, panel bir karede yok
 * oluyor. Çekmece açık/kapalı durumu kendisi taşıyor; `<dialog>` kapanırken
 * `@starting-style` + `allow-discrete` ile geri kayıyor.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Escape`</td><td>kapatır — üst üste açık panellerde YALNIZCA en üstteki</td></tr>
 *   <tr><td>`Tab`</td><td>odak panelin içinde döner (tarayıcı: `showModal()`)</td></tr>
 * </table>
 * Açılışta odak kapatma düğmesine DEĞİL ilk anlamlı öğeye gider.
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
  side = 'end',
  size = 'md',
  footer,
  toolbar,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const dialogRef = useRef<HTMLDialogElement>(null);
  /* Yigindaki yerimiz: Escape yalnizca EN USTTEKI panelde islenir. */
  const tokenRef = useRef<symbol | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    const restoreFocus = captureFocus();
    if (!dialog.open) dialog.showModal();

    focusFirstMeaningful(dialog, `.${styles.drawer__close}`);
    preventAutoKeyboard(dialog);

    const { token, pop } = pushModal();
    tokenRef.current = token;

    return () => {
      pop();
      tokenRef.current = null;
      restoreFocus();
    };
  }, [isOpen]);

  useScrollLock(isOpen);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (tokenRef.current && !isTopModal(tokenRef.current)) return;
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      // Hedef dialog'un KENDISI ise perdeye tiklanmistir; panel degil.
      if (event.target === dialogRef.current) onClose();
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.drawer, styles[`drawer--${side}`], styles[`drawer--${size}`], className)}
      aria-labelledby={titleId}
      data-testid={testId}
      onClick={handleBackdropClick}
    >
      <header className={styles.drawer__header}>
        <h2 id={titleId} className={styles.drawer__title}>
          {title}
        </h2>

        <IconButton
          icon={<XLg aria-hidden />}
          label={resolveLabel('Drawer.closeLabel', closeLabel, labels?.close)}
          variant="ghost"
          size="sm"
          className={styles.drawer__close}
          onClick={onClose}
        />
      </header>

      {toolbar && <div className={styles.drawer__toolbar}>{toolbar}</div>}

      <div className={styles.drawer__body}>{children}</div>

      {footer && <div className={styles.drawer__footer}>{footer}</div>}
    </dialog>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Drawer, 'Drawer')) as typeof Drawer;
