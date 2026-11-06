import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

/** Kütüphanenin bir bağlantı bileşenine geçirdiği props. */
export type UiLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
  [key: string]: unknown;
};

/** Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…). */
export type UiLinkComponent = ComponentType<UiLinkProps>;

/**
 * Bileşenden yönlendiriciye geçirilecek ek props.
 * @example // Next.js App Router: sayfa numarasına basınca liste yukarı sıçramasın.…
 */
export type UiLinkExtraProps = Record<string, unknown>;
