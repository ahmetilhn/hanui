'use client';

import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  forwardRef,
  memo,
  type MouseEvent,
  type ReactNode,
} from 'react';

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

    /*
     * ⚠ BAGLANTI DALI DA `...rest` YAYAR — `Button` ile ayni ariza.
     *
     * Onceki bicim yalnizca `href`/`className`/`aria-label`/`title`/`testId`
     * iletiyordu; `onClick`, `disabled`, `id`, `aria-current`, `data-*` ve
     * iletilen `ref` sessizce dusuyordu. `<IconButton href="/ayarlar"
     * onClick={cekmeceyiKapat} />` geziniyor ama cekmeceyi kapatmiyordu.
     */
    const isInert = Boolean(rest.disabled);

    if (href)
      return (
        <HanuiLink
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={href}
          className={classNames}
          aria-label={label}
          aria-disabled={isInert || undefined}
          tabIndex={isInert ? -1 : rest.tabIndex}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (isInert) {
              event.preventDefault();
              return;
            }
            rest.onClick?.(event as unknown as MouseEvent<HTMLButtonElement>);
          }}
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
