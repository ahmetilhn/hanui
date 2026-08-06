import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

/** Kütüphanenin bir bağlantı bileşenine geçirdiği props. */
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
