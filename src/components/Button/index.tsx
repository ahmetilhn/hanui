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
import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import type { CommonElementProps } from '../../types/common-element-props.type';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';
import Spinner from '../Spinner';

import styles from './index.module.scss';

type BaseProps = Partial<{
  variant: UIVariant;
  size: UISize;
  isLoading: boolean;
  isFullWidth: boolean;
  startIcon: ReactNode;
  endIcon: ReactNode;
}> &
  CommonElementProps;

type Props = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Verilirse düğme bir bağlantı olarak çizilir. */
    href?: string;
    /**
     * Uygulama dışına çıkan bağlantı: yeni sekmede açılır ve yönlendirici
     * devreye girmez.
     */
    isExternal?: boolean;
    /** Yönlendiriciye geçirilecek ek props (`{ scroll: false }`, `{ replace: true }`). */
    linkProps?: HanuiLinkExtraProps;
  };

/**
 * Düğme.
 *
 * @example
 * <Button variant={UIVariant.PRIMARY} isLoading={isSaving} onClick={save}>
 * Kaydet
 * </Button>
 */
const Button = /*#__PURE__*/ forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = UIVariant.PRIMARY,
      size = UISize.MEDIUM,
      isLoading,
      isFullWidth,
      startIcon,
      endIcon,
      className,
      children,
      disabled,
      href,
      isExternal,
      linkProps,
      testId,
      ...rest
    },
    ref,
  ) => {
    const classNames = cx(
      styles.button,
      styles[`button--${variant.toLowerCase()}`],
      styles[`button--${size.toLowerCase()}`],
      isFullWidth && styles['button--full'],
      isLoading && styles['button--loading'],
      className,
    );

    const content = (
      <>
        {isLoading && <Spinner size="sm" className={styles.button__spinner} label="" />}
        {!isLoading && startIcon && <span className={styles.button__icon}>{startIcon}</span>}
        <span className={styles.button__label}>{children}</span>
        {endIcon && <span className={styles.button__icon}>{endIcon}</span>}
      </>
    );

    /*
     * ⚠ BAGLANTI DALLARI DA `...rest` YAYAR.
     *
     * Olculen ariza: tip `ButtonHTMLAttributes` oldugu icin `onClick`,
     * `aria-*`, `data-*`, `id`, `title`, `onBlur` hepsi TIP DENETIMINDEN
     * geciyordu ama yalnizca `<button>` dali onlari DOM'a yaziyordu. `<Button
     * href=... onClick={izle}>` yazan cagiran derleme hatasi almiyor, analitik
     * cagrisi hic calismiyor ve erisilebilir ad sessizce gorunen metne
     * dusuyordu. Vitrinde 14 `<Button href>` cagri yeri var.
     *
     * `disabled` bir baglantida DOM ozelligi olarak yok: `aria-disabled` +
     * tiklamayi yutmak dogru karsilik. Yukleniyorken de ayni yol — yoksa
     * "yukleniyor" gorunen bir baglanti ikinci kez gezinme baslatir.
     */
    const isInert = Boolean(disabled) || Boolean(isLoading);

    const linkGuards = {
      'aria-busy': isLoading,
      'aria-disabled': isInert || undefined,
      tabIndex: isInert ? -1 : rest.tabIndex,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        if (isInert) {
          event.preventDefault();
          return;
        }
        rest.onClick?.(event as unknown as MouseEvent<HTMLButtonElement>);
      },
    };

    if (href && isExternal)
      return (
        <a
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          {...linkGuards}
          href={href}
          className={classNames}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={testId}
        >
          {content}
        </a>
      );

    if (href)
      return (
        <HanuiLink
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          {...linkGuards}
          href={href}
          className={classNames}
          data-testid={testId}
          {...linkProps}
        >
          {content}
        </HanuiLink>
      );

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        data-testid={testId}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Button, 'Button')) as typeof Button;
