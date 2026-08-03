'use client';

import { useCallback } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

/** Duyurunun aciliyeti. */
export type AnnouncePoliteness = 'polite' | 'assertive';

/**
 * EKRAN OKUYUCU DUYURU MERKEZİ.
 *
 * <h3>Sorun: görsel geri bildirimin sesli karşılığı yoktu</h3>
 * Asenkron bir sonuç ekranda görünüyor ama ekran okuyucuya HİÇ ulaşmıyordu:
 * filtre uygulanıp liste 48 ürüne düştüğünde, sepete ekleme başarılı
 * olduğunda, form gönderimi hata verdiğinde. Gören kullanıcı sonucu bir
 * bakışta alıyor; ekran okuyucu kullanıcısı odağı olmayan bir yerde değişen
 * içeriği fark etmiyor — imleci oraya götürmedikçe.
 *
 * <p>Kütüphanede yalnızca `CopyField` kendi başına duyuruyordu ve o da kendi
 * `aria-live` bölgesini kendisi çiziyordu. Aynı deseni her bileşene kopyalamak
 * sayfada onlarca canlı bölge demek — ve birden fazla canlı bölge, ekran
 * okuyucuların duyuruları BİRLEŞTİRİP sırayla okumasına ya da tamamen
 * atlamasına yol açıyor.
 *
 * <h3>Bölge sağlayıcıda DEĞİL, belgede</h3>
 * `HanuiProvider` zorunlu değil (bkz. `theme/context.ts`): tek bir `Badge`
 * kullanmak isteyen tüketici kök yerleşimini değiştirmek zorunda kalmasın.
 * Duyuru bölgesi sağlayıcıya bağlansaydı, sağlayıcısız kullanımda hiçbir şey
 * duyurulmazdı — üstelik sessizce. Bölge ilk çağrıda belgeye eklenir ve
 * uygulamanın ömrü boyunca orada kalır; DOM'a eklenen bir canlı bölgenin
 * duyurusu güvenilmez, önceden var olması gerekir.
 *
 * <h3>Neden iki ayrı bölge</h3>
 * `polite` sıradaki cümleyi bekler, `assertive` kullanıcının okuduğu şeyi
 * BÖLER. Tek bir bölgede `aria-live` değerini değiştirmek işe yaramıyor:
 * değişiklik bir sonraki duyuruda değil, o anda okunmakta olanda etkili
 * olmuyor. Hata için `assertive` (kullanıcı yanlış bir işe devam ediyor
 * olabilir), geri kalan her şey için `polite`.
 *
 * @example
 * const announce = useAnnounce();
 * announce(`${count} ürün bulundu`);
 * announce('Kart reddedildi', 'assertive');
 */

const REGION_ID = 'hanui-live-region';

/** Bölgeyi bulur; yoksa oluşturur. */
const getRegion = (politeness: AnnouncePoliteness): HTMLElement | null => {
  if (!isClient()) return null;

  const id = `${REGION_ID}-${politeness}`;
  const existing = document.getElementById(id);
  if (existing) return existing;

  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('aria-live', politeness);
  /* `aria-atomic` — bolge her degistiginde TAMAMI okunur. Kapali
     birakildiginda ekran okuyucular yalnizca DEGISEN kelimeleri okuyor ve
     "48 urun bulundu" ile "12 urun bulundu" arasinda yalnizca sayi
     duyuruluyordu. */
  region.setAttribute('aria-atomic', 'true');
  /* Gorsel olarak gizli ama DOM'da: `display: none` ya da `hidden` bolgeyi
     erisilebilirlik agacindan da cikarir ve hicbir sey duyurulmaz. */
  region.className = 'hanui-visually-hidden';

  document.body.appendChild(region);
  return region;
};

/**
 * AYNI metni arka arkaya duyurmak.
 *
 * <p>Bölgenin metni değişmediğinde ekran okuyucu hiçbir şey okumaz: "Kopyalandı"
 * ikinci kez basıldığında sessiz kalıyordu. Metin önce boşaltılıp bir kare
 * sonra yazılıyor — değişiklik böylece gerçekten bir değişiklik oluyor.
 */
const write = (region: HTMLElement, message: string): void => {
  region.textContent = '';

  window.requestAnimationFrame(() => {
    region.textContent = message;
  });
};

/**
 * Duyuru fonksiyonu döndürür. Referans SABİT: bağımlılık dizisine güvenle
 * konur, her render'da yeni bir kapanış üretip etkileri tetiklemez.
 */
const useAnnounce = (): ((message: string, politeness?: AnnouncePoliteness) => void) =>
  useCallback((message: string, politeness: AnnouncePoliteness = 'polite') => {
    const trimmed = message.trim();
    /* Bos duyuru bolgeyi temizler ve bir sonraki gercek duyuruyu bastirir. */
    if (trimmed === '') return;

    const region = getRegion(politeness);
    if (region) write(region, trimmed);
  }, []);

export default useAnnounce;
