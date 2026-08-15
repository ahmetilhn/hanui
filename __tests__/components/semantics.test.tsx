import { render, screen } from '@testing-library/react';

import Avatar from '@/components/Avatar';
import Divider from '@/components/Divider';

/**
 * ANLAM SÖZLEŞMESİ — bir öğe erişilebilirlik ağacında NE olduğunu söylemeli.
 *
 * Buradaki iki kusurun ortak yanı: ikisi de görsel olarak KUSURSUZDU ve
 * `jest-axe` taramasından da geçiyordu. Axe "bu ağaçta ihlal var mı" sorar;
 * "bu bilgi ağaçta var mı" sorusunu sormaz. Bir öğeyi tamamen gizlemek ya da
 * anlamını hiç bildirmemek axe için ihlal değildir — bilgi sessizce yok olur.
 */

describe('Avatar — kişinin adı ağaçta olmalı', () => {
  it('erişilebilir adı `name` prop`undan alır', () => {
    render(<Avatar name="Ahmet Yılmaz" />);

    /*
     * ⚠ REGRESYON NÖBETÇİSİ. Kök öğe `aria-hidden` taşıyordu ve bu yalnızca
     * madalyonu değil KİŞİNİN ADINI da ağaçtan çıkarıyordu. Ölçülen sonuç:
     * yalnızca avatar çizilen bir kullanıcı listesi ekran okuyucuda TAMAMEN
     * BOŞ görünüyordu. `name` prop`unun kendi dokümantasyonu onu "görsel yoksa
     * `alt` metnidir" diye tanımladığı hâlde hiçbir zaman duyurulmuyordu.
     */
    expect(screen.getByRole('img')).toHaveAccessibleName('Ahmet Yılmaz');
  });

  it('görsel varken de ad duyurulur ve İKİ KEZ okunmaz', () => {
    render(<Avatar name="Ahmet Yılmaz" imageUrl="https://cdn.example/a.jpg" />);

    const node = screen.getByRole('img', { name: 'Ahmet Yılmaz' });

    /* İçteki `<img>` `alt=""` taşır: ad zaten kökte duyuruluyor. */
    expect(node.querySelector('img')).toHaveAttribute('alt', '');
  });
});

describe('Divider — ayırıcı anlamı etiketliyken de durmalı', () => {
  it('etiketli ayırıcı `separator` rolü taşır', () => {
    render(<Divider label="Ödeme bilgileri" />);

    /*
     * ⚠ Etiketsiz dal `<hr>` kullanıyor ve onun örtük rolü zaten `separator`.
     * Etiketli dal ise düz bir `<div>`di — yani ayırıcı anlamı tam da ANLAM
     * TAŞIDIĞI yerde kayboluyordu.
     */
    expect(screen.getByRole('separator')).toHaveAccessibleName('Ödeme bilgileri');
  });

  it('etiketsiz ayırıcı hâlâ `<hr>` ve adsız', () => {
    const { container } = render(<Divider />);

    expect(container.querySelector('hr')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toHaveAccessibleName('');
  });
});
