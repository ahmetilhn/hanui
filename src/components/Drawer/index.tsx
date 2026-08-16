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
import useSheetViewport from '../../hooks/useSheetViewport';
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
  /** Panelin hangi kenardan geldiği. Mantıksal: `end` RTL'de sola açılır. */
  side?: 'start' | 'end';
  size?: 'sm' | 'md' | 'lg';
  /** Dipte duran eylem şeridi; gövde kaydırılırken yerinde kalır. */
  footer?: ReactNode;
  /** Başlığın altında duran, gövdeyle birlikte kaymayan şerit. */
  toolbar?: ReactNode;
  className?: string;
  testId?: string;
};

/** Çekmece (drawer) — kenardan açılan kipsel panel. */
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

  /*
   * ⚠ GÖRSEL GÖRÜNÜM ALANI TAKİBİ — `BottomSheet` ve `Modal` bunu zaten
   * yapıyordu, `Drawer` YAPMIYORDU. Mobilde çekmece `100dvh` yüksekliğinde ve
   * altbilgisi `safe-bottom` ile hizalanıyor; klavye açıldığında görsel
   * görünüm alanı küçülüyor ama `dvh` değişmediği için ALTBİLGİ KLAVYENİN
   * ALTINDA KALIYORDU — yani formu olan bir çekmecede "Kaydet" düğmesine
   * ulaşılamıyordu.
   *
   * ⚠ BAYRAK ZORUNLU — `BottomSheet`ten farkı burada. `Drawer` `<dialog>`ı
   * KOŞULSUZ çiziyor (yalnızca `showModal()`/`close()` `isOpen`e bağlı), yani
   * bayraksız çağrı hook'un JSDoc'unda tarif edilen tam duruma düşüyordu:
   * uygulama kabuğunda duran çekmece yüzünden her mobil sayfa yüklemesinde
   * `visualViewport` dinleyicileri OTURUM BOYUNCA açık kalıyor ve `openCount`
   * hiç 0'a dönmediği için `--hanui-sheet-inset-bottom` kalıcı yazılıyordu —
   * bunun ikinci etkisi, klavye açıkken açılan bir `Modal`ın ekranın çok
   * yukarısında yüzmesi (`Modal` o değişkeni `margin-bottom`da okuyor).
   * İki uygulamada da çekmece kabukta: `Sidebar` ve `Header`.
   */
  useSheetViewport(isOpen);

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
