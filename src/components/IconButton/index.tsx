'use client';

import { type ButtonHTMLAttributes, forwardRef, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

export type IconButtonVariant = 'ghost' | 'outline' | 'solid' | 'cart' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  /** Görsel etiketi olmayan düğmenin erişilebilir adı — ZORUNLU. */
  label: string;
  /**
   * `cart` <strong>yalnızca dönüşüm eyleminde</strong> kullanılır — ekranda
   * görünen tek doygun turuncu odur. Nötr dolgu için `solid`.
   */
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  /** Verilirse öğe bir bağlantı olarak çizilir. */
  href?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  testId?: string;
};

/** Yalnızca ikon taşıyan düğme. */
const IconButton = /*#__PURE__*/ forwardRef<HTMLButtonElement, Props>(
  (
    {
      icon,
      label,
      variant = 'ghost',
      size = 'md',
      className,
      type = 'button',
      href,
      linkProps,
      testId,
      ...rest
    },
    ref,
  ) => {
    const classNames = cx(
      styles.iconButton,
      styles[`iconButton--${variant}`],
      styles[`iconButton--${size}`],
      className,
    );

    if (href)
      return (
        <HanuiLink
          href={href}
          className={classNames}
          aria-label={label}
          title={rest.title}
          data-testid={testId}
          {...linkProps}
        >
          {icon}
        </HanuiLink>
      );

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        aria-label={label}
        data-testid={testId}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(IconButton, 'IconButton'),
) as typeof IconButton;
