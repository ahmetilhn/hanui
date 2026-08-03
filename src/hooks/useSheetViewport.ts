'use client';

import { useEffect } from 'react';

/** Panelin kaplayabilecegi en fazla yukseklik — GORUNEN alanin yuksekligi. */
const HEIGHT_VAR = '--hanui-sheet-height';

/** Panelin dibinin, yerlesim gorunum alaninin dibinden ne kadar yukarida duracagi. */
const INSET_VAR = '--hanui-sheet-inset-bottom';

/*
 * Tek olcum, tek dinleyici.
 *
 * Ayni anda birden fazla alt sayfa acilabiliyor (filtre panelinin icindeki bir
 * secim kutusu gibi). Her biri kendi dinleyicisini kursaydi ayni karede ayni
 * degeri birkac kez yazacak, ustelik ustteki panel kapandiginda alttaki hala
 * acikken degiskenler silinecekti. Sayac sifirlanmadan hicbir sey kaldirilmaz.
 */
let openCount = 0;
let frame = 0;

/**
 * Gorsel gorunum alanini olcup CSS degiskenlerine yazar.
 *
 * `window.innerHeight` YERLESIM gorunum alanidir: iOS'ta adres cubugu
 * daralmis kabul edilerek hesaplanir ve klavye onu hic kucultmez.
 * `visualViewport` ise gercekten GORUNEN alandir. Ikisinin farki, ekranin
 * dibinde kullanicinin goremedigi seridin yuksekligi: klavye, tarayicinin alt
 * cubugu ya da adres cubugu genisken asagi tasan bolum.
 *
 * `position: fixed; bottom: 0` yerlesim gorunum alanina gore hizalanir — yani
 * o seridin ALTINA. Panel bu yuzden dibinden kirpik goruluyordu; kisa bir
 * panel (alti secenekli bir liste) neredeyse yarisini kaybederken ekranin
 * cogunu kaplayan bir panel ayni kaymayi gorunur kilmiyordu.
 */
/**
 * MAKUL EN KÜÇÜK GÖRÜNÜM ALANI.
 *
 * <p>Bunun altındaki bir ölçüm bir görünüm alanı değil, GEÇİCİ BİR HÂL:
 * klavye açılırken/kapanırken, sayfa arka plana alınıp geri gelirken ve
 * `<dialog>` üst katmana girerken `visualViewport.height` bir kare boyunca
 * absürt küçük değerler raporluyor.
 *
 * <p>ÖLÇÜLDÜ (`e2e` sondası): değişkene 120 px yazıldığında panelin tamamı
 * 96 px'e iniyor — 57 px başlık + <strong>39 px gövde</strong>, yani listenin
 * yarım satırı görünen bir kaydırma yarığı. Bu, gerçek cihazda bildirilen
 * hatanın birebir görüntüsü.
 */
const MIN_VIEWPORT_HEIGHT = 240;

const measure = () => {
  const viewport = window.visualViewport;
  if (!viewport) return;

  /*
   * ABSURT OLCUM YAZILMAZ.
   *
   * Once her deger kosulsuz yaziliyordu ve tek bir gecici kare paneli
   * kullanilamaz hale getirmeye yetiyordu. Daha kotusu KALICIYDI: yanlis
   * deger ancak bir sonraki `resize` ile duzeliyor, o olay gelmezse panel
   * kapanana kadar oyle kaliyordu.
   *
   * Olcum atlandiginda ONCEKI dogru deger yerinde kalir; hicbir olcum
   * yapilmadiysa CSS yedegi (`100dvh`) devrede.
   */
  if (viewport.height < MIN_VIEWPORT_HEIGHT) return;

  const covered = window.innerHeight - viewport.height - viewport.offsetTop;
  const root = document.documentElement;

  root.style.setProperty(INSET_VAR, `${Math.max(0, Math.round(covered))}px`);
  root.style.setProperty(HEIGHT_VAR, `${Math.round(viewport.height)}px`);
};

