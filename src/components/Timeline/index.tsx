'use client';

import { type FC, memo, type ReactNode } from 'react';

import { CheckLg, XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import { useHanui } from '../../theme/context';

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

/** Durumun GÖRSEL işareti — renkten bağımsız. */
const STATUS_ICON: Record<TimelineStatus, ReactNode> = {
  done: <CheckLg />,
  failed: <XLg />,
  current: null,
  pending: null,
};

/*
 * ⚠ DURUM METNI SR-ONLY ve SAGLAYICIDAN gelir.
 *
 * ⚠ `pending` LISTEDE YOK ve bu bilincli: "henuz olmadi" durumunun ekran
 * okuyucuda ayri bir karsiligi yok — olay zaten cizelgede ileride duruyor.
 * Ucunu anahtara baglayip dorduncusune sabit metin birakmak, sozlesmeyi
 * yarim uygulamak olurdu.
 */
const STATUS_KEY: Record<TimelineStatus, 'completed' | 'current' | 'failed' | null> = {
  done: 'completed',
  current: 'current',
  pending: null,
  failed: 'failed',
};

/** Zaman çizelgesi — sipariş durumu, işlem geçmişi. */
const Timeline: FC<Props> = ({ events, label, className, testId }) => {
  const { labels } = useHanui();

  return (
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
                <span className={styles.timeline__srOnly}>
                  {STATUS_KEY[status] === null
                    ? null
                    : resolveLabel(
                        `Timeline.${STATUS_KEY[status]}`,
                        labels?.timeline?.[STATUS_KEY[status]],
                      )}
                </span>
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
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Timeline, 'Timeline')) as typeof Timeline;
