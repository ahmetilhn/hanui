import { act, renderHook } from '@testing-library/react';

import useAnnounce from '@/hooks/useAnnounce';

const region = (politeness: 'polite' | 'assertive') =>
  document.getElementById(`hanui-live-region-${politeness}`);

const flushFrame = () =>
  act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));

describe('useAnnounce', () => {
  beforeEach(() => {
    for (const politeness of ['polite', 'assertive'] as const) region(politeness)?.remove();
  });

  it('bölgeyi İLK çağrıda oluşturur ve metni yazar', async () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => result.current('48 ürün bulundu'));
    await flushFrame();

    expect(region('polite')).toHaveTextContent('48 ürün bulundu');
  });

  it('`assertive` AYRI bir bölgeye yazar', async () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => result.current('Kart reddedildi', 'assertive'));
    await flushFrame();

    expect(region('assertive')).toHaveTextContent('Kart reddedildi');
    expect(region('polite')).toBeNull();
  });

  it('bölge görsel olarak gizli ama erişilebilirlik ağacında', async () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => result.current('Kopyalandı'));
    await flushFrame();

    const live = region('polite');

    expect(live).toHaveClass('hanui-visually-hidden');
    expect(live).toHaveAttribute('aria-live', 'polite');
    expect(live).toHaveAttribute('aria-atomic', 'true');
    expect(live).not.toHaveAttribute('hidden');
  });

  it('ikinci çağrıda YENİ bölge oluşturmaz', async () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => result.current('bir'));
    await flushFrame();
    act(() => result.current('iki'));
    await flushFrame();

    expect(document.querySelectorAll('[id^="hanui-live-region"]')).toHaveLength(1);
    expect(region('polite')).toHaveTextContent('iki');
  });

  it('AYNI metin ikinci kez duyurulabilir', async () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => result.current('Kopyalandı'));
    await flushFrame();

    act(() => result.current('Kopyalandı'));
    expect(region('polite')).toHaveTextContent('');

    await flushFrame();
    expect(region('polite')).toHaveTextContent('Kopyalandı');
  });

  it('boş duyuru yok sayılır — bölgeyi temizleyip sıradakini bastırmaz', async () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => result.current('bir'));
    await flushFrame();
    act(() => result.current('   '));
    await flushFrame();

    expect(region('polite')).toHaveTextContent('bir');
  });

  it('döndürülen fonksiyonun referansı SABİT', () => {
    const { result, rerender } = renderHook(() => useAnnounce());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
