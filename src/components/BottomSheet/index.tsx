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
import { createPortal } from 'react-dom';

import { isClient } from '@ahmetilhn/handy-utils';

import { ABOVE_MOBILE_MEDIA_QUERY } from '../../constants/breakpoint.constants';
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
import { useHanui } from '../../theme/context';
import useScrollLock from '../../hooks/useScrollLock';
import useSheetViewport from '../../hooks/useSheetViewport';
import IconButton from '../IconButton';

import styles from './index.module.scss';

type Props = {
  title: string;
  /** Kapatma düğmesinin erişilebilir adı. Verilmezse `labels.close`. */
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
  /**
   * Başlığın altında duran, gövde kaydırılırken yerinde kalan şerit —
   * `Combobox`ın arama kutusu gibi.
   */
  toolbar?: ReactNode;
  /** Dipte duran eylem şeridi. */
  footer?: ReactNode;
  /**
   * Panelin <strong>kendiliğinden kapandığı</strong> medya sorgusu.
   *
   * <p>Varsayılan mobil eşiği (`>640`), çünkü seçim kutuları o eşiğin üstünde
   * listeyi yapışkan panelde açıyor. Kendi eşiği daha geniş olan çağıranlar
   * kendi sorgusunu verir; aksi hâlde 800 px'te açılan panel pencere 641 px'i
   * geçtiğinde kapanıyor ya da hiç kapanmıyordu.
   */
  closeAbove?: string;
  className?: string;
  testId?: string;
};

/**
 * Alt sayfa (bottom sheet) — ekranın dibinden yükselen kipsel panel.
 *
 * <h3>Ne zaman</h3>
 * Dar ekranda bir <strong>seçim listesi</strong> açan her kutu bunu kullanır
 * ({@link Select}, {@link Combobox}). Masaüstünde aynı liste tetikleyiciye
 * yapışan bir panelde açılır; telefonda o panel klavye açılınca sıkışıyor ve
 * listenin alt ucu ekranın dışında kalıyordu. Alt sayfa baş parmağın
 * erişebildiği yerde durur, satırları büyüktür ve ekranı tek işe ayırır.
 *
 * <h3>Neden yerel `<dialog>` + portal</h3>
 * `showModal()` odak tuzağını, Escape'i ve arka planın etkileşime kapanmasını
 * tarayıcıdan getirir. Panel <strong>gövdeye taşınır</strong>: seçim kutuları
 * `<label>` içinde durabiliyor ve etiketin içindeki tıklama etiketlenen öğeye
 * yönleniyor — seçeneklere basmak aynı anda tetikleyiciyi de tetikliyordu.
 *
 * <h3>Yalnızca açıkken çizilir</h3>
 * Bileşen `isOpen` almaz: çağıran taraf açıkken <em>render eder</em>, kapatmak
 * için kaldırır. Kapalı bir `<dialog>`u CSS ile gizlemeye çalışmak, sınıf
 * seçicisinin tarayıcı kuralını yenmesi yüzünden paneli ekranın dibinde asılı
 * bırakıyordu.
 *
 * <h3>Kırılma noktası aşılırsa kapanır</h3>
 * `showModal()` sayfanın geri kalanını panel çizilsin ya da çizilmesin inert
 * bırakır; pencere büyütülüp panel gizlenseydi sayfa tıklanamaz kalırdı.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Escape`</td><td>kapatır (`cancel` olayı çağırana bildirilir)</td></tr>
 *   <tr><td>`Tab`</td><td>odak panelin içinde döner</td></tr>
 * </table>
 * Açılışta odak metin alanına DÜŞMEZ: `showModal()` odağı ilk odaklanabilir
 * öğeye taşıyor ve o öğe bir metin alanı olduğunda telefonda ekran klavyesi
 * kullanıcı istemeden açılıyordu (bkz. `helpers/focus.helper`). Nöbetçi:
 * `components/__tests__/keyboard.test.tsx`.
 */
