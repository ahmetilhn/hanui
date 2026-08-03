'use client';

import type { AnchorHTMLAttributes, FC } from 'react';

import { useHanui } from '../../theme/context';
import type { HanuiLinkProps } from '../../types/link.type';

/**
 * Kütüphanenin İÇ bağlantı öğesi.
 *
 * <p>Sağlayıcıya bir `linkComponent` verilmişse ona, verilmemişse ham `<a>`ya
 * çizilir. Böylece bir bağlantı taşıyan her bileşen (`Button href`, `Chip`,
 * `Breadcrumb`, `Pagination`, `TextLink`, `Directory`, `Tile`) yönlendirici
 * kararını TEK yerden alır.
 *
 * <p>Bileşenler bunu doğrudan dışa vermez: tüketici zaten kendi Link'ini
 * kullanır. Dışa vermek "hanui'nin Link'i" diye üçüncü bir kavram üretirdi.
 *
 * <h3>Neden `forwardRef` değil</h3>
 * `HanuiLinkProps` yönlendiriciye özgü ek props için bir indeks imzası
 * taşıyor ve `forwardRef`in `PropsWithoutRef` eşlemesi o imzayı açıkça
 * bildirilmiş `children`ın üstüne geçirip tipini `unknown`a düşürüyordu. Ref'e
 * ihtiyaç da yok: hiçbir çağrı yeri bu öğeye ref vermiyor, verecek olan
 * tüketicinin kendi Link'i.
 */
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
