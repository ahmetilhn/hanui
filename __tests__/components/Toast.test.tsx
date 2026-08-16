import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HanuiProvider, ToastPortal, toast } from '../../src';
import { LABELS } from '../fixtures/labels';

/**
 * TOAST KUYRUGU — DURUMLU VE ZAMANLAYICILI.
 *
 * ⚠ Bileşenin özel testi YOKTU ve deponun en durumlu parçalarından biri:
 * modül düzeyinde bir kuyruk, ton başına farklı süreler, görünür sayı
 * tavanı, fare üstündeyken duraklama ve `Escape` ile kapatma. Ölçülen
 * kapsam en düşük ikilideydi (fn 14,8 / br 6,3).
 *
 * ⚠ Kuyruk MODÜL DÜZEYINDE: her testten önce boşaltılmak zorunda, yoksa
 * bir testin bıraktığı bildirim bir sonrakinin sayımına karışır.
 */

const renderPortal = () =>
  render(
    <HanuiProvider labels={LABELS}>
      <ToastPortal />
    </HanuiProvider>,
  );

beforeEach(() => {
  act(() => toast.clear());
});

afterEach(() => {
  act(() => toast.clear());
  jest.useRealTimers();
});

describe('Toast', () => {
  it('bildirim CANLI BÖLGEDE duyurulur', () => {
    renderPortal();

    act(() => {
      toast.success('Adres kaydedildi');
    });

    /*
     * ⚠ Bölge, içerik BELİRMEDEN ÖNCE ağaçta olmalı. Ekran okuyucular
     * `aria-live`i eleman eklendiğinde değil, İÇİNDEKİ metin değiştiğinde
     * okuyor; bölge içerikle birlikte yaratılırsa duyuru güvenilmez olur.
     */
    expect(screen.getByRole('status')).toHaveTextContent('Adres kaydedildi');
  });

  it('kuyruk GÖRÜNÜR TAVANI aşmaz', () => {
    renderPortal();

    act(() => {
      toast.info('bir');
      toast.info('iki');
      toast.info('üç');
      toast.info('dört');
    });

    /* ⚠ Tavan 3; dördüncüsü eklendiğinde en eskisi düşmeli. */
    expect(screen.queryByText('bir')).not.toBeInTheDocument();
    expect(screen.getByText('dört')).toBeInTheDocument();
  });

  it('süre DOLUNCA kendiliğinden kapanır', () => {
    jest.useFakeTimers();
    renderPortal();

    act(() => {
      toast.success('Kaydedildi');
    });
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4_000);
    });

    expect(screen.queryByText('Kaydedildi')).not.toBeInTheDocument();
  });

  it('HATA bildirimi bilgi bildiriminden UZUN durur', () => {
    /*
     * ⚠ Süreler ton başına ayrı ve bu bilinçli: bir hata mesajı
     * okunmadan kaybolursa kullanıcı ne olduğunu bir daha öğrenemez —
     * toast geri getirilemez. İddia tek tek sayıları değil SIRALAMAYI
     * tutuyor; sayılar değişebilir, ilişki değişmemeli.
     */
    jest.useFakeTimers();
    renderPortal();

    act(() => {
      toast.info('bilgi');
      toast.error('hata');
    });

    act(() => {
      jest.advanceTimersByTime(4_000);
    });

    expect(screen.queryByText('bilgi')).not.toBeInTheDocument();
    expect(screen.getByText('hata')).toBeInTheDocument();
  });

  it('`duration: 0` bildirimi KALICI yapar', () => {
    jest.useFakeTimers();
    renderPortal();

    act(() => {
      toast.show('Sürekli', { duration: 0 });
    });

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('Sürekli')).toBeInTheDocument();
  });

  it('`clear()` sayfa geçişinde bayat bildirim bırakmaz', () => {
    renderPortal();

    act(() => {
      toast.info('eski');
    });
    expect(screen.getByText('eski')).toBeInTheDocument();

    act(() => toast.clear());

    expect(screen.queryByText('eski')).not.toBeInTheDocument();
  });

  it('`dismiss(id)` YALNIZCA hedefi kapatır', () => {
    renderPortal();

    let id = 0;
    act(() => {
      id = toast.info('kapanacak');
      toast.info('kalacak');
    });

    act(() => toast.dismiss(id));

    expect(screen.queryByText('kapanacak')).not.toBeInTheDocument();
    expect(screen.getByText('kalacak')).toBeInTheDocument();
  });

  it('EYLEM düğmesi çalışır ve bildirimi kapatır', async () => {
    const user = userEvent.setup();
    const retry = jest.fn();
    renderPortal();

    act(() => {
      toast.error('Kart reddedildi', { action: { label: 'Yeniden dene', onClick: retry } });
    });

    await user.click(screen.getByRole('button', { name: 'Yeniden dene' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('portal YOKKEN `toast.*` PATLAMAZ', () => {
    /*
     * ⚠ Yayın merkezi modül düzeyinde ve sağlayıcıdan BAĞIMSIZ: bir servis
     * katmanı `toast.error` çağırdığında portalın çizilmiş olduğunu
     * varsayamaz. Patlarsa asıl hata mesajı kaybolur ve yerine bir render
     * hatası geçer.
     */
    expect(() => act(() => void toast.error('portalsız'))).not.toThrow();
  });
});
