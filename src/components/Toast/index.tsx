'use client';

import { memo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { isClient } from '@ahmetilhn/handy-utils';
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  InfoCircleFill,
  XCircleFill,
  XLg,
} from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import IconButton from '../IconButton';

import styles from './index.module.scss';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export type ToastOptions = {
  tone?: ToastTone;
  /** Görüntülenme süresi (ms). `0` → kendiliğinden kapanmaz. */
  duration?: number;
  /** Başlığın altındaki bir cümlelik ayrıntı. */
  description?: ReactNode;
  /** Bildirimin içindeki tek eylem ("Geri al"). */
  action?: { label: string; onClick: () => void };
};

type ToastRecord = ToastOptions & { id: number; message: string };

/** Ton başına ikon: renk TEK BAŞINA anlam taşımaz (WCAG 1.4.1). */
const ICONS: Record<ToastTone, ReactNode> = {
  info: <InfoCircleFill aria-hidden />,
  success: <CheckCircleFill aria-hidden />,
  warning: <ExclamationTriangleFill aria-hidden />,
  danger: <XCircleFill aria-hidden />,
};

/**
 * Ton başına varsayılan süre.
 *
 * <p>Hata daha UZUN durur: kullanıcı bir şeyin yanlış gittiğini okumak,
 * başarıyı okumaktan daha uzun sürüyor ve genellikle bir karar gerektiriyor.
 * Dört saniyede kaybolan bir hata mesajı, kullanıcıya ne olduğunu
 * söylememekle aynı kapıya çıkıyordu.
 */
const DEFAULT_DURATION: Record<ToastTone, number> = {
  info: 4_000,
  success: 4_000,
  warning: 6_000,
  danger: 8_000,
};

/** Aynı anda ekranda duran en fazla bildirim. */
const MAX_VISIBLE = 3;

/*
 * YAYIN MERKEZI — modul duzeyinde, saglayicidan BAGIMSIZ.
 *
 * `HanuiProvider` zorunlu degil (bkz. `theme/context.ts`) ve bildirim
 * cagrilari React agacinin disindan da geliyor: bir axios interceptor'unun
 * icinden, bir servis fonksiyonundan. Yayin merkezi bir context'e baglansaydi
 * o cagrilarin hicbiri calismazdi.
 */
let counter = 0;
/* `new Set()` modul duzeyinde bir CAGRI ve acilama olmadan bundler onu yan
   etkili sayabilir — Faz 0'da `memo()` cagrilarinda tam olarak bu olmustu.
   Burada olculebilir bir fark yaratmadi; acilama yine de duruyor cunku kural
   modul duzeyindeki HER cagri icin gecerli ve istisnasi olmamali. */
const listeners = /*#__PURE__*/ new Set<(toasts: ToastRecord[]) => void>();
let queue: ToastRecord[] = [];

const emit = () => listeners.forEach(listener => listener(queue));

const dismiss = (id: number) => {
  queue = queue.filter(item => item.id !== id);
  emit();
};

const push = (message: string, options: ToastOptions = {}): number => {
  counter += 1;
  const id = counter;

  /*
   * SIRAYA ALMA: ekranda en fazla `MAX_VISIBLE` bildirim durur, fazlasi EN
   * ESKIsini duserek yerini alir. Sinirsiz birakildiginda hizli art arda
   * gelen istekler (toplu kaydetme) ekrani bastan asagi bildirimle
   * dolduruyor ve altindaki arayuze ulasilamiyordu.
   */
  queue = [...queue, { ...options, id, message }].slice(-MAX_VISIBLE);
  emit();

  return id;
};

/**
 * BİLDİRİM SÖZLEŞMESİ — süre, ikon ve renk kararları TEK YERDE.
 *
 * <h3>Neden harici bir kütüphaneye sarmalayıcı DEĞİL</h3>
 * Tüketici `react-hot-toast` taşıyordu ve gövdeyi kendi yazmak zorunda
 * kalmıştı: kütüphanenin goober sınıfı bizim modül sınıfımızla AYNI
 * özgüllükteydi ve kazananı kaynak sırası belirliyordu — aynı bildirim
 * geliştirmede ve üretimde İKİ FARKLI RENKTE çıkıyordu. Bir sarmalayıcı bu
 * sorunu çözmez, erteler.
 *
 * @example
 * toast.success('Adres kaydedildi');
 * toast.error('Kart reddedildi', { action: { label: 'Yeniden dene', onClick: retry } });
 */
export const toast = {
  show: push,
  info: (message: string, options?: ToastOptions) => push(message, { ...options, tone: 'info' }),
  success: (message: string, options?: ToastOptions) =>
    push(message, { ...options, tone: 'success' }),
  warning: (message: string, options?: ToastOptions) =>
    push(message, { ...options, tone: 'warning' }),
  error: (message: string, options?: ToastOptions) => push(message, { ...options, tone: 'danger' }),
  dismiss,
  /** Tümünü kapatır — sayfa geçişinde bayat bildirim taşınmasın. */
  clear: () => {
    queue = [];
    emit();
  },
};

