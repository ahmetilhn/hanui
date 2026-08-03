import { render, screen } from '@testing-library/react';

import ScrollArea from '../ScrollArea';

/**
 * KAYDIRMA BÖLGESİ — klavyeyle erişilebilirlik (WCAG 2.1.1).
 *
 * <p>Kaydırılabilir bir kutuda odaklanabilir öğe yoksa (uzun metin, tablo, kod
 * bloğu) klavye kullanıcısı ona ULAŞAMIYOR: `Tab` atlıyor, ok tuşları sayfayı
 * kaydırıyor. Firefox `tabindex`i kendiliğinden veriyor, Chrome ve Safari
 * vermiyor.
 *
 * <p>Ama `tabindex="0"` KOŞULSUZ da verilemez: içerik sığdığında kutu
 * gereksiz bir Tab durağına dönüşüyor. Bileşen taşmayı ÖLÇÜYOR — ve jsdom
 * yerleşim yapmadığı için ölçüm burada taklit ediliyor.
 */

/** jsdom `scrollHeight`/`clientHeight` döndürmüyor; ölçüm taklit edilir. */
const mockOverflow = (isOverflowing: boolean) => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => (isOverflowing ? 500 : 100),
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 100,
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => 100,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 100,
  });
};

/* jsdom'da `ResizeObserver` yok; bilesen onsuz olcum yapmiyor. */
class ResizeObserverStub {
  constructor(private readonly callback: () => void) {}
  observe() {
    this.callback();
  }
  disconnect() {}
}

describe('ScrollArea', () => {
  beforeAll(() => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
  });

  it('TAŞMA varsa bölge odaklanabilir ve adlandırılır', () => {
    mockOverflow(true);

    render(
      <ScrollArea label="Uzun metin" maxHeight={100}>
        <p>içerik</p>
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: 'Uzun metin' });

    expect(region).toHaveAttribute('tabindex', '0');
  });

  /*
   * Kosulsuz `tabindex` verilseydi icerigi sigan her kutu gereksiz bir Tab
   * duragina donusuyordu: sekiz kutulu bir sayfada klavye kullanicisi hicbir
   * sey yapmayan sekiz durak geciyordu.
   */
  it('taşma YOKSA ne odaklanabilir ne de bir bölge', () => {
    mockOverflow(false);

    const { container } = render(
      <ScrollArea label="Kısa metin">
        <p>içerik</p>
      </ScrollArea>,
    );

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute('tabindex');
  });
});
