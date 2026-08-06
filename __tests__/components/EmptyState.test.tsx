import { render, screen } from '@testing-library/react';

import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';

describe('EmptyState — boş ile yüklenemedi', () => {
  it('hata tonu `role="alert"` ile DUYURULUR', () => {
    render(<EmptyState tone="error" title="Liste yüklenemedi" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Liste yüklenemedi');
  });

  it('boş durum DUYURULMAZ — o beklenen bir sonuç', () => {
    render(<EmptyState title="Sonuç bulunamadı" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Sonuç bulunamadı')).toBeInTheDocument();
  });

  it('iki durum aynı yerleşimi paylaşır', () => {
    const { container: empty } = render(<EmptyState title="Boş" description="Açıklama" />);
    const { container: error } = render(
      <EmptyState tone="error" title="Hata" description="Açıklama" />,
    );

    expect(empty.querySelector('h3')).toBeInTheDocument();
    expect(error.querySelector('h3')).toBeInTheDocument();
  });
});

describe('Avatar — deterministik ton', () => {
  const toneOf = (name: string): string | undefined => {
    const { container, unmount } = render(<Avatar name={name} />);
    const tone = [...(container.firstElementChild?.classList ?? [])].find(item =>
      item.includes('tone-'),
    );
    unmount();
    return tone;
  };

  it('AYNI ad her zaman AYNI tonu alır', () => {
    expect(toneOf('Ahmet İlhan')).toBe(toneOf('Ahmet İlhan'));
  });

  it('farklı adlar tonları PAYLAŞABİLİR ama dağılır', () => {
    const names = ['Ahmet', 'Zeynep', 'Mehmet', 'Ayşe', 'Can', 'Deniz'];
    const tones = new Set(names.map(toneOf));

    expect(tones.size).toBeGreaterThanOrEqual(3);
  });

  it('görsel varken ton çizilmez', () => {
    const { container } = render(<Avatar name="Ahmet" imageUrl="/a.png" />);

    const tone = [...(container.firstElementChild?.classList ?? [])].find(item =>
      item.includes('tone-'),
    );

    expect(tone).toBeUndefined();
  });
});
