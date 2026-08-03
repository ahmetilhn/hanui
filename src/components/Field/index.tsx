import { type FC, memo, type ReactNode, useId } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import { ExclamationCircleIcon } from '../../icons';

import styles from './index.module.scss';

/** Girdiye yayılacak erişilebilirlik bağları. */
export type FieldChildProps = {
  id: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  required?: boolean;
};

type BaseProps = {
  label: string;
  /** Girdi bileşenini alan `id` ve `aria-*` bağlarıyla üretir. */
  children: (props: FieldChildProps) => ReactNode;
  hint?: string;
  error?: string;
  /** Etiketi gizler ama ekran okuyucuya bırakır (arama kutusu gibi). */
  isLabelHidden?: boolean;
  className?: string;
};

type Props = BaseProps & {
  isRequired?: boolean;
  /**
   * Zorunluluk yıldızının ekran okuyucu karşılığı ("(zorunlu)").
   *
   * <p>Yıldız yalnızca GÖRSEL bir kısayol; renk ve şekil tek başına anlam
   * taşıyamaz (WCAG 1.4.1), o yüzden yanında okunabilir bir metin olmak
   * zorunda. Verilmezse `labels.required` okunur.
   */
  requiredLabel?: string;
};

/**
 * Form alanı sarmalayıcısı.
 *
 * <h3>Neden render-prop</h3>
 * Etiket, hata mesajı ve yardım metni girdiye `id` / `aria-describedby` /
 * `aria-invalid` ile <strong>bağlanmak zorunda</strong> — yoksa ekran okuyucu
 * hatayı okumaz. Bu bağları her form alanında elle yazmak kaçınılmaz olarak
 * bir yerde atlanıyor.
 *
 * <p>Render-prop kalıbı bağları bileşene ürettirir: çağıran taraf yalnızca
 * aldığı props'ları girdiye yayar ve erişilebilirlik kendiliğinden doğru olur.
 *
 * <p>Hata varken yardım metni gösterilmez: ikisi birlikte gürültü yapar ve
 * kullanıcının okuması gereken mesaj kaybolur.
 *
 * @example
 * <Field label="E-posta" isRequired requiredLabel="(zorunlu)" error={emailError}>
 *   {props => <Input {...props} type="email" value={email} onChange={onChange} />}
 * </Field>
 *
 * @example
 * // `{...props}` yaymayan bileşenlerde (Combobox, Select) yalnızca `id`:
 * <Field label="Şehir">{props => <Combobox id={props.id} … />}</Field>
 */
const Field: FC<Props> = ({
  label,
  children,
  hint,
  error,
  isRequired,
  requiredLabel,
  isLabelHidden,
  className,
}) => {
  const { labels } = useHanui();
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cx(styles.field, className)}>
      <label
        htmlFor={id}
        className={cx(styles.field__label, isLabelHidden && styles['field__label--hidden'])}
      >
        {label}
        {isRequired && (
          <>
            <span className={styles.field__required} aria-hidden>
              *
            </span>
            <span className={styles.field__srOnly}>
              {resolveLabel('Field.requiredLabel', requiredLabel, labels?.required)}
            </span>
          </>
        )}
      </label>

      {children({
        id,
        required: isRequired || undefined,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}

      {error ? (
        <p id={errorId} className={styles.field__error} role="alert">
          <ExclamationCircleIcon />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.field__hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export default memo(Field) as typeof Field;
