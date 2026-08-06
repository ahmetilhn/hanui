import { forwardRef, type InputHTMLAttributes, memo, type ReactNode } from 'react';

import { isDefined } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  hint?: string;
  /** Sağda gösterilen sonuç adedi (filtre listelerinde). */
  count?: number;
  testId?: string;
};

/** Radyo düğmesi. */
const Radio = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ label, hint, count, className, testId, ...rest }, ref) => (
    <label className={cx(styles.radio, className)} data-testid={testId}>
      <input ref={ref} type="radio" className={styles.radio__input} {...rest} />
      <span className={styles.radio__body}>
        <span className={styles.radio__label}>{label}</span>
        {hint && <span className={styles.radio__hint}>{hint}</span>}
      </span>
      {isDefined(count) && <span className={styles.radio__count}>{count}</span>}
    </label>
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Radio, 'Radio')) as typeof Radio;
