'use client';

import { type FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveFormatter, resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import { CheckSmallIcon, CopyIcon } from '../../icons';

import styles from './index.module.scss';

type Props = {
  /** Gösterilecek ve panoya kopyalanacak değer. */
  value: string;
  /**
   * Kopyalama düğmesinin erişilebilir adı ve `title`ı.
   *
   * <p>Verilmezse `labels.copyField.copy(value)` çağrılır. Config bir DİZE
   * değil biçimlendirici tutar: ad değeri İÇERMELİ — bir listede on beş
   * kopyalama düğmesi var ve hepsi "Kopyala" diye okunduğunda ekran okuyucu
   * kullanıcısı hangisinin hangi kayıt olduğunu bilmiyordu.
   */
  copyLabel?: string;
  /** Kopyalandıktan sonraki ad. Verilmezse `labels.copyField.copied(value)`. */
  copiedLabel?: string;
  /** `aria-live` ile duyurulan onay cümlesi. Verilmezse `labels.copyField.announcement`. */
  copiedAnnouncement?: string;
  size?: 'sm' | 'md';
  /**
   * Kopyalama düğmesini gizler.
   *
   * <p>Yalnızca değerin <em>zaten tıklanabilir bir şeyin içinde</em> olduğu
   * yerlerde (bir bağlantının gövdesi) verilir: iç içe etkileşim öğesi geçersiz
   * HTML üretir.
   */
  isReadOnly?: boolean;
  className?: string;
  testId?: string;
};

/** "Kopyalandı" geri bildiriminin ekranda kalma suresi (ms). */
const COPIED_FEEDBACK_MS = 1600;

/**
 * Kopyalanabilir teknik değer — <strong>tek dokunuşla panoya</strong>.
 *
 * <h3>Neden ayrı bir öğe</h3>
 * Bir kod (SKU, parça numarası, sipariş numarası, IBAN) dekoratif bir metin
 * değil, kullanıcının <em>taşıdığı</em> veri. Düz bir `<span>` olduğunda
 * kullanıcı onu fareyle seçmeye çalışırken kartın tamamını seçiyor ya da
 * yanlışlıkla altındaki bağlantıyı tetikliyordu.
 *
 * <h3>Neden monospace</h3>
 * "0986479644" gibi diziler orantılı yazı tipinde okunmuyor: `0`/`O` ve `1`/`l`
 * ayırt edilemiyor ve bir hane atlandığında tamamen başka bir kayıt oluyor.
 * `technical-text` sabit genişlik + `tabular-nums` verir; iki değer alt alta
 * geldiğinde farklı hane gözle bulunur.
 *
 * <h3>Geri bildirim neden düğmenin üstünde</h3>
 * Bir bildirim (toast) da olurdu ama listelerde on beş satır var; ekranın
 * dibinde "kopyalandı" yazması <em>hangisinin</em> kopyalandığını
 * söylemiyordu. İkon yerinde tike dönünce cevap tıklanan yerde.
 *
 * <h3>Pano erişimi reddedilirse</h3>
 * `navigator.clipboard` güvenli olmayan bağlamda (HTTP) ve izin verilmediğinde
 * reddeder. O durumda değer sessizce <em>seçilir</em>: kullanıcı Ctrl+C ile
 * kendisi kopyalayabilir. Sessizce hiçbir şey yapmamak, düğmeyi bozuk
 * gösteriyordu.
 */
const CopyField: FC<Props> = ({
  value,
  copyLabel,
  copiedLabel,
  copiedAnnouncement,
  size = 'sm',
  isReadOnly,
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // Bilesen sokulurse zamanlayici da gitmeli; aksi halde React "unmounted
  // component" uyarisi veriyor.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const selectValue = useCallback(() => {
    const node = codeRef.current;
    if (!node) return;

    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      timerRef.current = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Pano yoksa/izin verilmediyse en azindan secili birakilir.
      selectValue();
    }
  }, [value, selectValue]);

  return (
    <span className={cx(styles.copy, styles[`copy--${size}`], className)} data-testid={testId}>
      {/*
        `user-select: all` (CSS): tek tiklama degerin TAMAMINI secer.
        Kullanicilar fareyle surukleyip yarim deger kopyaliyordu.
      */}
      <span className={styles.copy__code} ref={codeRef}>
        {value}
      </span>

      {!isReadOnly && (
        <button
          type="button"
          className={cx(styles.copy__button, isCopied && styles['copy__button--done'])}
          onClick={handleCopy}
          aria-label={
            isCopied
              ? (copiedLabel ??
                resolveFormatter('CopyField.copiedLabel', labels?.copyField?.copied, value))
              : (copyLabel ??
                resolveFormatter('CopyField.copyLabel', labels?.copyField?.copy, value))
          }
          title={
            isCopied
              ? (copiedLabel ??
                resolveFormatter('CopyField.copiedLabel', labels?.copyField?.copied, value))
              : (copyLabel ??
                resolveFormatter('CopyField.copyLabel', labels?.copyField?.copy, value))
          }
        >
          {isCopied ? <CheckSmallIcon /> : <CopyIcon />}
        </button>
      )}

      {/*
        Ekran okuyucu icin: ikon degisimi gorsel bir sinyal, duyulmuyor.
        `aria-live` yalnizca DEGISTIGINDE konusur.
      */}
      <span aria-live="polite" className={styles.copy__srOnly}>
        {isCopied
          ? resolveLabel(
              'CopyField.copiedAnnouncement',
              copiedAnnouncement,
              labels?.copyField?.announcement,
            )
          : ''}
      </span>
    </span>
  );
};

export default memo(CopyField) as typeof CopyField;
