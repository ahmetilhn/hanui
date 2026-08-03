# Marka uyarlama

Kütüphane **iki katmanlı** bir sözleşme sunar: renk ve ölçü. İkisi de çalışma
zamanında ezilir; kaynak derlemesi gerekmez.

```tsx
const THEME = {
  light: { blue: '#0d6efd', 'blue-text': '#0a58ca' },
  dark: { blue: '#6ea8fe' },
  fonts: { heading: 'Archivo, sans-serif' },
  metrics: { 'radius-md': '2px', 'radius-lg': '4px', 'duration-normal': '120ms' },
};

<HanuiProvider theme={THEME}>…</HanuiProvider>;
```

React'in dışından (bir `<head>` betiğinden) aynı işi `initHanui({ theme })`
yapar.

## Ezilebilenler

**Renk** — 88 token, tema başına. Tam liste `LIGHT_THEME` / `DARK_THEME`.

**Ölçü** — 45 token, tema başına DEĞİL tek blokta: `radius-*` · `space-0…9` ·
`font-size-2xs…4xl` · `leading-*` · `icon-xs…xl` · `duration-*` · `ease-*`.
Bir markanın yuvarlaklığı açık temada 12 px, koyu temada 8 px olmaz.

**Font** — üç rol: `heading` (≥19 px), `body` (arayüz metni), `mono` (teknik
veri). Kütüphane font **yüklemez**; yüklemeyi tüketici yapar.

## Ezilemeyenler ve nedenleri

| | Neden |
| --- | --- |
| Kırılma noktaları | `@media (max-width: var(--x))` geçersiz CSS |
| Katman (`z-*`) | Yığılma sırası, marka kararı değil |
| Dokunma hedefi (44 px) | Yoğun kipte bile küçülmemeli (WCAG 2.5.8) |

## Tema seçimi

`<html data-hanui-theme="dark">`. Öznitelik yoksa `prefers-color-scheme`
yedeği devreye girer — ama kullanıcının **açık bir seçimi** varsa sistem
tercihi onu ezmez.

`useHanuiTheme()` üç alan döndürür: `scheme` (çözülmüş), `preference`
(kullanıcının seçimi, `system` dahil) ve `setScheme`. Üç durumlu bir anahtar
`preference` okur.

**İlk boyamadan önce yazın** — sağlayıcı ağaç monte olduktan sonra çalışıyor
ve koyu tema seçmiş kullanıcı o ana kadar bir kare beyaz ekran görüyor.

## Bilgi yoğunluğu

`<html data-hanui-density="compact">` — satır yüksekliği, dolgu ve punto bir
kademe iner. Yarıçap değişmez (yuvarlaklık yoğunluğun değil markanın işi) ve
dokunma hedefi küçülmez.

## CSS'i ezmek

Kütüphane CSS'inin tamamı `@layer hanui` içinde. Katmanlı bir kural, katmansız
bir kurala **her zaman yenilir**:

```css
.my-card { padding: 0; }   /* bu kadarı yeter; !important gerekmez */
```

## Token zinciri

```
theme/palette.ts   → ham hex (TEK hex kaynağı)
theme/tokens.ts    → LIGHT_THEME · DARK_THEME · METRIC_TOKENS · COMPACT_DENSITY
styles/*.generated → ÜRETİLİR (npm run tokens)
```

Elle tutulan iki liste ayrışıyor ve ayrışma sessiz: bileşen
`var(--hanui-yok)` okuyup rengini kaybediyor, derleme yeşil dönüyor. Nöbetçi
`theme/__tests__/tokens.contract.test.ts`.

**Ölçüler CSS değişkeni olduğu için SCSS aritmetiği çalışmaz** — ve Sass hata
da vermez, ifadeyi olduğu gibi geçirip tarayıcıya geçersiz CSS yazar. Hesap
`calc()` içinde yazılır.
