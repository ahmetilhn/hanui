'use client';

import { type FC, memo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { CaretLeftFill, CaretRightFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import IconButton from '../IconButton';

import styles from './index.module.scss';

type Props = {
  children: ReactNode;
  /** Şeridin erişilebilir adı ("Öne çıkan ürünler"). ZORUNLU. */
  label: string;
  /** Önceki/sonraki düğmelerinin erişilebilir adları. ZORUNLU. */
  previousLabel: string;
  nextLabel: string;
  /**
   * Sayfa göstergesinin ad üreticisi (`index` 1 tabanlı).
   *
   * <p>Verilmediğinde nokta göstergesi ÇİZİLMEZ: adsız bir nokta ekran
   * okuyucuda "düğme" diye okunuyor ve kullanıcı nereye gittiğini
   * bilmiyordu.
   */
  formatDotLabel?: (index: number, total: number) => string;
  /** Bir kartın asgari genişliği. Şerit buna göre kaç kart göstereceğine karar verir. */
  itemMinWidth?: number;
  className?: string;
  testId?: string;
};

/**
 * Kaydırılabilir şerit (carousel).
 *
 * <h3>OTOMATİK OYNATMA YOK — ve olmayacak</h3>
 * Kendiliğinden ilerleyen bir şerit WCAG 2.2.2'yi ihlal ediyor (beş saniyeden
 * uzun süren hareket duraklatılabilmeli) ama asıl sorun daha basit: kullanıcı
 * okumaya başladığı kartı kaybediyor. Bir prop olarak bile eklenmedi —
 * eklenseydi kullanılırdı.
 *
 * <h3>Kaydırma YEREL, JavaScript değil</h3>
 * Şerit `overflow-x: auto` + `scroll-snap`: dokunmatikte parmakla kaydırma,
 * masaüstünde shift+tekerlek ve <strong>klavyeyle ok tuşları</strong>
 * tarayıcıdan geliyor. JavaScript ile `transform` kaydıran bir uygulama
 * bunların hiçbirini getirmiyor ve kaydırma çubuğunu da götürüyor — kullanıcı
 * şeridin devam ettiğini göremiyordu.
 *
 * <p>Düğmeler `scrollBy` çağırıyor: yerel kaydırmayı DEĞİŞTİRMİYOR,
 * tetikliyor. İkisi aynı durumu paylaşıyor ve ayrışmaları imkânsız.
 *
 * <h3>Şerit klavyeyle ULAŞILABİLİR</h3>
 * Kaydırılabilir bir kutu, içinde odaklanabilir öğe yoksa `tabindex`
 * verilmediğinde klavye kullanıcısı için ulaşılamaz (WCAG 2.1.1). Şerit
 * genellikle bağlantı taşıyan kartlardan oluşuyor ve o durumda ek bir durak
 * gereksiz — bu yüzden `tabindex` yalnızca <strong>odaklanabilir çocuk
 * yoksa</strong> yazılıyor.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Tab`</td><td>önceki/sonraki düğmelerine ve kartların içine</td></tr>
 *   <tr><td>ok tuşları</td><td>şeridi kaydırır (yerel)</td></tr>
 * </table>
 */
const Carousel: FC<Props> = ({
  children,
  label,
  previousLabel,
  nextLabel,
  formatDotLabel,
  itemMinWidth = 240,
  className,
  testId,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const [page, setPage] = useState(0);
  /* Sayfa SAYISI da olculur: cocuk sayisindan hesaplamak, kac kartin yan yana
     sigdigini bilmeyi gerektiriyor ve o sey yalnizca yerlesimden okunur. */
  const [pageCount, setPageCount] = useState(1);
  const [needsTabStop, setNeedsTabStop] = useState(false);

  /*
   * DURUM SERIDIN KENDISINDEN OKUNUR, sayilmaz.
   *
   * Once "kacinci karttayiz" bir sayacla tutuluyordu ve parmakla kaydirma o
   * sayaci hic guncellemiyordu: kullanici elle kaydirdiktan sonra ok
   * dugmesine bastiginda serit basa ziplyordu.
   */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    /* 1 px tolerans: alt piksel yuvarlama yuzunden uctaki dugme hicbir zaman
       pasiflesmiyordu. */
    setCanScrollBack(scrollLeft > 1);
    setCanScrollForward(scrollLeft + clientWidth < scrollWidth - 1);
    setPage(clientWidth > 0 ? Math.round(scrollLeft / clientWidth) : 0);
    setPageCount(clientWidth > 0 ? Math.max(1, Math.ceil(scrollWidth / clientWidth)) : 1);

    /* Odaklanabilir cocugu olan bir seride ek bir Tab duragi gereksiz. */
    setNeedsTabStop(
      scrollWidth > clientWidth &&
        track.querySelector('a, button, input, select, textarea, [tabindex]') === null,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    measure();
    track.addEventListener('scroll', measure, { passive: true });

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(track);

    return () => {
      track.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [measure, children]);

  /* Bir GORUNUM genisligi kaydirir: sabit bir kart sayisi, farkli genislikteki
     kartlarda serit ortasinda duruyordu. */
  const scrollByPage = (direction: 1 | -1) =>
    trackRef.current?.scrollBy({
      left: direction * trackRef.current.clientWidth,
      behavior: 'smooth',
    });

  return (
    <section className={cx(styles.carousel, className)} aria-label={label} data-testid={testId}>
      <div className={styles.carousel__controls}>
        <IconButton
          icon={<CaretLeftFill aria-hidden className={styles.carousel__arrowIcon} />}
          label={previousLabel}
          variant="outline"
          size="sm"
          disabled={!canScrollBack}
          onClick={() => scrollByPage(-1)}
        />
        <IconButton
          icon={<CaretRightFill aria-hidden className={styles.carousel__arrowIcon} />}
          label={nextLabel}
          variant="outline"
          size="sm"
          disabled={!canScrollForward}
          onClick={() => scrollByPage(1)}
        />
      </div>

      <div
        ref={trackRef}
        className={styles.carousel__track}
        style={{ '--hanui-carousel-item': `${itemMinWidth}px` } as React.CSSProperties}
        /* Yalnizca odaklanabilir cocugu OLMAYAN bir seride durak: aksi halde
           klavye kullanicisi hicbir sey yapmayan bir durak geciyordu. */
        tabIndex={needsTabStop ? 0 : undefined}
        role={needsTabStop ? 'group' : undefined}
        aria-label={needsTabStop ? label : undefined}
      >
        {children}
      </div>

      {formatDotLabel && pageCount > 1 && (
        <div className={styles.carousel__dots}>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={cx(
                styles.carousel__dot,
                index === page && styles['carousel__dot--active'],
              )}
              /* Nokta ADSIZ birakilamaz: ekran okuyucuda "dugme" diye
                 okunuyor ve kullanici nereye gittigini bilmiyordu. */
              aria-label={formatDotLabel(index + 1, pageCount)}
              aria-current={index === page ? 'true' : undefined}
              onClick={() =>
                trackRef.current?.scrollTo({
                  left: index * trackRef.current.clientWidth,
                  behavior: 'smooth',
                })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Carousel, 'Carousel')) as typeof Carousel;