const BottomSheet = ({
  title,
  closeLabel,
  onClose,
  children,
  toolbar,
  footer,
  closeAbove = ABOVE_MOBILE_MEDIA_QUERY,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const titleId = useId();
  /* Yigindaki yerimiz: Escape yalnizca EN USTTEKI panelde islenir. */
  const tokenRef = useRef<symbol | null>(null);

  /* Panel GORUNEN alana yaslanir: klavye ve adres cubugu altinda kalmaz. */
  useSheetViewport();

  /* Arka plan kaydirmasi kilitlenir: `showModal()` arka plani etkilesime
     kapatir ama kaydirmayi her tarayicida engellemiyor — kullanici alt sayfayi
     kaydirdigini sanirken arkadaki listeyi kaydiriyordu. Kilit SAYACLI: bu
     panel neredeyse her zaman baska bir kipsel yuzeyin (secim kutusu, filtre
     paneli) ICINDE aciliyor ve ilki kapaninca kilit erken acilmamali. */
  useScrollLock();

  /*
   * ODAK GERI DONUSU ve KIPSEL YIGIN.
   *
   * Panel `isOpen` almiyor — cagiran acikken cizip kapatmak icin kaldiriyor
   * (bkz. yukaridaki not). Yani "acilis" MONTAJ, "kapanis" SOKUM: ikisi de
   * bos bagimlilikli tek bir etkiye sigiyor.
   */
  useEffect(() => {
    const restoreFocus = captureFocus();
    const { token, pop } = pushModal();
    tokenRef.current = token;

    return () => {
      pop();
      tokenRef.current = null;
      restoreFocus();
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia(closeAbove);
    query.addEventListener('change', onClose);
    return () => query.removeEventListener('change', onClose);
  }, [closeAbove, onClose]);

  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    if (!node || node.open) return;

    node.showModal();

    /* Odak KAPATMA DUGMESINE degil ilk anlamli ogeye: ekran okuyucu paneli
       "Kapat, dugme" diye aciyordu — kullanicinin duydugu ilk sey, panelin ne
       oldugu degil ondan nasil kacilacagi. */
    focusFirstMeaningful(node, `.${styles.sheet__header} button`);

    /* `showModal()` odagi panelin ILK odaklanabilir ogesine tasiyor; o oge bir
       metin alani oldugunda telefonda klavye kendiliginden aciliyordu
       (bkz. `helpers/focus.helper`). */
    preventAutoKeyboard(node);
  }, []);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      // Hedef dialog'un KENDISI ise perdeye tiklanmistir; icerik degil.
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  /* Portal `document.body`ye baglaniyor; sunucuda `document` yok. */
  if (!isClient()) return null;

  return createPortal(
    <dialog
      ref={setDialogRef}
      className={cx(styles.sheet, className)}
      aria-labelledby={titleId}
      data-testid={testId}
      /* Escape'i tarayici isler ama React durumu haberdar olmuyor:
         yakalanmazsa panel kapanip durum acik kaliyor ve kutu bir daha
         acilmiyordu. */
      onCancel={event => {
        event.preventDefault();
        /* Yalnizca EN USTTEKI panel kapanir: ust uste iki kipsel yuzeyde tek
           bir Escape ikisini birden kapatiyordu. */
        if (tokenRef.current && !isTopModal(tokenRef.current)) return;
        onClose();
      }}
      onClick={handleBackdropClick}
    >
      <header className={styles.sheet__header}>
        <h2 id={titleId} className={styles.sheet__title}>
          {title}
        </h2>
        <IconButton
          icon={<XLg aria-hidden />}
          label={resolveLabel('BottomSheet.closeLabel', closeLabel, labels?.close)}
          variant="ghost"
          size="sm"
          onClick={onClose}
        />
      </header>

      {toolbar && <div className={styles.sheet__toolbar}>{toolbar}</div>}

      <div className={styles.sheet__body}>{children}</div>

      {footer && <div className={styles.sheet__footer}>{footer}</div>}
    </dialog>,
    document.body,
  );
};

export default /*#__PURE__*/ memo(BottomSheet);