/**
 * Kare başına bir ölçüm: klavye açılırken `resize` ve `scroll` ard arda
 * düşüyor ve her ölçüm bir yerleşim okuması.
 *
 * <h3>Kare bayrağı NEDEN sıfırlanabilir olmak zorunda</h3>
 * Bayrak yalnızca `requestAnimationFrame` geri çağrısında sıfırlanıyordu.
 * O geri çağrı ÇALIŞMAYABİLİR: tarayıcı sekme arka plandayken kareleri
 * durduruyor, iOS bunu üst katman geçişlerinde de yapıyor. Kare hiç
 * gelmediğinde bayrak sonsuza kadar dolu kalıyor ve <strong>sonraki her
 * ölçüm sessizce atlanıyordu</strong> — panel, o an ne ölçüldüyse orada
 * donuyordu. Panel açılırken bayrak elle sıfırlanıyor (bkz. kancanın
 * gövdesi).
 */
const schedule = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    measure();
  });
};

/** Bekleyen kareyi iptal eder ve bayrağı serbest bırakır. */
const cancelScheduled = () => {
  if (!frame) return;
  window.cancelAnimationFrame(frame);
  frame = 0;
};

/**
 * Alt sayfayi <strong>gorunen</strong> alana yaslar.
 *
 * <h3>Neden `dvh` ve `env()` yetmiyor</h3>
 * `dvh` tarayici cubuklarini hesaba katar ama <em>klavyeyi katmaz</em>;
 * `env(safe-area-inset-bottom)` ise cihazin centik/ana ekran cubugu payidir, o
 * da klavyeden habersiz. iOS'ta klavye acildiginda yerlesim gorunum alani hic
 * degismez: panel oldugu yerde durur, klavye uzerine biner ve alt yarisi —
 * arama kutusuyla birlikte — erisilemez hale gelir.
 *
 * <h3>Android'de ne oluyor</h3>
 * Tuketici `interactiveWidget: 'resizes-content'` verdiginde orada klavye
 * yerlesim alanini da kuculttugu icin fark sifir cikar ve bu kanca hicbir sey
 * degistirmez. Duzeltme iOS icindir, ama olcum platformdan bagimsiz dogru.
 *
 * <h3>Degiskenler `<html>` uzerinde</h3>
 * Panelin kendisine yazilamaz: `::backdrop` ve `<dialog>` ust katmandadir,
 * ayrica ayni degeri iki farkli panel paylasiyor. Kok ogeye yazmak tek kaynak
 * birakir.
 *
 * @param isActive Panel acik mi. Yalnizca acikken olculur: kendisi yalnizca
 *   acikken cizilen bir panel varsayilani kullanir, ama sayfa boyunca DOM'da
 *   duran bir panel bayraksiz cagirdiginda her kullanicida iki gorunum alani
 *   dinleyicisi bos yere acik kaliyordu.
 */
const useSheetViewport = (isActive = true) => {
  useEffect(() => {
    if (!isActive) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    openCount += 1;

    if (openCount === 1) {
      viewport.addEventListener('resize', schedule);
      viewport.addEventListener('scroll', schedule);
      window.addEventListener('orientationchange', schedule);
    }

    /*
     * Bekleyen kare IPTAL edilir ve olcum SENKRON yapilir.
     *
     * Onceki panelden kalmis, hicbir zaman calismamis bir kare bayragi
     * sonraki her olcumu susturuyordu (bkz. `schedule`). Panel her acildiginda
     * bayrak serbest birakiliyor ve deger o anda yeniden okunuyor: acilan
     * panel HER ZAMAN taze bir olcumle basliyor.
     */
    cancelScheduled();
    measure();

    return () => {
      openCount -= 1;
      if (openCount > 0) return;

      viewport.removeEventListener('resize', schedule);
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('orientationchange', schedule);

      cancelScheduled();

      /* Degiskenler SILINIR, sifirlanmaz: yedek deger CSS'te
         (`var(…, 0px)` / `var(…, 100dvh)`) ve panel kapaliyken dogru olan o. */
      document.documentElement.style.removeProperty(INSET_VAR);
      document.documentElement.style.removeProperty(HEIGHT_VAR);
    };
  }, [isActive]);
};

export default useSheetViewport;
