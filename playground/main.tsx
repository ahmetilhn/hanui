import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { HanuiProvider, LABELS, SCENARIOS } from './scenarios';
import { SOLO_ONLY } from './solo';

/*
 * Kutuphanenin GLOBAL stil sayfasi ACIKCA import ediliyor.
 *
 * `src/index.ts` onu zaten yan etki olarak cekiyor ama galeri kaynagi dogrudan
 * tuketiyor ve bu yapilandirmada satir sessizce dusuyordu: bilesenlerin CSS
 * modulleri geliyor, token yayini (`:root`) gelmiyordu. Sonuc gorunuyordu ama
 * teshis edilmesi zor — her renk ve font `var()` yedegine, yani hicbir seye
 * iniyor ve galeri serif harflerle beyaz bir sayfa olarak aciliyordu.
 */
import '../src/styles/base.scss';

import './playground.css';

/**
 * BİLEŞEN GALERİSİ.
 *
 * <h3>Neden Storybook değil</h3>
 * Storybook bu boyuttaki bir kütüphaneye orantısız: kendi bundler'ı, kendi
 * eklenti ekosistemi ve her büyük sürümünde bir göç işi geliyor. Buradaki
 * ihtiyaç bundan küçük — bileşenleri iki temada yan yana görmek ve görsel
 * regresyona bir kaynak vermek. Bir `index.html`, bir liste ve Vite bunun
 * için yeterli; galeri kütüphanenin KAYNAĞINI import ediyor, derlenmiş
 * paketini değil, yani değişiklik anında görülüyor.
 *
 * <h3>Durum adres çubuğunda</h3>
 * `?theme=dark&dir=rtl&solo=Modal`. Görsel regresyon aynı sayfayı bu
 * parametrelerle açıyor: kip pencerenin ekran görüntüsünü almak için tıklama
 * senaryosu yazmak gerekmiyor ve tarayıcı otomasyonu ile insan aynı adresi
 * paylaşıyor.
 */

const params = new URLSearchParams(window.location.search);

const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
const direction = params.get('dir') === 'rtl' ? 'rtl' : 'ltr';
const density = params.get('density') === 'compact' ? 'compact' : 'default';
const solo = params.get('solo');

document.documentElement.setAttribute('data-hanui-theme', theme);
document.documentElement.setAttribute('dir', direction);
document.documentElement.setAttribute('data-hanui-density', density);

const entries = Object.entries(SCENARIOS).filter(([name]) =>
  solo ? name === solo : !SOLO_ONLY.includes(name as (typeof SOLO_ONLY)[number]),
);

const Gallery = () => (
  <HanuiProvider labels={LABELS}>
    {!solo && (
      <header className="gallery__bar">
        <h1>hanui — bileşen galerisi</h1>
        <nav>
          <a
            href={`?theme=${theme === 'dark' ? 'light' : 'dark'}&dir=${direction}&density=${density}`}
          >
            {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
          </a>
          <a href={`?theme=${theme}&dir=${direction === 'rtl' ? 'ltr' : 'rtl'}&density=${density}`}>
            {direction === 'rtl' ? 'LTR' : 'RTL'}
          </a>
          <a
            href={`?theme=${theme}&dir=${direction}&density=${density === 'compact' ? 'default' : 'compact'}`}
          >
            {density === 'compact' ? 'Ferah' : 'Yoğun'}
          </a>
        </nav>
      </header>
    )}

    <main className="gallery">
      {entries.map(([name, states]) => (
        <section key={name} className="gallery__section" data-gallery={name}>
          <h2 className="gallery__title">{name}</h2>

          <div className="gallery__states">
            {Object.entries(states).map(([state, element]) => (
              <div key={state} className="gallery__state" data-state={state}>
                <span className="gallery__label">{state}</span>
                <div className="gallery__stage">{element}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  </HanuiProvider>
);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
