import { render, screen } from '@testing-library/react';

import Avatar from '@/components/Avatar';
import Divider from '@/components/Divider';
import QuantityStepper from '@/components/QuantityStepper';
import Tooltip from '@/components/Tooltip';

describe('Avatar — kişinin adı ağaçta olmalı', () => {
  it('erişilebilir adı `name` prop`undan alır', () => {
    render(<Avatar name="Ahmet Yılmaz" />);

    expect(screen.getByRole('img')).toHaveAccessibleName('Ahmet Yılmaz');
  });

  it('görsel varken de ad duyurulur ve İKİ KEZ okunmaz', () => {
    render(<Avatar name="Ahmet Yılmaz" imageUrl="https://cdn.example/a.jpg" />);

    const node = screen.getByRole('img', { name: 'Ahmet Yılmaz' });

    expect(node.querySelector('img')).toHaveAttribute('alt', '');
  });
});

describe('Divider — ayırıcı anlamı etiketliyken de durmalı', () => {
  it('etiketli ayırıcı `separator` rolü taşır', () => {
    render(<Divider label="Ödeme bilgileri" />);

    expect(screen.getByRole('separator')).toHaveAccessibleName('Ödeme bilgileri');
  });

  it('etiketsiz ayırıcı hâlâ `<hr>` ve adsız', () => {
    const { container } = render(<Divider />);

    expect(container.querySelector('hr')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toHaveAccessibleName('');
  });
});

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
