import { act, renderHook } from '@testing-library/react';

import useVirtualList from '@/hooks/useVirtualList';

const attach = (
  ref: { current: HTMLElement | null },
  { clientHeight = 400, scrollTop = 0 } = {},
) => {
  const node = document.createElement('div');
  Object.defineProperty(node, 'clientHeight', { value: clientHeight, configurable: true });
  node.scrollTop = scrollTop;
  document.body.appendChild(node);
  ref.current = node;
  return node;
};

describe('useVirtualList', () => {
  it('ölçüm yokken TÜM listeyi çizer', () => {
    const { result } = renderHook(() => useVirtualList(1121));

    expect(result.current.range.start).toBe(0);
    expect(result.current.range.end).toBe(1121);
  });

  it('kapalıyken sanallaştırmaz', () => {
    const { result } = renderHook(() => useVirtualList(1121, { isEnabled: false }));

    act(() => {
      attach(result.current.scrollRef);
      result.current.measure();
    });

    expect(result.current.range.end).toBe(1121);
  });

  it('yalnızca görünen aralığı çizer', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40, overscan: 6 }));

    act(() => {
      attach(result.current.scrollRef, { clientHeight: 400 });
      result.current.measure();
    });

    expect(result.current.range.start).toBe(0);
    expect(result.current.range.end).toBe(16);
  });

  it('`totalHeight` TÜM listeyi yansıtır', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40 }));

    act(() => {
      attach(result.current.scrollRef);
      result.current.measure();
    });

    expect(result.current.range.totalHeight).toBe(1121 * 40);
  });

  it('kaydırıldığında aralık ve boşluk kayar', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40, overscan: 6 }));

    act(() => {
      const node = attach(result.current.scrollRef, { clientHeight: 400 });
      node.scrollTop = 4000;
      result.current.measure();
    });

    expect(result.current.range.start).toBe(94);
    expect(result.current.range.offset).toBe(94 * 40);
  });

  it('aralık listenin dışına TAŞMAZ', () => {
    const { result } = renderHook(() => useVirtualList(20, { rowHeight: 40, overscan: 6 }));

    act(() => {
      const node = attach(result.current.scrollRef, { clientHeight: 400 });
      node.scrollTop = 10_000;
      result.current.measure();
    });

    expect(result.current.range.end).toBe(20);
    expect(result.current.range.start).toBeGreaterThanOrEqual(0);
  });

  it('`scrollToIndex` çizilmemiş satırın konumunu hesaplar', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40 }));

    let node!: HTMLElement;
    act(() => {
      node = attach(result.current.scrollRef, { clientHeight: 400 });
      result.current.measure();
    });

    act(() => result.current.scrollToIndex(500));

    expect(node.scrollTop).toBe(501 * 40 - 400);
  });

  it('`scrollToIndex` yukarı doğru da çalışır', () => {
    const { result } = renderHook(() => useVirtualList(1121, { rowHeight: 40 }));

    let node!: HTMLElement;
    act(() => {
      node = attach(result.current.scrollRef, { clientHeight: 400 });
      node.scrollTop = 4000;
      result.current.measure();
    });

    act(() => result.current.scrollToIndex(10));

    expect(node.scrollTop).toBe(400);
  });
});
