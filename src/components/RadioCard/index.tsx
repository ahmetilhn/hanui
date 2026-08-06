import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import type { CommonElementProps } from '../../types/common-element-props.type';

import styles from './index.module.scss';

type Props = {
  /** Radyo grubu adı — aynı gruptaki kartlar ok tuşlarıyla gezilir. */
  name: string;
  value: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  /** Zengin gövde: kartın içeriği çağırana aittir. */
  children: ReactNode;
} & CommonElementProps;

/** Seçilebilir kart — zengin gövdeli radyo. */
const RadioCard: FC<Props> = ({
  name,
  value,
  isSelected,
  isDisabled,
  onChange,
  children,
  className,
  id,
  testId,
}) => (
  <label
    className={cx(
      styles.radioCard,
      isSelected && styles['radioCard--selected'],
      isDisabled && styles['radioCard--disabled'],
      className,
    )}
    data-testid={testId}
  >
    <input
      type="radio"
      id={id}
      name={name}
      value={value}
      checked={isSelected}
      disabled={isDisabled}
      onChange={() => onChange(value)}
      className={styles.radioCard__input}
    />
    <span className={styles.radioCard__indicator} aria-hidden />
    <span className={styles.radioCard__body}>{children}</span>
  </label>
);

export default /*#__PURE__*/ memo(RadioCard) as typeof RadioCard;