type ItemProps = {
  toast: ToastRecord;
  closeLabel: string;
  onDismiss: (id: number) => void;
};

/** Tek bir bildirim satırı; kendi zamanlayıcısını kendisi taşır. */
const ToastItem = ({ toast: record, closeLabel, onDismiss }: ItemProps) => {
  const tone = record.tone ?? 'info';
  const duration = record.duration ?? DEFAULT_DURATION[tone];

  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startedRef = useRef(0);

  useEffect(() => {
    if (duration === 0 || isPaused) return;

    startedRef.current = Date.now();
    const timer = window.setTimeout(() => onDismiss(record.id), remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      /* Kalan sure KORUNUR: imlec ayrilinca sayac bastan baslasaydi, uzerine
         bir kez gelinen bildirim ekranda cok daha uzun kaliyordu. */
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedRef.current));
    };
  }, [duration, isPaused, onDismiss, record.id]);

  return (
    <div
      className={cx(styles.toast, styles[`toast--${tone}`])}
      /*
       * `role="alert"` YALNIZCA hatada: o rol `aria-live="assertive"` demek ve
       * kullanicinin okudugu seyi BOLER. Basarili bir kaydetmeyi duyurmak icin
       * kullaniciyi bolmek gurultu; `status` sirasini bekler.
       */
      role={tone === 'danger' ? 'alert' : 'status'}
      /* Fare uzerindeyken sayac DURUR: kullanici bildirimi okuyor ya da
         icindeki eylemi tiklamaya gidiyor. */
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      /* Klavye odagi da duraklatir: Tab ile "Geri al"a ulasmaya calisan
         kullanicinin altindan bildirim kayboluyordu. */
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <span className={styles.toast__icon} aria-hidden>
        {ICONS[tone]}
      </span>

      <div className={styles.toast__text}>
        <span className={styles.toast__message}>{record.message}</span>
        {record.description && (
          <span className={styles.toast__description}>{record.description}</span>
        )}
      </div>

      {record.action && (
        <button
          type="button"
          className={styles.toast__action}
          onClick={() => {
            record.action?.onClick();
            onDismiss(record.id);
          }}
        >
          {record.action.label}
        </button>
      )}

      <IconButton
        icon={<XLg aria-hidden />}
        label={closeLabel}
        variant="ghost"
        size="sm"
        className={styles.toast__close}
        onClick={() => onDismiss(record.id)}
      />
    </div>
  );
};

type HubProps = {
  /** Kapatma düğmelerinin erişilebilir adı. Verilmezse `labels.close`. */
  closeLabel?: string;
  className?: string;
};

/**
 * Bildirim yığını — uygulamada <strong>BİR KEZ</strong> çizilir.
 *
 * <h3>Neden tek yığın</h3>
 * Birden fazla canlı bölge, ekran okuyucuların duyuruları birleştirip sırayla
 * okumasına ya da tamamen atlamasına yol açıyor. Yığın kök yerleşimde bir kez
 * durur; `toast.*` çağrıları React ağacının dışından da çalışır.
 *
 * <h3>Duyuru bölgesi HER ZAMAN DOM'da</h3>
 * Kapsayıcı bildirim yokken de çiziliyor. Sonradan DOM'a eklenen bir canlı
 * bölgenin ilk duyurusu güvenilmez — ekran okuyucu bölgeyi izlemeye
 * başlamadan içerik gelmiş oluyor.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Tab`</td><td>bildirimin eylemine ve kapatma düğmesine ulaşır</td></tr>
 *   <tr><td>odak/hover</td><td>kapanma sayacını DURDURUR</td></tr>
 * </table>
 */
const ToastHub = ({ closeLabel, className }: HubProps) => {
  const { labels } = useHanui();
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    setToasts(queue);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  const handleDismiss = useCallback((id: number) => dismiss(id), []);

  /* Escape en YENI bildirimi kapatir: yigilmis bildirimleri tek tek
     kapatmanin klavyeyle tek yolu buydu. */
  useEffect(() => {
    if (toasts.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      dismiss(toasts[toasts.length - 1].id);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toasts]);

  if (!isClient()) return null;

  return createPortal(
    <div className={cx(styles.hub, className)}>
      {toasts.map(record => (
        <ToastItem
          key={record.id}
          toast={record}
          closeLabel={resolveLabel('ToastHub.closeLabel', closeLabel, labels?.close)}
          onDismiss={handleDismiss}
        />
      ))}
    </div>,
    document.body,
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(ToastHub, 'ToastHub')) as typeof ToastHub;
