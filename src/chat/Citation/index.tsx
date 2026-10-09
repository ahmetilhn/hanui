'use client';

import { type FC, memo } from 'react';

import { useHanui } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveFormatter } from '../../helpers/label.helper';

import styles from './index.module.scss';

type Props = {
  /** Kaynağın numarası — `SourceList`teki sırayla eşleşir (1'den başlar). */
  index: number;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * Metin içi atıf — "[3]". Okunan adı `labels.chat.citation(3)` ("Kaynak 3"): görünen rakam tek
 * başına ekran okuyucuda "üç" diye, bağlamsız okunuyordu.
 */
const Citation: FC<Props> = ({ index, href, onClick, className }) => {
  const { labels } = useHanui();
  const name = resolveFormatter('Citation.label', labels?.chat?.citation, index);

  if (href)
    return (
      <a className={cx(styles.citation, className)} href={href} aria-label={name}>
        {index}
      </a>
    );

  if (onClick)
    return (
      <button
        type="button"
        className={cx(styles.citation, className)}
        onClick={onClick}
        aria-label={name}
      >
        {index}
      </button>
    );

  /* Etkileşimsiz: rolü olmayan öğeye `aria-label` verilemez — ad gizli metin, rakam görsel. */
  return (
    <span className={cx(styles.citation, styles['citation--static'], className)}>
      <span aria-hidden>{index}</span>
      <span className={styles.citation__srOnly}>{name}</span>
    </span>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Citation, 'Citation')) as typeof Citation;
