'use client';

import type { AnchorHTMLAttributes, FC } from 'react';

import { useUi } from '../../theme/context';
import type { UiLinkProps } from '../../types/link.type';

/** Kütüphanenin İÇ bağlantı öğesi. */
const UiLink: FC<UiLinkProps> = ({ children, ...rest }) => {
  const { linkComponent: LinkComponent } = useUi();

  if (LinkComponent) return <LinkComponent {...(rest as UiLinkProps)}>{children}</LinkComponent>;

  /*
   * Yonlendirici yoksa ham `<a>`. `rest` indeks imzasi tasiyor (yonlendiriciye ozgu props icin);
   * DOM'a giderken anchor sozlesmesine daraltilir
   */
  return <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
};

export default UiLink;
