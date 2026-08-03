'use client';

import {
  memo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { isClient } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import usePositioning, { type PositionSide } from '../../hooks/usePositioning';

import styles from './index.module.scss';

type Props = {
  /** Balonda gösterilecek açıklama. */
  content: ReactNode;
  /** Açıklamanın bağlandığı öğe — düğme, ikon, etiket. */
  children: ReactNode;
  /**
   * Tercih edilen kenar. Yer yoksa KARŞITINA düşer; üçüncü bir kenara
   * atlamaz (bkz. `usePositioning`).
   */
  side?: PositionSide;
  /**
   * Açılma gecikmesi (ms). Fare bir araç çubuğunun üzerinden geçerken sıfır
   * gecikme, art arda beş balon açıp kapatıyordu.
   */
  openDelay?: number;
  /**
   * @deprecated `side` kullanın. Bu prop bir sonraki büyük sürümde kalkacak.
   *
   * <p>Ad değişti çünkü davranış değişti: `position` SABİT bir kenar
   * yazıyordu ve balon oraya sığmadığında görünüm alanının dışına taşıyordu.
   * `side` yalnızca TERCİH — yer yoksa karşıt kenara düşülüyor. Aynı adı
   * korumak, artık doğru olmayan bir sözü sürdürmek olurdu.
   */
  position?: 'top' | 'bottom';
  className?: string;
};

/** Balonun kapanmadan önce beklediği süre — imlecin balona ulaşması için. */
const CLOSE_DELAY = 120;

/** Dokunmatikte balonu açan basma süresi. Daha kısası kaydırma jestini yakalıyordu. */
const LONG_PRESS_DELAY = 500;

/**
 * İpucu balonu.
 *
 * <h3>Neden native `title` yetmiyor</h3>
 * Tarayıcının `title` özniteliği <strong>dokunmatikte hiç görünmez</strong>,
 * gecikmesi ayarlanamaz ve biçimlendirilemez. Trafiğin ağırlığı mobil olan
 * bir arayüzde "üzerine gelince açıklama çıkar" demek, kullanıcıların çoğu
 * için açıklamanın hiç olmaması demek.
 *
 * <h3>Balon PORTAL ile gövdede</h3>
 * Önce tetikleyicinin içinde `position: absolute` ile duruyordu ve üç yerde
 * birden bozuluyordu: `overflow: hidden` taşıyan bir kapsayıcının içinde
 * (kart, tablo hücresi, `Panel`) KIRPILIYOR, ekranın kenarında görünüm
 * alanının dışına TAŞIYOR, `transform` taşıyan bir atanın altında yığılma
 * bağlamına HAPSOLUYORDU. Konum artık `usePositioning` ile ölçülüyor;
 * gerekçenin tamamı orada.
 *
 * <h3>Neden yalnızca AÇIKLAMA taşır</h3>
 * Balonda <em>yalnızca</em> yardımcı metin durur — bağlantı, düğme veya
 * okunması zorunlu bir bilgi değil. İçine bir eylem konsaydı ona erişmenin
 * yolu olmazdı: balon `pointer-events: none` ve klavyeyle içine girilemiyor.
 * Eylem taşıyan yüzey `Popover`ın işi; kalıcı olması gereken metin `Field`ın
 * `hint`i.
 *
 * <h3>Dokunmatik: uzun basma</h3>
 * Dokunmatikte `hover` yok — ipucu orada hiç açılmıyordu. Uzun basma balonu
 * açar; ekranın herhangi bir yerine dokunmak kapatır. Bağlam menüsü
 * bastırılır: uzun basmada iOS'ta seçim büyüteci, Android'de kopyala menüsü
 * çıkıyor ve ikisi de balonun üstüne biniyordu.
 *
 * <h3>Kapanma toleransı</h3>
 * İmleç tetikleyiciden çıkar çıkmaz kapatmak, balonun kendisine ulaşmayı
 * imkânsız kılıyordu (metin seçilemiyor). Kapanış {@link CLOSE_DELAY} kadar
 * bekletilir ve bu sürede balona giren imleç onu açık tutar.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Tab`</td><td>tetikleyiciye gelince GECİKMESİZ açılır</td></tr>
 *   <tr><td>`Escape`</td><td>kapatır; odak tetikleyicide kalır</td></tr>
 * </table>
 * Gecikme fare için var; Tab ile gelen kullanıcı zaten bilinçli olarak orada
 * duruyor.
 */
const Tooltip = ({ content, children, side, position, openDelay = 300, className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  /* Eski prop bir surum boyunca calisir; `side` verilmisse o kazanir. */
  const resolvedSide: PositionSide = side ?? position ?? 'top';

  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef(0);
  const longPressRef = useRef(0);

  const positioning = usePositioning(anchorRef, bubbleRef, {
    side: resolvedSide,
    align: 'center',
    isOpen,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  }, []);

  const open = useCallback(
    (delay: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => setIsOpen(true), delay);
    },
    [clearTimer],
  );

  const close = useCallback(
    (delay: number = CLOSE_DELAY) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => setIsOpen(false), delay);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  /*
   * Escape BELGE duzeyinde dinleniyor.
   *
   * Sarmalayicida dinlemek yetmiyordu: balon acikken odak tetikleyicide
   * OLMAYABILIR (fareyle acilmis bir ipucu) ve o durumda tus olayi hic
   * sarmalayiciya ulasmiyor, ipucu ekranda asili kaliyordu.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(0);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  /* Dokunmatikte ekranin herhangi bir yerine dokunmak kapatir: balonun kendi
     kapatma yolu yok ve `pointer-events: none` oldugu icin ona da
     dokunulamiyor. */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      if (anchorRef.current?.contains(event.target as Node)) return;
      close(0);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, close]);

  const cancelLongPress = () => {
    if (longPressRef.current) window.clearTimeout(longPressRef.current);
    longPressRef.current = 0;
  };

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse') return;
    longPressRef.current = window.setTimeout(() => setIsOpen(true), LONG_PRESS_DELAY);
  };

  return (
    <>
      <span
        ref={anchorRef}
        className={cx(styles.tooltip, className)}
        onPointerEnter={event => event.pointerType === 'mouse' && open(openDelay)}
        onPointerLeave={event => {
          cancelLongPress();
          if (event.pointerType === 'mouse') close();
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onFocus={() => open(0)}
        onBlur={() => close(0)}
        onContextMenu={event => {
          if (isOpen || longPressRef.current) event.preventDefault();
        }}
      >
        <span aria-describedby={isOpen ? id : undefined} className={styles.tooltip__trigger}>
          {children}
        </span>
      </span>

      {/*
        Balon DOM'da yalnizca ACIKKEN: kapaliyken de birakip gizlemek, ekran
        okuyucunun onu `aria-describedby` olmadan da bulup okumasina yol
        aciyordu.
      */}
      {isOpen &&
        isClient() &&
        createPortal(
          <span
            ref={bubbleRef}
            id={id}
            role="tooltip"
            className={cx(styles.bubble, styles[`bubble--${positioning.side}`])}
            style={{
              ...positioning.style,
              /* Olculmeden cizilen balon bir kare boyunca sol ust kosede
                 parliyordu. */
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
            /* Imlec balona giderken tetikleyiciden cikiyor; balon uzerindeyken
               kapanis iptal edilir ve metin secilebilir kalir. */
            onPointerEnter={clearTimer}
            onPointerLeave={() => close()}
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Tooltip, 'Tooltip')) as typeof Tooltip;
