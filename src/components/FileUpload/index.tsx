'use client';

import { type DragEvent, memo, type ReactNode, useId, useRef, useState } from 'react';

import { CloudArrowUpFill, ExclamationCircleFill, XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import useAnnounce from '../../hooks/useAnnounce';
import IconButton from '../IconButton';
import Progress from '../Progress';

import styles from './index.module.scss';

export type UploadFile = {
  id: string;
  name: string;
  /** Bayt. Ekranda okunur biçime çevrilir. */
  size: number;
  /** 0-100. `undefined` → yükleme başlamadı ya da bitti. */
  progress?: number;
  /** Bu dosyaya ait hata. Satır kırmızı çizilir ve metin okunur. */
  error?: string;
};

type Props = {
  files: UploadFile[];
  /** Kullanıcı dosya seçtiğinde/bıraktığında çağrılır — DOĞRULANMIŞ liste. */
  onSelect: (files: File[]) => void;
  onRemove: (id: string) => void;
  /** Alanın görünür etiketi ve erişilebilir adı. ZORUNLU. */
  label: string;
  /** Etiketin altındaki kural cümlesi ("PDF veya JPG, en fazla 5 MB"). */
  hint?: string;
  /** `<input accept>` — tarayıcının dosya seçicisini süzer. */
  accept?: string;
  isMultiple?: boolean;
  /** Bayt. Aşan dosya `onSelect`e HİÇ ulaşmaz; hata metni burada üretilir. */
  maxSize?: number;
  /** Kaldırma düğmelerinin erişilebilir ad öneki ("Kaldır"). */
  removeLabel: string;
  /** Sürükle-bırak alanının içine yazılan çağrı ("Dosyaları buraya bırakın"). */
  dropLabel: string;
  /** Boyut aşıldığında yazılan hata; `{name}` ve `{max}` yerine konur. */
  sizeErrorText?: string;
  isDisabled?: boolean;
  /** Alanın tamamına ait hata (sunucu reddi). */
  error?: string;
  children?: ReactNode;
  className?: string;
  testId?: string;
};

/** Baytı okunur biçime çevirir. */
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Dosya yükleme — sürükle-bırak <strong>ve</strong> düğme.
 *
 * <h3>Yerel `<input type="file">` KORUNUR</h3>
 * Görsel olarak gizlenir ama DOM'da kalır ve `<label>` ile alana bağlanır:
 * klavyeyle `Tab` + `Enter`, ekran okuyucuda "dosya seç, düğme" duyurusu,
 * işletim sisteminin dosya seçicisi ve mobilde kamera/galeri seçenekleri
 * <em>bedava</em> gelir. `<div>` üzerine `onDrop` yazıp düğmeyi taklit etmek
 * bunların hiçbirini getirmiyor — ve sürükle-bırak zaten <strong>tek başına
 * erişilebilir değil</strong>: fare gerektiriyor (WCAG 2.5.7).
 *
 * <h3>Doğrulama BİLEŞENDE, ama yalnızca ÖLÇÜLEBİLİR olan</h3>
 * Boyut sınırı burada uygulanıyor çünkü cevabı kesin ve anında verilebiliyor:
 * aşan dosya `onSelect`e hiç ulaşmıyor, kullanıcı yüklemenin bitmesini
 * beklemeden hatayı görüyor. Tür/içerik doğrulaması burada YAPILMIYOR —
 * `accept` bir öneri, gerçek karar sunucunun ve istemcide "geçerli" demek
 * yanlış bir söz olurdu.
 *
 * <h3>Sonuç DUYURULUYOR</h3>
 * Dosya eklendiğinde ve reddedildiğinde `useAnnounce` ile ekran okuyucuya
 * bildiriliyor. Listeye sessizce eklenen bir satır, görmeyen kullanıcı için
 * hiç olmamış demekti.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Tab`</td><td>alana, sonra her dosyanın kaldırma düğmesine</td></tr>
 *   <tr><td>`Enter` / `Space`</td><td>alanda: dosya seçiciyi açar</td></tr>
 * </table>
 */
const FileUpload = ({
  files,
  onSelect,
  onRemove,
  label,
  hint,
  accept,
  isMultiple,
  maxSize,
  removeLabel,
  dropLabel,
  sizeErrorText = '{name} çok büyük (en fazla {max}).',
  isDisabled,
  error,
  children,
  className,
  testId,
}: Props) => {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const announce = useAnnounce();

  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;

    const incoming = [...list];
    const tooLarge = maxSize === undefined ? [] : incoming.filter(file => file.size > maxSize);
    const accepted = incoming.filter(file => !tooLarge.includes(file));

    const messages = tooLarge.map(file =>
      sizeErrorText.replace('{name}', file.name).replace('{max}', formatSize(maxSize ?? 0)),
    );
    setRejected(messages);

    if (accepted.length > 0) {
      onSelect(accepted);
      announce(`${accepted.length} dosya eklendi`);
    }

    /* Reddedilen dosya ekranda YAZIYOR ama duyurulmali da: gormeyen kullanici
       icin sessizce dusen bir dosya hic secilmemis demekti. */
    if (messages.length > 0) announce(messages.join(' '), 'assertive');
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className={cx(styles.upload, className)} data-testid={testId}>
      {/*
        Sürükle-bırak alanı bir `<label>`: tıklama ve klavye YEREL girdiye
        yönleniyor. `onClick` ile `input.click()` çağırmak da çalışırdı ama
        ekran okuyucu alanı bir düğme olarak duyurmuyordu.
      */}
      <label
        htmlFor={inputId}
        className={cx(
          styles.upload__drop,
          isDragging && styles['upload__drop--dragging'],
          isDisabled && styles['upload__drop--disabled'],
          error && styles['upload__drop--invalid'],
        )}
        onDragOver={event => {
          event.preventDefault();
          if (!isDisabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CloudArrowUpFill aria-hidden className={styles.upload__icon} />

        <span className={styles.upload__label}>{label}</span>
        <span className={styles.upload__drag}>{dropLabel}</span>
        {hint && (
          <span id={hintId} className={styles.upload__hint}>
            {hint}
          </span>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className={styles.upload__input}
          accept={accept}
          multiple={isMultiple}
          disabled={isDisabled}
          aria-describedby={hint ? hintId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={event => {
            handleFiles(event.target.files);
            /* Deger SIFIRLANIR: ayni dosya ikinci kez secildiginde `change`
               olayi hic dusmuyor ve kullanici "hicbir sey olmadi" saniyordu. */
            event.target.value = '';
          }}
        />
      </label>

      {error && (
        <p className={styles.upload__error} role="alert">
          <ExclamationCircleFill aria-hidden />
          {error}
        </p>
      )}

      {rejected.map(message => (
        <p key={message} className={styles.upload__error} role="alert">
          <ExclamationCircleFill aria-hidden />
          {message}
        </p>
      ))}

      {files.length > 0 && (
        <ul className={styles.upload__list}>
          {files.map(file => (
            <li
              key={file.id}
              className={cx(styles.upload__file, file.error && styles['upload__file--error'])}
            >
              <span className={styles.upload__fileText}>
                <span className={styles.upload__fileName}>{file.name}</span>
                <span className={styles.upload__fileMeta}>
                  {file.error ?? formatSize(file.size)}
                </span>
              </span>

              {file.progress !== undefined && (
                <Progress
                  value={file.progress}
                  label={`${file.name} yükleniyor`}
                  size="sm"
                  className={styles.upload__progress}
                />
              )}

              <IconButton
                icon={<XLg aria-hidden />}
                /* Ad dosya adini ICERIR: bir listede on bes dugme "Kaldir" diye
                   okunuyor ve hangisi oldugu belli olmuyordu. */
                label={`${file.name} — ${removeLabel}`}
                variant="ghost"
                size="sm"
                onClick={() => onRemove(file.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {children}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(FileUpload, 'FileUpload'),
) as typeof FileUpload;
