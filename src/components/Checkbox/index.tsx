import { forwardRef, type InputHTMLAttributes, memo, type ReactNode, useId } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  /** Etiketin altındaki açıklama; `aria-describedby` ile bağlanır. */
  hint?: string;
  testId?: string;
};

/** Onay kutusu. */
const Checkbox = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ label, hint, className, id, testId, ...rest }, ref) => {
    /* ⚠ İpucu ADA değil AÇIKLAMAYA bağlanır — gerekçe `Switch`te yazılı. */
    const generatedId = useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;

    return (
      <label className={cx(styles.checkbox, className)} data-testid={testId}>
        <input
          ref={ref}
          type="checkbox"
          id={baseId}
          className={styles.checkbox__input}
          aria-labelledby={labelId}
          aria-describedby={hint ? hintId : rest['aria-describedby']}
          {...rest}
        />
        <span className={styles.checkbox__body}>
          <span id={labelId} className={styles.checkbox__label}>
            {label}
          </span>
          {hint && (
            <span id={hintId} className={styles.checkbox__hint}>
              {hint}
            </span>
          )}
        </span>
      </label>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Checkbox, 'Checkbox')) as typeof Checkbox;
