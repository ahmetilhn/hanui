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

/**
 * Yalnızca ikon taşıyan düğme.
 *
 * <p>`label` <strong>zorunlu</strong>: görsel etiketi olmayan bir düğme
 * `aria-label` olmadan ekran okuyucuda "düğme" diye okunur. Zorunlu tutmak,
 * unutulmasını derleme zamanında engeller.
 *
 * <p>Dokunma hedefi 44×44 px'ten küçük olamaz (WCAG 2.5.8) — görsel kutu daha
 * küçük olsa bile tıklanabilir alan korunur.
 *
 * <h3>`href` verilince `<a>` çizilir</h3>
 * Bir tablo satırının "düzenle" simgesi görsel olarak düğme ama davranışı
 * bağlantı: orta tuşla yeni sekmede açılması, adresinin kopyalanabilmesi ve
 * tarayıcı geçmişine girmesi beklenen davranış. `onClick` + `router.push` ile
 * yazıldığında bunların hiçbiri çalışmıyordu.
 *
 * <p>Bağlantı kipinde `disabled` YOKTUR — `<a>` etiketinin devre dışı hâli
 * yok ve `aria-disabled` tıklamayı engellemez. Erişilemez olması gereken bir
 * eylem hiç çizilmez.
 */
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
          title={rest.title ?? label}
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
        title={label}
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
