'use client';

import { type ButtonHTMLAttributes, forwardRef, memo, type ReactNode } from 'react';

import { isDefined } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

export type ChipSize = 'sm' | 'md';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Görünen metin. Yalnız ikon taşıyan çipte verilmez; `label` zorunlu olur. */
  children?: ReactNode;
  /** Metnin solundaki ikon. */
  icon?: ReactNode;
  /** Metnin sağındaki ikon (ok, çarpı). */
  endIcon?: ReactNode;
  /** Sağda gösterilen sonuç adedi. */
  count?: number;
  isSelected?: boolean;
  size?: ChipSize;
  /**
   * Erişilebilir ad. Görünür metin yoksa <strong>zorunlu</strong>: yalnız ikon
   * taşıyan bir çip ekran okuyucuda "düğme" diye okunur.
   */
  label?: string;
  /** Verilirse çip bir bağlantı olarak çizilir. */
  href?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  /**
   * Grup içindeki ARIA rolü. Tek seçimli gruplarda `radio`, çok seçimlide
   * verilmez — {@link ChipGroup} bunu kendisi ayarlar; elle kullanımda
   * `aria-pressed` üretilir.
   */
  role?: 'radio';
  testId?: string;
};

/**
 * Çip — seçilebilir etiket.
 *
 * <h3>Tasarım sisteminin en çok tekrarlanan öğesi</h3>
 * Kategori seçimi, hızlı filtre, sıralama tercihi, görünüm anahtarı: hepsi
 * aynı öğe. Ayrı ayrı düğme stilleri yazmak yerine tek çip kullanılır;
 * böylece seçili durumun nasıl göründüğü uygulamanın her yerinde aynıdır.
 *
 * <h3>Seçili durum üç sinyalle birden bildirilir</h3>
 * Kenarlık + metin rengi + ikon rengi <em>birlikte</em> değişir. Yalnızca
 * zemini doldurmak (renk tek başına, WCAG 1.4.1) renk körü kullanıcı için
 * ayırt edilemez olurdu; ayrıca dolu zemin çipi düğmeye benzetip "buraya
 * tıkla" gibi okutuyordu — oysa çip bir <em>durum</em> gösterir.
 *
 * <h3>Neden `aria-pressed`, `disabled` değil</h3>
 * Seçili çip pasifleştirilmez: kullanıcı seçimini geri alabilmeli. Basılı
 * düğme semantiği (`aria-pressed`) ekran okuyucuya "seçili, kapatılabilir"
 * bilgisini verir.
 */
const Chip = /*#__PURE__*/ forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      icon,
      endIcon,
      count,
      isSelected,
      size = 'md',
      label,
      href,
      linkProps,
      className,
      type = 'button',
      role,
      testId,
      ...rest
    },
    ref,
  ) => {
    const classNames = cx(
      styles.chip,
      styles[`chip--${size}`],
      isSelected && styles['chip--selected'],
      !children && styles['chip--iconOnly'],
      className,
    );

    const content = (
      <>
        {icon && (
          <span className={styles.chip__icon} aria-hidden>
            {icon}
          </span>
        )}
        {children && <span className={styles.chip__label}>{children}</span>}
        {isDefined(count) && <span className={styles.chip__count}>{count}</span>}
        {endIcon && (
          <span className={styles.chip__icon} aria-hidden>
            {endIcon}
          </span>
        )}
      </>
    );

    if (href)
      return (
        <HanuiLink
          href={href}
          className={classNames}
          aria-label={children ? undefined : label}
          aria-current={isSelected ? 'page' : undefined}
          title={children ? undefined : label}
          data-testid={testId}
          {...linkProps}
        >
          {content}
        </HanuiLink>
      );

    return (
      <button
        ref={ref}
        type={type}
        role={role}
        className={classNames}
        aria-label={children ? undefined : label}
        title={children ? undefined : label}
        data-testid={testId}
        // Tek seçimli grupta radyo semantiği, aksi halde basılı düğme.
        {...(role === 'radio'
          ? { 'aria-checked': Boolean(isSelected) }
          : { 'aria-pressed': Boolean(isSelected) })}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Chip, 'Chip')) as typeof Chip;
