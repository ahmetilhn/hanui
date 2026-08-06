import { act, render, screen } from '@testing-library/react';

import ScrollArea from '@/components/ScrollArea';

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
