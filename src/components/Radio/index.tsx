import { forwardRef, type InputHTMLAttributes, memo, type ReactNode, useId } from 'react';

import { isDefined } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  /** Etiketin altındaki açıklama; `aria-describedby` ile bağlanır. */
  hint?: string;
  /** Sağda gösterilen sonuç adedi (filtre listelerinde). */
  count?: number;
  testId?: string;
};

/** Radyo düğmesi. */
const Radio = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ label, hint, count, className, id, testId, ...rest }, ref) => {
    /* ⚠ İpucu ADA değil AÇIKLAMAYA bağlanır — gerekçe `Switch`te yazılı. */
    const generatedId = useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const countId = `${baseId}-count`;

    return (
      <label className={cx(styles.radio, className)} data-testid={testId}>
        <input
          ref={ref}
          type="radio"
          id={baseId}
          className={styles.radio__input}
          /*
           * Sayaç ADIN İÇİNDE KALIR ("Disk Balata, 128"): filtre listesinde
           * kaç sonuç olduğu seçimin bir parçası. Değişen tek şey `hint`.
           */
          aria-labelledby={[labelId, isDefined(count) ? countId : null].filter(Boolean).join(' ')}
          aria-describedby={hint ? hintId : rest['aria-describedby']}
          {...rest}
        />
        <span className={styles.radio__body}>
          <span id={labelId} className={styles.radio__label}>
            {label}
          </span>
          {hint && (
            <span id={hintId} className={styles.radio__hint}>
              {hint}
            </span>
          )}
        </span>
        {isDefined(count) && (
          <span id={countId} className={styles.radio__count}>
            {count}
          </span>
        )}
      </label>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Radio, 'Radio')) as typeof Radio;
