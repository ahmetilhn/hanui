import { render, screen } from '@testing-library/react';

import Avatar from '../Avatar';
import EmptyState from '../EmptyState';

/** FAZ 4 — durum üçlüsü ve kimlik tonu. */

describe('EmptyState — boş ile yüklenemedi', () => {
  /*
   * Ag hatasini "kayit kalmamis" diye okuyan kullanici yanlis karar veriyor:
   * urun aramayi birakiyor, siparisinin silindigini saniyor.
   */
  it('hata tonu `role="alert"` ile DUYURULUR', () => {
    render(<EmptyState tone="error" title="Liste yüklenemedi" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Liste yüklenemedi');
  });

  it('boş durum DUYURULMAZ — o beklenen bir sonuç', () => {
    render(<EmptyState title="Sonuç bulunamadı" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Sonuç bulunamadı')).toBeInTheDocument();
  });

  /* Yerlesim AYNI kalir ki iki durum arasindaki gecis sicramasin; ayrimi ton
     tasiyor. */
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
  /** Madalyonun taşıdığı ton sınıfı. */
  const toneOf = (name: string): string | undefined => {
    const { container, unmount } = render(<Avatar name={name} />);
    const tone = [...(container.firstElementChild?.classList ?? [])].find(item =>
      item.includes('tone-'),
    );
    unmount();
    return tone;
  };

  /*
   * Bir listede yan yana duran on kullanici, hepsi ayni gri madalyonken
   * birbirinden ayirt edilemiyordu; renk her render'da degisseydi (rastgele)
   * madalyon kimlik tasimak yerine gurultu uretiyordu.
   */
  it('AYNI ad her zaman AYNI tonu alır', () => {
    expect(toneOf('Ahmet İlhan')).toBe(toneOf('Ahmet İlhan'));
  });

  it('farklı adlar tonları PAYLAŞABİLİR ama dağılır', () => {
    const names = ['Ahmet', 'Zeynep', 'Mehmet', 'Ayşe', 'Can', 'Deniz'];
    const tones = new Set(names.map(toneOf));

    /* Alti ad icin en az uc farkli ton: hepsi ayni kovaya duserse ton hicbir
       sey ayirt etmiyor demektir. */
    expect(tones.size).toBeGreaterThanOrEqual(3);
  });

  /* Gorselin uzerine renk basmak fotografi bozuyordu. */
  it('görsel varken ton çizilmez', () => {
    const { container } = render(<Avatar name="Ahmet" imageUrl="/a.png" />);

    const tone = [...(container.firstElementChild?.classList ?? [])].find(item =>
      item.includes('tone-'),
    );

    expect(tone).toBeUndefined();
  });
});
