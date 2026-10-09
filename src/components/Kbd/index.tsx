import { type FC, type HTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Basılacak tuşlar, sırayla: `['Shift', 'Enter']`. Tek tuş da bir dizi: `['⌘K']`. */
  keys: string[];
};

/**
 * Klavye kısayolu — `<kbd>` içinde her tuş kendi `<kbd>`si (HTML'in birleşik tuş deseni).
 * Ekran okuyucu "Shift artı Enter" diye okur; yalnızca görsel bir ipucuysa `aria-hidden` geçin.
 */
const Kbd: FC<Props> = ({ keys, className, ...rest }) => (
  <kbd className={cx(styles.kbd, className)} {...rest}>
    {keys.map((key, index) => (
      <span key={`${key}-${index}`} className={styles.kbd__group}>
        {index > 0 && <span className={styles.kbd__joiner}>+</span>}
        <kbd className={styles.kbd__key}>{key}</kbd>
      </span>
    ))}
  </kbd>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Kbd, 'Kbd')) as typeof Kbd;
