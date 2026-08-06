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

export type ModalTone = 'neutral' | 'danger' | 'warning' | 'success' | 'info';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Kapatma düğmesinin erişilebilir adı. */
  closeLabel?: string;
  children?: ReactNode;
  /** Başlığın altındaki bir cümlelik açıklama. */
  description?: ReactNode;
  /** Altta duran eylemler. Sağa yaslanır; dar ekranda tam genişliğe yayılır. */
  footer?: ReactNode;
  /** Başlığın solunda duran ikon madalyonu; `tone` rengini alır. */
  icon?: ReactNode;
  /** İkon madalyonunun tonu. */
  tone?: ModalTone;
  size?: 'sm' | 'md' | 'lg';
  /** `false` iken arka plana tıklama, Escape ve kapatma düğmesi kapatmaz. */
  isDismissable?: boolean;
  className?: string;
  testId?: string;
};

/** Kip pencere (modal). */
const Modal = ({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
  description,
  footer,
  icon,
  tone = 'neutral',
  size = 'md',
  isDismissable = true,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const dialogRef = useRef<HTMLDialogElement>(null);
  /* Yigindaki yerimiz: Escape yalnizca EN USTTEKI panelde islenir. */
  const tokenRef = useRef<symbol | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  /* ACILIS: `showModal()` + odak + yigina katilma. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    const restoreFocus = captureFocus();
    if (!dialog.open) dialog.showModal();

    /*
     * Odak KAPATMA DUGMESINE degil ilk anlamli ogeye. `showModal()` DOM
     * sirasindaki ilk odaklanabilir ogeye gidiyor ve o neredeyse her zaman
     * basliktaki carpi: ekran okuyucu pencereyi "Kapat, dugme" diye aciyor —
     * kullanicinin duydugu ilk sey, pencerenin ne oldugu degil ondan nasil
     * kacilacagi.
     */
    focusFirstMeaningful(dialog, `.${styles.modal__close}`);
    /* Odak bir metin alanina dustuyse geri alinir: telefonda ekran klavyesi
       kullanici istemeden aciliyordu (bkz. `helpers/focus.helper`). */
    preventAutoKeyboard(dialog);

    const { token, pop } = pushModal();
    tokenRef.current = token;

    return () => {
      pop();
      tokenRef.current = null;
      restoreFocus();
    };
  }, [isOpen]);

  /*
   * Arka plan kaydirmasi kilitlenir. `showModal()` arka plani etkilesime
   * kapatir ama kaydirmayi her tarayicida engellemiyor: kullanici pencereyi
   * kaydirdigini sanirken arkadaki listeyi kaydiriyordu. Kilit SAYACLI —
   * ic ice iki panelde ilki kapaninca erken acilmamali (bkz. `useScrollLock`).
   */
  useScrollLock(isOpen);

  /*
   * Escape'i tarayici isliyor ama React durumu bundan haberdar olmuyor;
   * `cancel` olayi yakalanmazsa pencere kapanip `isOpen` true kaliyor ve bir
   * daha acilamiyordu.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      /* Varsayilan HER ZAMAN engellenir: kapanis karari React'te veriliyor ve
         tarayicinin pencereyi kendi basina kapatmasi durumu `isOpen: true`
         birakiyordu. */
      event.preventDefault();
      if (!isDismissable) return;

      /* Yalnizca EN USTTEKI panel kapanir. Ust uste iki pencerede tek bir
         Escape ikisini birden kapatiyordu: `cancel` her ikisine de ulasiyor
         ve ikisi de kendi `onClose`unu cagiriyordu. */
      if (tokenRef.current && !isTopModal(tokenRef.current)) return;

      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose, isDismissable]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (!isDismissable) return;
      // Hedef dialog'un KENDISI ise arka plana tiklanmistir; panel degil.
      if (event.target === dialogRef.current) onClose();
    },
    [isDismissable, onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.modal, styles[`modal--${size}`], className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-testid={testId}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal__panel}>
        <header className={styles.modal__header}>
          {icon && (
            <span className={cx(styles.modal__icon, styles[`modal__icon--${tone}`])}>{icon}</span>
          )}

          <div className={styles.modal__heading}>
            <h2 id={titleId} className={styles.modal__title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.modal__description}>
                {description}
              </p>
            )}
          </div>

          {isDismissable && (
            <IconButton
              icon={<XLg aria-hidden />}
              label={resolveLabel('Modal.closeLabel', closeLabel, labels?.close)}
              variant="ghost"
              size="sm"
              className={styles.modal__close}
              onClick={onClose}
            />
          )}
        </header>

        {/*
          Gövde yalnızca içerik VARSA çizilir: onay pencerelerinin çoğunda soru
          başlıkta ve açıklamada duruyor, gövde boş kalıyor ve boş bir kutu
          40 px'lik bir boşluk bırakıyordu.
        */}
        {children && <div className={styles.modal__body}>{children}</div>}

        {footer && <footer className={styles.modal__footer}>{footer}</footer>}
      </div>
    </dialog>
  );
};

export default /*#__PURE__*/ memo(Modal) as typeof Modal;
