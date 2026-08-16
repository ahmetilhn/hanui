import { fireEvent, render, screen } from '@testing-library/react';

import Button from '@/components/Button';
import IconButton from '@/components/IconButton';

/**
 * `href` verilen düğmelerin prop'ları DOM'a ULAŞTIĞINI tutar.
 *
 * ⚠ Ölçülen arıza: iki bileşenin de tipi `ButtonHTMLAttributes` olduğu için
 * `onClick`, `aria-*`, `data-*`, `id`, `title` hepsi TİP DENETİMİNDEN
 * geçiyordu, ama `...rest` yalnızca `<button>` dalında yayılıyordu. Bağlantı
 * dalı bir avuç alanı elle kopyalıyor, gerisini sessizce düşürüyordu:
 * `<Button href={ROUTES.CART} onClick={izle}>` derleniyor, geziniyor ve
 * analitik çağrısı HİÇ çalışmıyordu. Vitrinde 14 `<Button href>` çağrı yeri
 * var, yani her yeni prop sessiz bir no-op riskiydi.
 */

describe('href taşıyan düğmeler prop düşürmez', () => {
  it('Button: onClick, aria-label ve data-* bağlantıya ulaşır', () => {
    const onClick = jest.fn();

    render(
      <Button href="/sepet" onClick={onClick} aria-label="Sepete git" data-analytics="cart-cta">
        Sepet
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Sepete git' });
    expect(link).toHaveAttribute('data-analytics', 'cart-cta');

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button: `disabled` bağlantıda gezinmeyi ve tıklamayı durdurur', () => {
    const onClick = jest.fn();

    render(
      <Button href="/sepet" disabled onClick={onClick}>
        Sepet
      </Button>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');

    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('IconButton: onClick ve data-* bağlantıya ulaşır', () => {
    const onClick = jest.fn();

    render(
      <IconButton href="/ayarlar" icon={<span />} label="Ayarlar" onClick={onClick} data-x="1" />,
    );

    const link = screen.getByRole('link', { name: 'Ayarlar' });
    expect(link).toHaveAttribute('data-x', '1');

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
