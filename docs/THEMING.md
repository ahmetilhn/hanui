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

**Renk** — 89 token, tema başına. Tam liste `LIGHT_THEME` / `DARK_THEME`.

**Ölçü** — 45 token, tema başına DEĞİL tek blokta: `radius-*` · `space-0…9` ·
`font-size-2xs…4xl` · `leading-*` · `icon-xs…xl` · `duration-*` · `ease-*`.
Bir markanın yuvarlaklığı açık temada 12 px, koyu temada 8 px olmaz.

**Font** — üç rol: `heading` (≥19 px), `body` (arayüz metni), `mono` (teknik
veri). Kütüphane font **yüklemez**; yüklemeyi tüketici yapar.

## Koyu bandın üzerindeki bileşen

Üst bant, alt bilgi ve panel rayı **iki temada da koyu**; bileşenler ise sayfa
yüzeyine (`surface*`) göre stillenir. Böyle bir bandın içinde kalan bileşen
için çözüm **iç sınıflarına kural yazmak değil** — o sınıflar bir sonraki
yayında değişir ve kural sessizce düşer — kapsayıcıda ilgili token'ları bandın
kendi tonlarına bağlamaktır.

Çoğu bileşen genel üçlüyü (`--hanui-surface*` · `--hanui-text*` ·
`--hanui-border`) okur ve **kapsayıcıda o üçlüyü bağlamak yeter.** Koyu bir
`Drawer` için gereken tam liste:

```scss
.drawer--rail {
  --hanui-surface: #{$rail-bg};    /* panelin zemini */
  --hanui-surface-2: #{$rail-hover}; /* kapat düğmesinin hover'ı */
  --hanui-text: #{$rail-fg};       /* başlık (`heading()` bunu okur) */
  --hanui-text-2: #{$rail-fg-2};   /* kapat düğmesi, ikincil metin */
  --hanui-border: #{$rail-line};   /* başlık/araç/dip ayırıcıları */
}
```

### Kendi adını taşıyan kanallar

**Kanal yalnızca genel üçlünün ULAŞAMADIĞI yerde açılır.** Ölçüt bu: bileşen
değerini genel yüzeyden değil ayrı bir aileden alıyorsa kapsayıcının elinde
hiçbir kaldıraç kalmıyor demektir. Ulaşabildiği yerde ikinci bir mekanizma
açmak — `--hanui-drawer-*` gibi — iki eksik yol bırakır ve tüketici hangisinin
neyi kapsadığını denemek zorunda kalır.

| Bileşen | Kanal | Neden genel üçlü yetmiyor |
| --- | --- | --- |
| `Badge` (`tone="neutral"`) | `--hanui-badge-bg` · `-fg` · `-line` | Nötr ton `tint(neutral)` ile `off-*` ailesinden gelir |
| `Carousel` | `--hanui-carousel-item` | Ölçü; renk sözleşmesinde karşılığı yok |

```scss
.rail__badge {
  --hanui-badge-bg: #{$rail-hover};
  --hanui-badge-fg: #{$rail-fg-2};
  --hanui-badge-line: #{$rail-line};
}
```

Ölçüldü: koyu rayın üzerindeki nötr rozet açık temada `#f1f2f5` zeminle
çiziliyordu — koyu bir menünün ortasında bembeyaz bir yapışkan etiket.
Tüketici doğru olanı yapıp `--hanui-surface-2` üçlüsünü bağlamıştı ama rozetin
nötr tonu o üçlüyü hiç okumuyordu.

**Durum tonları (`success`, `danger`, `warning`, `info`) bilinçli olarak
ezilemez.** Renk orada anlam taşıyor; kapsayıcının bir hata rozetini sessizce
nötrleştirmesi, taşıdığı bilgiyi yok ederdi.

## Yerleşim sözleşmeleri

Bazı bileşenler kapsayıcıya yalnızca renk değil **yerleşim** de bırakır.

| Değişken | Okuyan | Ne yapar |
| --- | --- | --- |
| `--hanui-field-label-order` | `Field` | Etiketin dikey sırası |
| `--hanui-field-message-order` | `Field` · `DateRange` | Yardım/hata/özet metninin dikey sırası |

`FilterBar` ikisini de yeniden bağlar: yoğun bir filtre şeridi denetimleri alt
kenardan hizalar ve denetimin **altına** yazılan bir metin alanın alt kenarını
kaydırıp o denetimi komşularından yukarı itiyordu (ölçüldü: yan yana iki girdi
24 px kaçık). Şeritte sıra etiket → ipucu → denetim olur; **DOM sırası ve
`aria-describedby` bağı değişmez**, yer değiştiren öğeler odaklanabilir değil.

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

### ⚠ Aynı kural sizin ELEMAN tipografinizi de kazandırır

Katmansız kuralın her zaman kazanması iki yönlü çalışır ve ters yönü kolayca
gözden kaçıyor: `globals.css` içindeki katmansız bir `h1–h6` bildirimi,
`@layer hanui` içindeki **bütün** başlık stillerini ezer — `Panel`, `Modal` ve
`Drawer`ın `h2`si, `EmptyState`in `h3`ü. Ölçüldü: bir tüketicide `Panel`
başlığı 16 px yerine 24 px çiziliyordu ve hiçbir katman uyarmıyordu, çünkü
teknik olarak doğru çalışıyordu.

Sıfırlama ve eleman tipografisi **kendi katmanına** alınır:

```css
@layer app-base, hanui, app;

@layer app-base {
  h1, h2, h3 { font-size: …; }   /* artık hanui'ye YENİLİR */
}
```

Bileşene özel ezmeler katmansız kalmaya devam eder (yukarıdaki `.my-card`);
kazanması istenen tek şey onlar.

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
