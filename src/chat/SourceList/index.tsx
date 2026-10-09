'use client';

import { type FC, memo } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import styles from './index.module.scss';

export type SourceItem = {
  id: string;
  title: string;
  /** Dış kaynak — yeni sekmede açılır. */
  url?: string;
  /** Kaynağın alan adı ("tr.wikipedia.org") — başlığın altında. */
  domain?: string;
  /** Uygulama içinde açılan kaynak (yan panel, kip pencere). `url` ile birlikte verilmez. */
  onSelect?: () => void;
};

type Props = {
  items: SourceItem[];
  /** Listenin adı; verilmezse `labels.chat.sources`. */
  label?: string;
  className?: string;
  testId?: string;
};

/**
 * Yanıtın kaynakları — numaralı liste; numara yanıttaki `Citation` ile eşleşir.
 * Dış bağlantı yeni sekmede açılır ve `noopener` taşır; uygulama içi kaynak bir düğmedir.
 */
const SourceList: FC<Props> = ({ items, label, className, testId }) => {
  const { labels } = useHanui();

  return (
    <ol
      className={cx(styles.list, className)}
      aria-label={resolveLabel('SourceList.label', label, labels?.chat?.sources)}
      data-testid={testId}
    >
      {items.map((item, index) => (
        <li key={item.id} className={styles.list__item}>
          <span className={styles.list__index} aria-hidden>
            {index + 1}
          </span>
          <span className={styles.list__text}>
            {item.url ? (
              <a
                className={styles.list__title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            ) : item.onSelect ? (
              <button type="button" className={styles.list__title} onClick={item.onSelect}>
                {item.title}
              </button>
            ) : (
              <span className={styles.list__plain}>{item.title}</span>
            )}
            {item.domain && <span className={styles.list__domain}>{item.domain}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(SourceList, 'SourceList'),
) as typeof SourceList;
