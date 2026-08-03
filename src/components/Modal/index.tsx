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

import { cx } from '../../helpers/class-name.helper';
import { preventAutoKeyboard } from '../../helpers/focus.helper';
import { XIcon } from '../../icons';
import IconButton from '../IconButton';

import styles from './index.module.scss';

export type ModalTone = 'neutral' | 'danger' | 'warning' | 'success' | 'info';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Kapatma düğmesinin erişilebilir adı ("Kapat", "Close"). */
  closeLabel: string;
  children?: ReactNode;
  /**
   * Başlığın altındaki bir cümlelik açıklama.
   *
   * <p>`aria-describedby` ile pencereye bağlanır: ekran okuyucu pencere
   * açıldığında başlıkla birlikte bunu da okur. Gövdeye paragraf olarak
   * yazıldığında duyurulmuyordu.
   */
  description?: ReactNode;
  /** Altta duran eylemler. Sağa yaslanır; dar ekranda tam genişliğe yayılır. */
  footer?: ReactNode;
  /** Başlığın solunda duran ikon madalyonu; `tone` rengini alır. */
  icon?: ReactNode;
  /** İkon madalyonunun tonu. */
  tone?: ModalTone;
  size?: 'sm' | 'md' | 'lg';
  /**
   * `false` iken arka plana tıklama, Escape ve kapatma düğmesi kapatmaz.
   *
   * <p>Yalnızca <strong>sürmekte olan</strong> bir işlem için: silme isteği
   * gönderilmişken pencerenin kapanması, kullanıcıya işlem iptal edilmiş gibi
   * görünüyordu.
   */
  isDismissable?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Kip pencere (modal).
 *
 * <h3>Yerel `<dialog>` + `showModal()`</h3>
 * Odak tuzağı, Escape ile kapanma, arka planın etkileşime kapanması ve
 * `aria-modal` semantiği tarayıcıdan gelir. Bunları `<div>` üzerine elle
 * kurmak yüzlerce satır ve kaçınılmaz olarak eksik bir odak yönetimi demek.
 *
 * <h3>Neden `open` özniteliği değil `showModal()`</h3>
 * `<dialog open>` pencereyi <em>kipsiz</em> açar: arka plan tıklanabilir kalır
 * ve odak tuzağı çalışmaz. Kipli davranışın tek yolu yöntemi çağırmak.
 *
 * <h3>Arka planın kaydırılması ayrıca engellenir</h3>
 * `showModal()` arka planı <em>etkileşime</em> kapatır ama tarayıcıların bir
 * kısmında sayfa hâlâ kaydırılabiliyor: kullanıcı pencereyi kaydırdığını
 * sanırken arkadaki listeyi kaydırıyordu. `<body>` kilitlenir.
 *
 * <h3>Mobilde alt sayfaya düşer</h3>
 * Dar ekranda ortalanmış bir pencere, klavye açıldığında yukarı sıkışıyor ve
 * dip düğmeleri klavyenin altında kalıyordu. Alt sayfa baş parmağın
 * erişebildiği yerde durur.
 */
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      /* Odak metin alanina dusmesin: pencere `isDismissable={false}` iken
         kapatma dugmesi cizilmiyor ve ilk odaklanabilir oge dogrudan
         govdedeki alan oluyor — form pencerelerinde telefonda klavye
         kendiliginden aciliyordu (bkz. `helpers/focus.helper`). */
      preventAutoKeyboard(dialog);
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  /*
   * Arka plan kaydirmasi kilitlenir. `showModal()` arka plani etkilesime
   * kapatir ama kaydirmayi her tarayicida engellemiyor: kullanici pencereyi
   * kaydirdigini sanirken arkadaki listeyi kaydiriyordu.
   */
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  /*
   * Escape'i tarayici isliyor ama React durumu bundan haberdar olmuyor;
   * `cancel` olayi yakalanmazsa pencere kapanip `isOpen` true kaliyor ve bir
   * daha acilamiyordu.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      // Kapanmaya izin verilmiyorsa Escape de kapatmaz.
      event.preventDefault();
      if (isDismissable) onClose();
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
              icon={<XIcon />}
              label={closeLabel}
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

export default memo(Modal) as typeof Modal;
