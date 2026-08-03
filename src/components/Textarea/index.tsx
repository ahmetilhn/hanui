'use client';

import {
  forwardRef,
  memo,
  type TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /**
   * Alan içeriğiyle birlikte BÜYÜR — kaydırma çubuğu yerine yükseklik.
   *
   * <p>Sabit yükseklikli bir alanda kullanıcı yazdığının tamamını göremiyor:
   * dört satırlık bir kutuya on satır yazan kişi, gönderdiğinde ne yazdığını
   * kontrol etmek için kutunun içinde kaydırmak zorunda kalıyordu. `maxRows`
   * ile tavan konur; ötesinde kaydırma geri döner (sayfa boyunca uzayan bir
   * alan, altındaki gönder düğmesini ekrandan çıkarıyordu).
   */
  isAutoSize?: boolean;
  /** Otomatik büyümenin tavanı (satır). */
  maxRows?: number;
  /**
   * Kalan karakter sayacını gösterir. `maxLength` ile birlikte anlamlı.
   *
   * <p>Sayaç `aria-hidden`: aynı bilgi her tuşta duyurulsaydı yazma
   * kesintiye uğrardı. Sınıra YAKLAŞILDIĞINDA (son %10) sayaç uyarı tonuna
   * geçiyor — sınıra çarpıp yazamamak, yaklaştığını görmemekten kötü.
   */
  hasCounter?: boolean;
  testId?: string;
};

/**
 * Çok satırlı metin girdisi.
 *
 * <p>Görünüm {@link Input} ile aynı gövdeden gelir: bir formda tek satırlı ve
 * çok satırlı alanlar yan yana durur, kenarlık ve odak davranışları ayrışırsa
 * form derlenmemiş görünür.
 *
 * <p>Yeniden boyutlandırma yalnızca <strong>dikey</strong>: yatayda büyütmek
 * alanı kapsayıcısının dışına taşırıp yerleşimi bozuyordu.
 *
 * <h3>Otomatik yükseklik neden CSS ile değil</h3>
 * `field-sizing: content` bu işi tek satırda yapıyor ama bugün yalnızca
 * Chromium'da var. Ölçüm yolu her yerde çalışıyor ve tarayıcı desteği
 * geldiğinde tek dosyada değiştirilecek.
 */
const Textarea = /*#__PURE__*/ forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      className,
      rows = 4,
      isAutoSize,
      maxRows = 12,
      hasCounter,
      maxLength,
      value,
      defaultValue,
      onChange,
      testId,
      ...rest
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    /*
     * KONTROLLU kipte uzunluk `value`dan OKUNUR, ic durumdan degil.
     *
     * Sayac yalnizca `onChange` ile guncelleniyordu: disaridan gelen her deger
     * degisimi (profilden on doldurma, form sifirlama, tasklaktan gelen taslak)
     * sayaci ESKI sayida birakiyordu. Kullanici 400 karakterlik bir metni
     * yukleyip "12 / 500" okuyordu.
     */
    const [innerLength, setLength] = useState(String(defaultValue ?? '').length);
    const length = value === undefined ? innerLength : String(value).length;

    /* Cagiranin `ref`i ile ic olcum referansini birlikte tut: `useImperativeHandle`
       yalnizca bir nesne dondurur ve DOM dugumunun kendisini gizlerdi. */
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    /*
     * OLCUM BOYAMADAN ONCE: `useEffect` ile alan bir kare boyunca eski
     * yuksekligiyle cizilip sonra ziplyordu.
     *
     * `height: auto` ONCE yazilir — yoksa `scrollHeight` bir onceki (buyuk)
     * yuksekligi raporluyor ve alan bir daha hic kucumuyordu.
     */
    useLayoutEffect(() => {
      const node = innerRef.current;
      if (!isAutoSize || !node) return;

      node.style.height = 'auto';

      const lineHeight = Number.parseFloat(getComputedStyle(node).lineHeight) || 20;
      const max = lineHeight * maxRows;

      node.style.height = `${Math.min(node.scrollHeight, max)}px`;
      node.style.overflowY = node.scrollHeight > max ? 'auto' : 'hidden';
    }, [isAutoSize, maxRows, value, length]);

    const isNearLimit = maxLength !== undefined && length >= maxLength * 0.9;

    return (
      <div className={cx(styles.wrapper, className)} data-testid={testId}>
        <textarea
          ref={setRefs}
          rows={rows}
          className={cx(styles.textarea, isAutoSize && styles['textarea--autoSize'])}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={event => {
            setLength(event.target.value.length);
            onChange?.(event);
          }}
          {...rest}
        />

        {hasCounter && maxLength !== undefined && (
          /* `aria-hidden`: ayni bilgi her tusta duyurulsaydi yazma kesintiye
             ugrardi. Sinir zaten `maxLength` ile taniniyor. */
          <span
            className={cx(styles.counter, isNearLimit && styles['counter--near'])}
            aria-hidden
          >
            {length} / {maxLength}
          </span>
        )}
      </div>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Textarea, 'Textarea')) as typeof Textarea;
