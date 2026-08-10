'use client';

import { type FC, type MouseEvent, type ReactNode, memo, useEffect, useMemo, useRef } from 'react';

import { CaretLeftFill, CaretRightFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { scrollWindowToTop } from '../../helpers/scroll.helper';
import useAnnounce from '../../hooks/useAnnounce';
import { useHanui } from '../../theme/context';
import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import Button from '../Button';
import IconButton from '../IconButton';
import HanuiLink from '../Link';

import styles from './index.module.scss';

type BaseProps = {
  page: number;
  totalPages: number;
  /** Gezinme bölgesinin erişilebilir adı. Verilmezse `labels.pagination.label`. */
  label?: string;
  /** Verilmezse `labels.pagination.previous`. */
  previousLabel?: string;
  /** Verilmezse `labels.pagination.next`. */
  nextLabel?: string;
  /**
   * Sayfa değiştiğinde ekran okuyucuya duyurulacak metin
   * ("3. sayfa · 1.248 sonuç").
   */
  formatAnnouncement?: (page: number, totalPages: number) => string;
  /**
   * Sayfa değiştiren bir tıklamadan sonra kaydırma. `'top'` verilirse pencere
   * en üste alınır — çağıran tarafta kaydırma kodu yazılmaz.
   */
  scrollTo?: 'top';
  className?: string;
  testId?: string;
};

type LinkProps = BaseProps & {
  /** Sayfa numarasının adresini üretir. */
  buildHref: (page: number) => string;
  onPageChange?: never;
  /** Yönlendiriciye geçirilecek ek props (`{ scroll: false }` gibi). */
  linkProps?: HanuiLinkExtraProps;
};

type ButtonProps = BaseProps & {
  /** Sayfa değişimi adres çubuğu YERİNE buraya bildirilir. */
  onPageChange: (page: number) => void;
  buildHref?: never;
  linkProps?: never;
};

type Props = LinkProps | ButtonProps;

/** Kenarlarda 1 ve son sayfa her zaman gorunur; arasi kisaltilir. */
const buildPageList = (page: number, totalPages: number): (number | 'gap')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);

  const sorted = [...pages].sort((left, right) => left - right);
  const pagesWithGaps: (number | 'gap')[] = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) pagesWithGaps.push('gap');
    pagesWithGaps.push(value);
  });

  return pagesWithGaps;
};

/** Sayfalama. */
const Pagination: FC<Props> = ({
  page,
  totalPages,
  label,
  previousLabel,
  nextLabel,
  buildHref,
  onPageChange,
  linkProps,
  formatAnnouncement,
  scrollTo,
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const announce = useAnnounce();

  /*
   * Sayfa DEGISTIGINDE duyurulur, ilk cizimde degil: acilista "1. sayfa"
   * demek, kullanicinin sormadigi bir soruyu cevaplamak ve ekran okuyucunun
   * sayfa basligini okumasini kesmek olurdu.
   */
  const previousPage = useRef(page);

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;

    if (formatAnnouncement) announce(formatAnnouncement(page, totalPages));
  }, [page, totalPages, formatAnnouncement, announce]);
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  /* Sayfa GERCEKTEN degistiyse kaydirilir: etkin sayfaya basmak icerigi
     degistirmiyor, oyleyse gorunumu de degistirmemeli. */
  const scrollAfterChange = (target: number) => {
    if (scrollTo === 'top' && target !== page) scrollWindowToTop();
  };

  const goTo = (target: number) => {
    if (!onPageChange) return;

    onPageChange(target);
    scrollAfterChange(target);
  };

  const extraOnClick = linkProps?.onClick as
    ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;

  /*
   * Yeni sekmede acan tiklamada (orta tus, Ctrl/Cmd) MEVCUT sayfa yerinde
   * kalir; onu basa almak kullanicinin okudugu yeri elinden almak olurdu.
   */
  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, target: number) => {
    extraOnClick?.(event);

    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    scrollAfterChange(target);
  };

  /*
   * Baglanti kipinde oklar da BAGLANTIDIR. Eskiden ikisi de `goTo` cagiran
   * birer dugmeydi ve `goTo` o kipte `onPageChange` olmadigi icin hicbir sey
   * yapmiyordu: onceki/sonraki tuslari OLU tuslardi, hicbir katman uyarmiyordu.
   * Sinirda baglanti degil devre disi dugme cizilir — bir `<a>` devre disi
   * birakilamaz.
   */
  const renderArrow = (target: number, arrowLabel: string, icon: ReactNode) => {
    const isDisabled = target < 1 || target > totalPages;

    if (buildHref && !isDisabled)
      return (
        <HanuiLink
          href={buildHref(target)}
          className={styles.pagination__arrow}
          aria-label={arrowLabel}
          {...linkProps}
          onClick={event => handleLinkClick(event, target)}
        >
          {icon}
        </HanuiLink>
      );

    return (
      <IconButton
        className={styles.pagination__arrow}
        icon={icon}
        label={arrowLabel}
        variant="outline"
        disabled={isDisabled}
        onClick={() => goTo(target)}
      />
    );
  };

  return (
    <nav
      className={cx(styles.pagination, className)}
      aria-label={resolveLabel('Pagination.label', label, labels?.pagination?.label)}
      data-testid={testId}
    >
      {renderArrow(
        page - 1,
        resolveLabel('Pagination.previousLabel', previousLabel, labels?.pagination?.previous),
        <CaretLeftFill aria-hidden />,
      )}

      <ul className={styles.pagination__list}>
        {pages.map((value, index) =>
          value === 'gap' ? (
            <li key={`gap-${index}`} className={styles.pagination__gap} aria-hidden>
              …
            </li>
          ) : (
            <li key={value}>
              {buildHref ? (
                <HanuiLink
                  href={buildHref(value)}
                  className={cx(
                    styles.pagination__page,
                    value === page && styles['pagination__page--active'],
                  )}
                  aria-current={value === page ? 'page' : undefined}
                  {...linkProps}
                  onClick={event => handleLinkClick(event, value)}
                >
                  {value}
                </HanuiLink>
              ) : (
                <Button
                  variant={UIVariant.SECONDARY}
                  size={UISize.SMALL}
                  className={cx(
                    styles.pagination__page,
                    value === page && styles['pagination__page--active'],
                  )}
                  aria-current={value === page ? 'page' : undefined}
                  onClick={() => goTo(value)}
                >
                  {value}
                </Button>
              )}
            </li>
          ),
        )}
      </ul>

      {renderArrow(
        page + 1,
        resolveLabel('Pagination.nextLabel', nextLabel, labels?.pagination?.next),
        <CaretRightFill aria-hidden />,
      )}
    </nav>
  );
};

export default /*#__PURE__*/ memo(Pagination) as typeof Pagination;
