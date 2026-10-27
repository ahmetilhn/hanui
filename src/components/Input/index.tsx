import { forwardRef, type InputHTMLAttributes, memo, type ReactNode } from 'react';

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

/** Metin girdisi. */
const Input = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ prefix, suffix, isTechnical, size = 'md', className, testId, ...rest }, ref) => (
    <span className={cx(styles.wrapper, className)}>
      {prefix && (
        <span className={styles.wrapper__prefix} aria-hidden>
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={cx(
          styles.input,
          size === 'sm' && styles['input--sm'],
          /*
           * `Boolean(...)`: `prefix` bir `ReactNode` ve `0` da gecerli bir deger — `prefix &&`
           * ifadesi o durumda dize degil sayi donuyordu.
           */
          Boolean(prefix) && styles['input--hasPrefix'],
          Boolean(suffix) && styles['input--hasSuffix'],
          isTechnical && styles['input--technical'],
        )}
        data-testid={testId}
        {...rest}
      />
      {suffix && (
        <span className={styles.wrapper__suffix} aria-hidden>
          {suffix}
        </span>
      )}
    </span>
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Input, 'Input')) as typeof Input;
