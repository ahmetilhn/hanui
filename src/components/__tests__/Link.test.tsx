import type { FC } from 'react';
import { render, screen } from '@testing-library/react';

import Breadcrumb from '../Breadcrumb';
import Button from '../Button';
import HanuiProvider from '../../theme/HanuiProvider';
import type { HanuiLinkProps } from '../../types/link.type';

/** Tüketicinin yönlendiricisini taklit eder. */
const RouterLink: FC<HanuiLinkProps> = ({ href, children, scroll, ...rest }) => (
  <a href={href} data-router="yes" data-scroll={String(scroll)} {...(rest as object)}>
    {children}
  </a>
);

/**
 * Bir bileşen kütüphanesi kendi yönlendiricisini SEÇEMEZ: `next/link` import
 * etmek paketi Next'e bağlar, `react-router` import etmek başka bir uygulamayı
 * kırar. Karar tüketicinin — ve verilmediğinde ham `<a>`ya düşmek zorunda,
 * yoksa tek bir `Badge` kullanmak isteyen tüketici de kök yerleşimi
 * değiştirmeye zorlanır.
 */
describe('bağlantı enjeksiyonu', () => {
  it('sağlayıcı YOKKEN ham `<a>` çizilir', () => {
    render(<Button href="/urunler">Ürünler</Button>);

    const link = screen.getByRole('link', { name: 'Ürünler' });

    expect(link).toHaveAttribute('href', '/urunler');
    expect(link).not.toHaveAttribute('data-router');
  });

  it('sağlayıcıdaki yönlendirici kullanılır', () => {
    render(
      <HanuiProvider linkComponent={RouterLink}>
        <Button href="/urunler">Ürünler</Button>
      </HanuiProvider>,
    );

    expect(screen.getByRole('link', { name: 'Ürünler' })).toHaveAttribute('data-router', 'yes');
  });

  it('`linkProps` yönlendiriciye geçer', () => {
    render(
      <HanuiProvider linkComponent={RouterLink}>
        <Button href="/urunler" linkProps={{ scroll: false }}>
          Ürünler
        </Button>
      </HanuiProvider>,
    );

    expect(screen.getByRole('link', { name: 'Ürünler' })).toHaveAttribute('data-scroll', 'false');
  });

  /*
   * `noopener` olmadan acilan sekme `window.opener` uzerinden bu sayfaya
   * erisebiliyor; uygulama disi bir adres icin yonlendiriciyi araya sokmak da
   * anlamsiz.
   */
  it('dış bağlantı yönlendiriciyi ATLAR ve `rel` taşır', () => {
    render(
      <HanuiProvider linkComponent={RouterLink}>
        <Button href="https://example.com" isExternal>
          Dış site
        </Button>
      </HanuiProvider>,
    );

    const link = screen.getByRole('link', { name: 'Dış site' });

    expect(link).not.toHaveAttribute('data-router');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  /*
   * Bulundugu sayfaya baglanti veren bir kirinti yolu ekran okuyucu
   * kullanicisini yaniltir.
   */
  it('kırıntı yolunun son öğesi bağlantı DEĞİLDİR', () => {
    render(
      <Breadcrumb
        label="Konum"
        items={[
          { label: 'Ana sayfa', href: '/' },
          { label: 'Fren', href: '/kategori/fren' },
          { label: 'Balata', href: '/kategori/fren/balata' },
        ]}
      />,
    );

    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByText('Balata')).toHaveAttribute('aria-current', 'page');
  });
});
