import { forwardRef, type InputHTMLAttributes, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  hint?: string;
  testId?: string;
};

/**
 * Onay kutusu.
 *
 * <p>Yerel `<input type="checkbox">` korunur ve `accent-color` ile
 * renklendirilir. Özel bir kutu çizmek (gizli input + sahte kare) klavye
 * odağını ve ekran okuyucu davranışını elle yeniden kurmayı gerektirir;
 * kazanç görsel, maliyet erişilebilirlik.
 *
 * <p>Tüm satır tıklanabilir (`<label>` sarmalar): 18 px'lik kareyi
 * hedeflemek özellikle dokunmatik ekranda yorucu.
 */
const Checkbox = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ label, hint, className, testId, ...rest }, ref) => (
    <label className={cx(styles.checkbox, className)} data-testid={testId}>
      <input ref={ref} type="checkbox" className={styles.checkbox__input} {...rest} />
      <span className={styles.checkbox__body}>
        <span className={styles.checkbox__label}>{label}</span>
        {hint && <span className={styles.checkbox__hint}>{hint}</span>}
      </span>
    </label>
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Checkbox, 'Checkbox')) as typeof Checkbox;
