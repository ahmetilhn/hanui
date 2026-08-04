import { act, render, screen } from '@testing-library/react';

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
const mockOverflow = (isOverflowing: boolean, scrollTop = 0) => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => (isOverflowing ? 500 : 100),
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
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

  /*
   * KENAR SOLMASI BIR IDDIA: "bu ucun otesinde devam eden icerik var".
   *
   * Iki uca da kosulsuz yazildiginda iddia YANLIS oluyor ve bedeli dogrudan
   * gorunurluk. Olculdu (Chromium + WebKit, filtre kenar cubugundaki
   * `maxHeight: 280` kutusu): tek secenekli bir grupta kutu 33 px ve solma
   * paylari 16+16 px oldugu icin TAM OPAK alan 1 px kaliyordu — secenek
   * neredeyse tamamen silik ciziliyor, ustelik tasma olmadigi icin
   * kaydirarak da kurtarilamiyordu. Kullanicinin bildirdigi hata buydu.
   */
  describe('kenar solması', () => {
    const boxOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;

    it('taşma YOKSA hiçbir uç solmaz', () => {
      mockOverflow(false);

      const { container } = render(
        <ScrollArea label="Kısa liste" hasFade>
          <p>tek seçenek</p>
        </ScrollArea>,
      );

      expect(boxOf(container)).not.toHaveAttribute('data-fade-start');
      expect(boxOf(container)).not.toHaveAttribute('data-fade-end');
    });

    /* En ustteyken ust ucta gizli icerik YOK: orayi soldurmak ilk satiri
       gosterecek bir sey olmadigi halde siliyordu. */
    it('taşma varken en üstte YALNIZCA alt uç solar', () => {
      mockOverflow(true, 0);

      const { container } = render(
        <ScrollArea label="Uzun liste" maxHeight={100} hasFade>
          <p>içerik</p>
        </ScrollArea>,
      );

      expect(boxOf(container)).not.toHaveAttribute('data-fade-start');
      expect(boxOf(container)).toHaveAttribute('data-fade-end');
    });

    it('sona kaydırıldığında YALNIZCA üst uç solar', () => {
      mockOverflow(true, 400);

      const { container } = render(
        <ScrollArea label="Uzun liste" maxHeight={100} hasFade>
          <p>içerik</p>
        </ScrollArea>,
      );

      act(() => boxOf(container).dispatchEvent(new Event('scroll')));

      expect(boxOf(container)).toHaveAttribute('data-fade-start');
      expect(boxOf(container)).not.toHaveAttribute('data-fade-end');
    });

    /* `hasFade` verilmediginde uc bayragi HIC yazilmaz: maske kurali da yok,
       oznitelik oraya bir anlam tasimazdi. */
    it('`hasFade` yokken uç bayrağı yazılmaz', () => {
      mockOverflow(true, 400);

      const { container } = render(
        <ScrollArea label="Uzun liste" maxHeight={100}>
          <p>içerik</p>
        </ScrollArea>,
      );

      expect(boxOf(container)).not.toHaveAttribute('data-fade-start');
      expect(boxOf(container)).not.toHaveAttribute('data-fade-end');
    });
  });
});
