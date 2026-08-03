import { forwardRef, type InputHTMLAttributes, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/*
 * `prefix` HTML'in RDFa nitelikleri arasinda yer alir ve React onu `string`
 * olarak tanimlar. Kaldirilmazsa kendi `ReactNode` tanimimizla kesisip
 * `string & ReactNode` uretiyor ve ikon vermeyi imkansiz kiliyordu.
 */
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  /** Solda gösterilen ikon veya ön ek (arama simgesi, para birimi). */
  prefix?: ReactNode;
  /** Sağda gösterilen ikon veya birim (göz simgesi, "kg"). */
  suffix?: ReactNode;
  /** Teknik veri: SKU, kod, seri numarası — monospace ve harf aralıklı. */
  isTechnical?: boolean;
  testId?: string;
};

/**
 * Metin girdisi.
 *
 * <p>Ön ek / son ek girdinin <em>içinde</em> konumlanır; girdinin yanına ayrı
 * bir kutu koymak hizalamayı bozar ve odak halkasını ikiye böler.
 *
 * <p>Odak halkası sarmalayıcıda değil girdinin kendisinde: sarmalayıcıya
 * verildiğinde `:focus-visible` klavye/fare ayrımını kaybediyordu.
 */
const Input = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ prefix, suffix, isTechnical, className, testId, ...rest }, ref) => (
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
          /* `Boolean(...)`: `prefix` bir `ReactNode` ve `0` da gecerli bir
             deger — `prefix &&` ifadesi o durumda dize degil sayi donuyordu. */
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
