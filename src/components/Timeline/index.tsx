'use client';

import { type FC, memo, type ReactNode } from 'react';

import { CheckLg, XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Bir olayın durumu. `pending` HENÜZ olmadı — başarısız değil. */
export type TimelineStatus = 'done' | 'current' | 'pending' | 'failed';

export type TimelineEvent = {
  id: string;
  title: string;
  /** Zaman damgası — BİÇİMLENDİRİLMİŞ dize. Bileşen tarih biçimlendirmez. */
  time?: string;
  description?: ReactNode;
  status?: TimelineStatus;
  /** Varsayılan işaretin yerine geçen ikon. */
  icon?: ReactNode;
};

type Props = {
  events: TimelineEvent[];
  /** Akışın erişilebilir adı ("Sipariş geçmişi"). ZORUNLU. */
  label: string;
  className?: string;
  testId?: string;
};

/**
 * Durumun GÖRSEL işareti — renkten bağımsız.
 *
 * <p>`done` tik, `failed` çarpı taşıyor; ikisi de dolu daire ve YALNIZCA
 * renkle ayrılsalardı renk körü bir kullanıcı için aynı görünüyorlardı
 * (WCAG 1.4.1). `current` ve `pending` kendi biçimlerini kenarlıktan alıyor
 * (dolu halka / kesikli daire) ve glif taşımıyor.
 */
const STATUS_ICON: Record<TimelineStatus, ReactNode> = {
  done: <CheckLg />,
  failed: <XLg />,
  current: null,
  pending: null,
};

/** Durumun ekran okuyucuya okunan karşılığı. */
const STATUS_TEXT: Record<TimelineStatus, string> = {
  done: 'tamamlandı',
  current: 'şu an',
  pending: 'bekliyor',
  failed: 'başarısız',
};

/**
 * Zaman çizelgesi — sipariş durumu, işlem geçmişi.
 *
 * <h3>{@link Steps} ile farkı: ileri mi geri mi bakıyor</h3>
 * İkisi de sıralı ve durumlu; ayrım yönlerinde:
 *
 * <ul>
 *   <li>`Steps` İLERİ bakar: kullanıcı bir akışın içinde ve kalan adımları
 *       görüyor. Adım sayısı sabit, adımlara dönülebilir.</li>
 *   <li><b>`Timeline` GERİ bakar:</b> olmuş şeylerin kaydı. Olay sayısı
 *       değişken, hiçbiri tıklanabilir değil ve <strong>başarısız</strong>
 *       diye bir durum var — bir adım "başarısız" olamaz, akış orada durur;
 *       bir olay olabilir ve kayıtta kalır.</li>
 * </ul>
 *
 * <h3>Zaman biçimlendirmesi ÇAĞIRANIN</h3>
 * `time` biçimlendirilmiş bir dize. Kütüphane `Intl` çağırsaydı yerel ayarı
 * ve "3 saat önce" mi "14:32" mi yazılacağını kendisi seçmiş olurdu — ikisi
 * de bağlama bağlı kararlar.
 *
 * <h3>Durum renkle DEĞİL, üç şeyle birden</h3>
 * İşaretin <strong>biçimi</strong> (dolu / halka / tik / çarpı), rengi ve
 * ekran okuyucuya okunan <strong>metni</strong>. Yalnızca renk kullanılsaydı
 * "tamamlandı" ile "başarısız" renk körü bir kullanıcı için aynı daireydi.
 */
const Timeline: FC<Props> = ({ events, label, className, testId }) => (
  <ol className={cx(styles.timeline, className)} aria-label={label} data-testid={testId}>
    {events.map(event => {
      const status = event.status ?? 'done';

      return (
        <li
          key={event.id}
          className={cx(styles.timeline__item, styles[`timeline__item--${status}`])}
          aria-current={status === 'current' ? 'step' : undefined}
        >
          <span className={styles.timeline__marker} aria-hidden>
            {event.icon ?? STATUS_ICON[status]}
          </span>

          <div className={styles.timeline__body}>
            <span className={styles.timeline__title}>
              {event.title}
              {/* Durum METIN olarak da okunur: isaret ve renk ekran okuyucuya
                  gecmiyor. */}
              <span className={styles.timeline__srOnly}>{STATUS_TEXT[status]}</span>
            </span>

            {event.time && (
              /* `<time>` DEGIL `<span>`: `datetime` icin makine okunur bir
                 deger gerekiyor ve elimizde yalnizca bicimlendirilmis dize
                 var. Yanlis bir `datetime`, hicbir `datetime`den kotu. */
              <span className={styles.timeline__time}>{event.time}</span>
            )}

            {event.description && (
              <span className={styles.timeline__description}>{event.description}</span>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Timeline, 'Timeline')) as typeof Timeline;
