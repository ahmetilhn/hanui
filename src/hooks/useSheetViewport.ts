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
const measure = () => {
  const viewport = window.visualViewport;
  if (!viewport) return;

  const covered = window.innerHeight - viewport.height - viewport.offsetTop;
  const root = document.documentElement;

  root.style.setProperty(INSET_VAR, `${Math.max(0, Math.round(covered))}px`);
  root.style.setProperty(HEIGHT_VAR, `${Math.round(viewport.height)}px`);
};

/* Klavye acilirken `resize` ve `scroll` ard arda dusuyor; kare basina bir
   olcum yeterli ve her olcum bir yerlesim okumasi. */
const schedule = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    measure();
  });
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

    measure();

    return () => {
      openCount -= 1;
      if (openCount > 0) return;

      viewport.removeEventListener('resize', schedule);
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('orientationchange', schedule);

      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }

      /* Degiskenler SILINIR, sifirlanmaz: yedek deger CSS'te
         (`var(…, 0px)` / `var(…, 100dvh)`) ve panel kapaliyken dogru olan o. */
      document.documentElement.style.removeProperty(INSET_VAR);
      document.documentElement.style.removeProperty(HEIGHT_VAR);
    };
  }, [isActive]);
};

export default useSheetViewport;
