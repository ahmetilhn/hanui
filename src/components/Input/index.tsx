import {
  forwardRef,
  type InputHTMLAttributes,
  memo,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/*
 * `prefix` HTML'in RDFa nitelikleri arasinda yer alir ve React onu `string` olarak tanimlar.
 * `size` yerel ozellikte karakter genisligi (`number`); burada olcu adi — genislik CSS'ten gelir.
 */
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> & {
  /** Solda gösterilen ikon veya ön ek (arama simgesi, para birimi). */
  prefix?: ReactNode;
  /** Sağda gösterilen ikon veya birim (göz simgesi, "kg"). */
  suffix?: ReactNode;
  /** Teknik veri: */
  isTechnical?: boolean;
  /** `sm` yoğun şeritler içindir (araç çubuğu, `Select size="sm"` yanında); varsayılan form ölçüsü `md`. */
  size?: 'sm' | 'md';
  testId?: string;
};

/** `useLayoutEffect` sunucuda uyarı basar; orada etkisiz bir eşdeğer. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? () => {} : useLayoutEffect;

/** Metin girdisi. */
const Input = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ prefix, suffix, isTechnical, size = 'md', className, testId, ...rest }, ref) => {
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const prefixRef = useRef<HTMLSpanElement>(null);
    const suffixRef = useRef<HTMLSpanElement>(null);
    /*
     * `Boolean(...)`: `prefix` bir `ReactNode` ve `0` da gecerli bir deger — `prefix &&`
     * ifadesi o durumda dize degil sayi donuyordu.
     */
    const hasPrefix = Boolean(prefix);
    const hasSuffix = Boolean(suffix);

    /*
     * Onek/sonekin genisligi olculup sarmalayiciya yazilir; girdinin ic payi buradan hesaplanir
     * (`--hasPrefix`). Boyamadan once olculur, icerik ya da yazi tipi degisince `ResizeObserver`
     * yeniden yazar. Olcum yokken (sunucu cizimi, jsdom) CSS ikon olcusunu varsayar.
     */
    useIsomorphicLayoutEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return undefined;
      const slots = [
        [prefixRef, '--hanui-input-prefix-width'],
        [suffixRef, '--hanui-input-suffix-width'],
      ] as const;
      const write = () => {
        for (const [slot, property] of slots) {
          const width = slot.current?.getBoundingClientRect().width ?? 0;
          if (width > 0) wrapper.style.setProperty(property, `${Math.ceil(width)}px`);
          else wrapper.style.removeProperty(property);
        }
      };
      write();
      if (typeof ResizeObserver === 'undefined') return undefined;
      const observer = new ResizeObserver(write);
      for (const [slot] of slots) if (slot.current) observer.observe(slot.current);
      return () => observer.disconnect();
    }, [hasPrefix, hasSuffix]);

    return (
      <span ref={wrapperRef} className={cx(styles.wrapper, className)}>
        {hasPrefix && (
          <span ref={prefixRef} className={styles.wrapper__prefix} aria-hidden>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={cx(
            styles.input,
            size === 'sm' && styles['input--sm'],
            hasPrefix && styles['input--hasPrefix'],
            hasSuffix && styles['input--hasSuffix'],
            isTechnical && styles['input--technical'],
          )}
          data-testid={testId}
          {...rest}
        />
        {hasSuffix && (
          <span ref={suffixRef} className={styles.wrapper__suffix} aria-hidden>
            {suffix}
          </span>
        )}
      </span>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Input, 'Input')) as typeof Input;
