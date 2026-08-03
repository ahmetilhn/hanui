import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

/**
 * Kütüphanenin bir bağlantı bileşenine geçirdiği props.
 *
 * <p>`href` dize: yönlendirici nesnesi (`UrlObject`) alan bir Link'e de dize
 * geçilebiliyor, tersi doğru değil. En dar sözleşme en çok yönlendiriciyle
 * uyumlu olan.
 *
 * <p>İndeks imzası yönlendiriciye özgü ek props içindir (Next'in `scroll`,
 * `prefetch`i; React Router'ın `replace`i). Kütüphane onları tanımıyor ama
 * yolunu da kapatmamalı. Değer tipi `unknown`, `any` DEĞİL: `any` yazmak
 * yanlış bir prop'un tip denetiminden sessizce geçmesine izin verirdi.
 * `href` ve `children` açıkça bildirildiği için indeks imzasından etkilenmez.
 */
export type HanuiLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
  [key: string]: unknown;
};

/** Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…). */
export type HanuiLinkComponent = ComponentType<HanuiLinkProps>;

/**
 * Bileşenden yönlendiriciye geçirilecek ek props.
 *
 * @example
 * // Next.js App Router: sayfa numarasına basınca liste yukarı sıçramasın.
 * <Pagination linkProps={{ scroll: false }} … />
 */
export type HanuiLinkExtraProps = Record<string, unknown>;
