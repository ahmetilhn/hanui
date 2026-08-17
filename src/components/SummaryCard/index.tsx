import { type ElementType, type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

export type SummaryCardHeadingLevel = 2 | 3 | 4;

type Props = {
  /** Kart başlığı — aynı zamanda bağlantı metni. */
  title: string;
  href: string;
  /** Başlığın altındaki 1-2 cümlelik özet. */
  description?: string;
  /** Alt meta satırı: rozetler, fiyat aralığı, sayaç. */
  meta?: ReactNode;
  /** Sol madalyon: ikon ya da küçük medya. */
  media?: ReactNode;
  /** Liste bağlamındaki başlık seviyesi. */
  headingLevel?: SummaryCardHeadingLevel;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  className?: string;
  testId?: string;
};

/**
 * Özet kartı — başlık + kısa açıklama + meta satırı taşıyan BAĞLANTILI kart.
 *
 * Kartın tamamı tıklanır ama sekme durağı TEKTİR: bağlantı başlıktadır,
 * yüzeyi `::after` katmanı kaplar. `meta` satırı katmanın ÜSTÜNDE durur —
 * içine konan çip/rozet tıklamaları kart bağlantısına düşmez.
 */
const SummaryCard: FC<Props> = ({
  title,
  href,
  description,
  meta,
  media,
  headingLevel = 3,
  linkProps,
  className,
  testId,
}) => {
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <article className={cx(styles.card, className)} data-testid={testId}>
      {media && (
        <span className={styles.card__media} aria-hidden>
          {media}
        </span>
      )}

      <div className={styles.card__content}>
        <Heading className={styles.card__title}>
          <HanuiLink href={href} className={styles.card__link} {...linkProps}>
            {title}
          </HanuiLink>
        </Heading>

        {description && <p className={styles.card__description}>{description}</p>}

        {meta && <div className={styles.card__meta}>{meta}</div>}
      </div>
    </article>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(SummaryCard, 'SummaryCard'),
) as typeof SummaryCard;
