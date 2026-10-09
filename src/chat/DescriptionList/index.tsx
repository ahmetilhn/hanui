import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type DescriptionItem = {
  term: ReactNode;
  description: ReactNode;
  /** Değer teknik bir kimlik (kod, yol, karma): teknik fontta ve satır içinde bölünebilir. */
  isTechnical?: boolean;
};

type Props = {
  items: DescriptionItem[];
  className?: string;
  testId?: string;
};

/** Terim–değer listesi — yerel `<dl>`; ekran okuyucu terimi değeriyle birlikte okur. */
const DescriptionList: FC<Props> = ({ items, className, testId }) => (
  <dl className={cx(styles.list, className)} data-testid={testId}>
    {items.map((item, index) => (
      <div key={index} className={styles.list__row}>
        <dt className={styles.list__term}>{item.term}</dt>
        <dd
          className={cx(styles.list__value, item.isTechnical && styles['list__value--technical'])}
        >
          {item.description}
        </dd>
      </div>
    ))}
  </dl>
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(DescriptionList, 'DescriptionList'),
) as typeof DescriptionList;
