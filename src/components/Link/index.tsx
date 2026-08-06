'use client';

import type { AnchorHTMLAttributes, FC } from 'react';

import { useHanui } from '../../theme/context';
import type { HanuiLinkProps } from '../../types/link.type';

/** Kütüphanenin İÇ bağlantı öğesi. */
const HanuiLink: FC<HanuiLinkProps> = ({ children, ...rest }) => {
  const { linkComponent: LinkComponent } = useHanui();

  if (LinkComponent) return <LinkComponent {...(rest as HanuiLinkProps)}>{children}</LinkComponent>;

  /*
   * Yonlendirici yoksa ham `<a>`. `rest` indeks imzasi tasiyor (yonlendiriciye
   * ozgu props icin); DOM'a giderken anchor sozlesmesine daraltilir —
   * tanimadigi bir ozniteligi React zaten oldugu gibi geciriyor.
   */
  return <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
};

export default HanuiLink;
