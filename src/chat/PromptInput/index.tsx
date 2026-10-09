'use client';

import { forwardRef, type KeyboardEvent, memo, type ReactNode, useEffect } from 'react';

import { ArrowUp, StopFill } from 'react-bootstrap-icons';

import { hasOpenSurface, IconButton, Textarea, useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Enter ya da gönder düğmesi. Boş (yalnızca boşluk) metinde çağrılmaz. */
  onSubmit: () => void;
  /** Akışı durdurur — `isBusy` iken düğme ve `Escape`. */
  onStop?: () => void;
  /** Yanıt akıyor: gönder yerine durdur düğmesi. */
  isBusy?: boolean;
  /** Alanın tamamı pasif — yazılamaz. */
  isDisabled?: boolean;
  /**
   * Yazmaya izin var ama GÖNDERİM kapalı (bağlantı yok, oturum hazırlanıyor). Kullanıcı mesajını
   * yazabilir; gönder düğmesi ve `Enter` bekler.
   */
  isSubmitDisabled?: boolean;
  /** Yer tutucu — çağrı yerine ÖZGÜ metin, `labels`a girmez. */
  placeholder: string;
  /** Alanın erişilebilir adı; verilmezse yer tutucu. */
  label?: string;
  /** Otomatik büyümenin tavanı (satır). */
  maxRows?: number;
  /** Alanın altındaki ipucu satırı (`Kbd` ile kısayollar). */
  hint?: ReactNode;
  /** Alanın solunda (ek dosya, model seçici). */
  start?: ReactNode;
  /** Gönder düğmesinin solunda. */
  end?: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * Sohbet yazma alanı — çerçevesiz `Textarea` + yuvarlak gönder / durdur düğmesi.
 *
 * Klavye: `Enter` gönderir · `Shift+Enter` yeni satır · `Escape` (akış sürerken) durdurur.
 * - ⚠ IME yazımı sırasında (`isComposing`, Türkçe dışı klavyeler) `Enter` GÖNDERMEZ: harf seçimini
 *   onaylıyor, mesajı değil.
 * - ⚠ `Escape` açık bir yüzey (modal, menü, bildirim) varken DOKUNMAZ (`hasOpenSurface`): kullanıcı
 *   yalnızca o yüzeyi kapatmak istiyordu, arkadaki akış da duruyordu.
 * - Gönder düğmesi ekranın TEK birincil eylemi: çam dolgu, koyu temada mint sınır.
 * - Odak göstergesini çerçeve çizer (`:focus-within`); alan çerçevesiz (`variant="bare"`).
 * - `ref` metin alanına iletilir: gönderimden ya da bir öneri seçildikten sonra odağı geri vermek için.
 */
const PromptInput = /*#__PURE__*/ forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      value,
      onChange,
      onSubmit,
      onStop,
      isBusy,
      isDisabled,
      isSubmitDisabled,
      placeholder,
      label,
      maxRows = 8,
      hint,
      start,
      end,
      className,
      testId,
    },
    ref,
  ) => {
    const { labels } = useHanui();
    const isEmpty = value.trim() === '';

    /* `Escape` sayfa duzeyinde: odak alanda olmasa da (bir arac kartindayken) akis durdurulabilmeli. */
    useEffect(() => {
      if (!isBusy || !onStop) return;

      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key !== 'Escape' || event.defaultPrevented || hasOpenSurface()) return;
        onStop();
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBusy, onStop]);

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

      event.preventDefault();
      if (!isEmpty && !isBusy && !isDisabled && !isSubmitDisabled) onSubmit();
    };

    return (
      <div className={cx(styles.prompt, className)} data-testid={testId}>
        <div className={cx(styles.prompt__box, isDisabled && styles['prompt__box--disabled'])}>
          {start !== undefined && <div className={styles.prompt__start}>{start}</div>}

          <Textarea
            ref={ref}
            className={styles.prompt__field}
            variant="bare"
            rows={1}
            isAutoSize
            maxRows={maxRows}
            value={value}
            placeholder={placeholder}
            aria-label={label ?? placeholder}
            disabled={isDisabled}
            onChange={event => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          {end !== undefined && <div className={styles.prompt__end}>{end}</div>}

          {isBusy ? (
            <IconButton
              icon={<StopFill aria-hidden />}
              label={resolveLabel('PromptInput.stop', labels?.chat?.stop)}
              variant="outline"
              shape="round"
              onClick={onStop}
              disabled={!onStop}
            />
          ) : (
            <IconButton
              icon={<ArrowUp aria-hidden />}
              label={resolveLabel('PromptInput.send', labels?.chat?.send)}
              variant="solid"
              shape="round"
              onClick={onSubmit}
              disabled={isEmpty || isDisabled || isSubmitDisabled}
            />
          )}
        </div>

        {hint !== undefined && <div className={styles.prompt__hint}>{hint}</div>}
      </div>
    );
  },
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(PromptInput, 'PromptInput'),
) as typeof PromptInput;
