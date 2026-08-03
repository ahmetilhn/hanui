'use client';

import { type ButtonHTMLAttributes, forwardRef, memo, type ReactNode } from 'react';

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
 * <h3>Yüklenirken içerik korunur</h3>
 * Metin dönen çarkla DEĞİŞTİRİLMEZ, yanına eklenir ve düğme genişliği
 * sabitlenir. Metni değiştirmek düğmeyi daraltıp yerleşimi kaydırıyordu ve
 * kullanıcı neye tıkladığını kaybediyordu.
 *
 * <h3>Bağlantı mı düğme mi</h3>
 * `href` verilirse `<a>` çizilir. Görsel olarak düğme gibi duran bir
 * bağlantının gerçekten `<a>` olması gerekir: orta tuşla yeni sekmede
 * açılması ve tarayıcı geçmişine girmesi beklenen davranıştır.
 *
 * <p>`isExternal` ile birlikte yönlendirici DEĞİL ham `<a>` çizilir ve
 * `target="_blank"` + `rel="noopener noreferrer"` eklenir. Uygulama dışı bir
 * adres için yönlendiriciyi araya sokmak anlamsız; `rel` ise zorunlu —
 * `noopener` olmadan açılan sekme `window.opener` üzerinden bu sayfaya
 * erişebiliyor. Düğme benzeri dış bağlantı elle `<a>` olarak yazılmasın diye
 * burada: elle yazılan her bağlantı odak halkasını ve durum matrisini yeniden
 * kurmak zorunda kalıyordu.
 *
 * @example
 * <Button variant={UIVariant.PRIMARY} isLoading={isSaving} onClick={save}>
 *   Kaydet
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

    if (href && isExternal)
      return (
        <a
          href={href}
          className={classNames}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={rest['aria-label']}
          data-testid={testId}
        >
          {content}
        </a>
      );

    if (href)
      return (
        <HanuiLink href={href} className={classNames} data-testid={testId} {...linkProps}>
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
