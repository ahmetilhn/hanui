import { render, screen } from '@testing-library/react';

import Avatar from '@/components/Avatar';
import Divider from '@/components/Divider';
import QuantityStepper from '@/components/QuantityStepper';
import Tooltip from '@/components/Tooltip';

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

/**
 * ADET KUTUSU BIR SPINBUTTON'DUR.
 *
 * ⚠ Onceki hâl araligi ETIKETE gomuyordu (`"Adet (1-99)"`): ekran okuyucu
 * bunu duz bir ad olarak okuyor, GUNCEL degeri ve sinirlari ayri birer bilgi
 * olarak bildirmiyordu. Deger degistiginde de hicbir sey duyurulmuyordu —
 * kullanici adedi artirdigini yalnizca EKRANA BAKARAK anlayabiliyordu.
 */
describe('QuantityStepper — spinbutton sözleşmesi', () => {
  it('rol ve DEĞER ARALIĞI erişilebilirlik ağacında', () => {
    render(<QuantityStepper value={3} min={1} max={99} onChange={() => undefined} />);

    const spin = screen.getByRole('spinbutton');
    expect(spin).toHaveAttribute('aria-valuenow', '3');
    expect(spin).toHaveAttribute('aria-valuemin', '1');
    expect(spin).toHaveAttribute('aria-valuemax', '99');
  });

  it('ad ARALIK TAŞIMAZ — aralık role ile bildirilir', () => {
    render(<QuantityStepper value={3} min={1} max={99} onChange={() => undefined} />);

    expect(screen.getByRole('spinbutton').getAttribute('aria-label')).not.toMatch(/1-99/);
  });
});

/**
 * IPUCU KLAVYEYLE DE ACILIR.
 *
 * ⚠ `onFocus`/`onBlur` zaten bagliydi ama capa bir `<span>` ve `<span>`
 * varsayilan olarak ODAK ALMIYOR. Cocuk kendisi odaklanabilir DEGILSE
 * (duz metin, ikon, `<img>`) ipucu YALNIZCA FAREYLE aciliyordu: klavye ve
 * ekran okuyucu kullanicisi icerigi hic goremiyordu.
 */
describe('Tooltip — klavye erişimi', () => {
  it('odaklanamayan çocukta ÇAPA odak alır', () => {
    const { container } = render(
      <Tooltip content="açıklama">
        <span>ikon</span>
      </Tooltip>,
    );

    expect(container.firstElementChild).toHaveAttribute('tabindex', '0');
  });

  it('odaklanabilir çocukta ÇAPA tabIndex ALMAZ — sekmede iki durak olmaz', () => {
    const { container } = render(
      <Tooltip content="açıklama">
        <button type="button">kaydet</button>
      </Tooltip>,
    );

    expect(container.firstElementChild).not.toHaveAttribute('tabindex');
  });

  it('bağlantı da odaklanabilir sayılır', () => {
    const { container } = render(
      <Tooltip content="açıklama">
        <a href="/x">git</a>
      </Tooltip>,
    );

    expect(container.firstElementChild).not.toHaveAttribute('tabindex');
  });
});
