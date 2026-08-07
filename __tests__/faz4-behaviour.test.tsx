import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Field from '@/components/Field';
import Pagination from '@/components/Pagination';
import Price from '@/components/Price';
import Tabs from '@/components/Tabs';
import Textarea from '@/components/Textarea';
import HanuiProvider from '@/theme/HanuiProvider';

const wrap = (ui: React.ReactElement, labels?: Record<string, unknown>) =>
  render(<HanuiProvider labels={labels}>{ui}</HanuiProvider>);

describe('Field — hata ipucunu EZMEZ', () => {
  it('hata varken ipucu da `aria-describedby` içinde kalır', () => {
    wrap(
      <Field label="Şifre" hint="En az 8 karakter" error="Çok kısa">
        {props => <input {...props} />}
      </Field>,
    );

    const input = screen.getByRole('textbox');
    const described = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    expect(described.length).toBe(2);

    const text = described.map(id => document.getElementById(id)?.textContent).join(' | ');

    expect(text).toContain('Çok kısa');
    expect(text).toContain('En az 8 karakter');
  });

  it('hata ipucundan ÖNCE okunur', () => {
    wrap(
      <Field label="Şifre" hint="En az 8 karakter" error="Çok kısa">
        {props => <input {...props} />}
      </Field>,
    );

    const [first] = (screen.getByRole('textbox').getAttribute('aria-describedby') ?? '').split(' ');

    expect(document.getElementById(first as string)?.textContent).toContain('Çok kısa');
  });
});

describe('Price — `isFormatted`', () => {
  it('yerel ayar YOKKEN değeri olduğu gibi yazar', () => {
    wrap(<Price value="1299.9" isFormatted testId="price" />);

    expect(screen.getByTestId('price').textContent).toContain('1299.9');
  });

  it('yerel ayar verildiğinde ayırıcıları uygular', () => {
    wrap(<Price value="1299.9" isFormatted testId="price" />, { locale: 'tr-TR' });

    expect(screen.getByTestId('price').textContent).toMatch(/1.299/);
  });

  it('sayıya çevrilemeyen değeri BOZMAZ', () => {
    wrap(<Price value="Fiyat sorunuz" isFormatted testId="price" />, { locale: 'tr-TR' });

    expect(screen.getByTestId('price').textContent).toContain('Fiyat sorunuz');
    expect(screen.getByTestId('price').textContent).not.toContain('NaN');
  });
});

describe('Textarea — sayaç', () => {
  it('`maxLength`e yaklaşınca uyarı tonuna geçer', () => {
    const { rerender } = wrap(
      <Textarea value={'a'.repeat(10)} maxLength={100} hasCounter onChange={() => {}} />,
    );

    const counter = screen.getByText('10 / 100');
    const calm = counter.className;

    rerender(
      <HanuiProvider>
        <Textarea value={'a'.repeat(95)} maxLength={100} hasCounter onChange={() => {}} />
      </HanuiProvider>,
    );

    expect(screen.getByText('95 / 100').className).not.toBe(calm);
  });

  it('sayaç ekran okuyucudan gizli', () => {
    wrap(<Textarea value="abc" maxLength={100} hasCounter onChange={() => {}} />);

    expect(screen.getByText('3 / 100')).toHaveAttribute('aria-hidden', 'true');
  });

  it('`hasCounter` yokken sayaç ÇİZİLMEZ', () => {
    wrap(<Textarea value="abc" maxLength={100} onChange={() => {}} />);

    expect(screen.queryByText('3 / 100')).toBeNull();
  });
});

describe('Tabs — manuel etkinleştirme', () => {
  const items = [
    { id: 'a', label: 'Genel', content: <p>Genel içerik</p> },
    { id: 'b', label: 'Uyumluluk', content: <p>Uyumluluk içeriği</p> },
    { id: 'c', label: 'Yorumlar', content: <p>Yorum içeriği</p> },
  ];

  it('ok tuşu odağı taşır ama sekmeyi AÇMAZ', async () => {
    const user = userEvent.setup();
    wrap(<Tabs items={items} ariaLabel="Ürün" isManualActivation />);

    await user.click(screen.getByRole('tab', { name: 'Genel' }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Uyumluluk' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Genel' })).toHaveAttribute('aria-selected', 'true');
  });

  it('`Enter` odaklanan sekmeyi açar', async () => {
    const user = userEvent.setup();
    wrap(<Tabs items={items} ariaLabel="Ürün" isManualActivation />);

    await user.click(screen.getByRole('tab', { name: 'Genel' }));
    await user.keyboard('{ArrowRight}{Enter}');

    expect(screen.getByRole('tab', { name: 'Uyumluluk' })).toHaveAttribute('aria-selected', 'true');
  });

  it('otomatik kip (varsayılan) ok tuşuyla AÇAR', async () => {
    const user = userEvent.setup();
    wrap(<Tabs items={items} ariaLabel="Ürün" />);

    await user.click(screen.getByRole('tab', { name: 'Genel' }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Uyumluluk' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Pagination — sonuç duyurusu', () => {
  const format = (page: number, total: number) => `Sayfa ${page} / ${total}`;

  it('sayfa değişince canlı bölgeye yazar', async () => {
    const { rerender } = wrap(
      <Pagination page={1} totalPages={9} onPageChange={() => {}} formatAnnouncement={format} />,
    );

    rerender(
      <HanuiProvider>
        <Pagination page={2} totalPages={9} onPageChange={() => {}} formatAnnouncement={format} />
      </HanuiProvider>,
    );

    await waitFor(() => expect(screen.getByText('Sayfa 2 / 9')).toBeInTheDocument());
  });

  it('ilk çizimde duyurmaz', () => {
    wrap(
      <Pagination page={3} totalPages={9} onPageChange={() => {}} formatAnnouncement={format} />,
    );

    expect(screen.queryByText('Sayfa 3 / 9')).toBeNull();
  });

  it('`buildHref` verildiğinde numaralar bağlantıdır', () => {
    wrap(<Pagination page={1} totalPages={5} buildHref={page => `/liste?sayfa=${page}`} />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/liste?sayfa=2');
  });
});

describe('Textarea — otomatik büyüme', () => {
  it('ölçmeden önce yüksekliği sıfırlar (küçülebilmesi için)', () => {
    const { rerender } = wrap(
      <Textarea value={'satır\n'.repeat(8)} isAutoSize onChange={() => {}} />,
    );

    const node = screen.getByRole('textbox') as HTMLTextAreaElement;
    const tall = node.style.height;

    rerender(
      <HanuiProvider>
        <Textarea value="tek satır" isAutoSize onChange={() => {}} />
      </HanuiProvider>,
    );

    expect(node.style.height).toBe(tall);
    fireEvent.change(node, { target: { value: 'x' } });
    expect(node.style.overflowY).toBeDefined();
  });
});
