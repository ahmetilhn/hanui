# @ahmetilhn/hanui

Erişilebilir, tema güdümlü React bileşen kütüphanesi. SCSS Modules üzerine
kurulu; tek çalışma zamanı bağımlılığı ikon seti (`react-bootstrap-icons`).

- **Tek CSS dosyası, iki tema.** Açık ve koyu hazır gelir, her token dışarıdan
  ezilebilir.
- **Yönlendirici enjekte edilir.** `next/link`, `react-router`, ham `<a>` —
  karar tüketicinin.
- **Metin dışarıdan, ama BİR KEZ.** Kütüphane hiçbir dilde metin uydurmaz;
  kullanıcıya görünen dizeler sağlayıcıda tek yerde tanımlanır.
- **Yerel öğeler korunur.** `<dialog>`, `<input type="range">`,
  `<input type="radio">` — odak tuzağı, klavye gezinmesi ve ekran okuyucu
  duyurusu tarayıcıdan gelir.

```bash
npm install @ahmetilhn/hanui @ahmetilhn/handy-utils react-bootstrap-icons
```

`react`, `react-dom`, `@ahmetilhn/handy-utils` ve `react-bootstrap-icons`
**peer** bağımlılıktır.

---

## Hızlı başlangıç

```tsx
// Uygulamanın kökünde BİR KEZ.
import '@ahmetilhn/hanui/styles.css';
```

```tsx
import { Button, Field, Input, UIVariant } from '@ahmetilhn/hanui';

<Field label="E-posta" isRequired error={error}>
  {props => <Input {...props} type="email" value={email} onChange={onChange} />}
</Field>

<Button variant={UIVariant.PRIMARY} isLoading={isSaving} onClick={save}>
  Kaydet
</Button>;
```

Sağlayıcı **zorunlu değil**: paket kurulup hiçbir yapılandırma yapılmadan
çalışır. Bağlantılar ham `<a>` olur, tema varsayılanlarda kalır.

---

## Tema

### Tema seçimi `<html>` üzerinde taşınır

```html
<html data-hanui-theme="dark">
```

Öznitelik yoksa `prefers-color-scheme` yedeği devreye girer — ama kullanıcının
**açık bir seçimi** varsa sistem tercihi onu ezmez.

### İlk boyamadan önce yazın

```tsx
// app/layout.tsx — <head> içine.
<script
  dangerouslySetInnerHTML={{
    __html: `document.documentElement.dataset.hanuiTheme =
      localStorage.getItem('theme') ?? 'light';`,
  }}
/>
```

Bu satır React ağacına konamaz: sağlayıcı ağaç monte olduktan sonra çalışıyor
ve koyu tema seçmiş kullanıcı o ana kadar **bir kare beyaz ekran** görüyor.

### Token'ları ezmek

Yalnızca değiştirdiğiniz token'ı verin; gerisi varsayılanında kalır.

```tsx
import { HanuiProvider } from '@ahmetilhn/hanui';

const THEME = {
  light: { blue: '#0d6efd', 'blue-text': '#0a58ca' },
  dark: { blue: '#6ea8fe' },
  fonts: { heading: 'Archivo, sans-serif', body: 'Inter, sans-serif' },
  // Ölçüler tema başına DEĞİL: bir markanın yuvarlaklığı açık temada
  // 12 px, koyu temada 8 px olmaz.
  metrics: { 'radius-md': '2px', 'radius-lg': '4px', 'duration-normal': '120ms' },
};

<HanuiProvider theme={THEME} linkComponent={NextLink}>
  <App />
</HanuiProvider>;
```

React'in dışından (bir `<head>` betiğinden, Storybook'tan) aynı işi
`initHanui({ theme })` yapar.

**Kütüphane font YÜKLEMEZ.** `fonts` yalnızca `font-family` dizesi; yüklemeyi
(`next/font`, `@font-face`, CDN) siz yaparsınız. Bir UI paketinin ağdan font
çekmesi, sizin ölçemediğiniz bir istek demek.

#### Ezilebilen ölçüler

`radius-*` · `space-0…9` · `font-size-2xs…4xl` · `leading-*` · `icon-xs…xl` ·
`duration-*` · `ease-*` — tam liste `METRIC_TOKENS` içinde ve dışa veriliyor.

Ezilemeyenler ve nedenleri: **kırılma noktaları** (`@media (max-width: var(--x))`
geçersiz CSS), **katman (`z-*`)** (yığılma sırası, marka kararı değil) ve
**dokunma hedefi** (44 px; yoğun kipte de küçülmemeli — WCAG 2.5.8).

### Bilgi yoğunluğu

```html
<html data-hanui-density="compact"></html>
```

Satır yüksekliği, dolgu ve punto bir kademe iner. Vitrin bir ekranda 8 satır,
operasyon paneli 80 satır gösteriyor; ikisini tek ölçekle karşılamanın yolu yok.
Kararı `initHanui({ density: 'compact' })` da verebilir.

**Yarıçap değişmez** (yuvarlaklık yoğunluğun değil markanın işi) ve **dokunma
hedefi küçülmez**: görsel kutu daralır, `tap-target` örtüsü 44 px kalır.

### CSS'imizi ezmek — `@layer hanui`

Kütüphane CSS'inin tamamı `@layer hanui` içinde. Katmanlı bir kural, katmansız
bir kurala **her zaman yenilir** — özgüllüğe ve sıraya bakılmaksızın:

```css
/* Bu kadarı yeter; `!important` ya da `.app .card .card` gerekmez. */
.my-card {
  padding: 0;
}
```

Katman olmadan sizin sınıfınız ile bizimki aynı özgüllükte (0,1,0) yarışıyordu
ve kazananı **kaynak sırası** belirliyordu; o sıra da bundler'ınızın elinde —
geliştirme ile üretim aynı olmak zorunda değil.

### Temayı değiştirmek

```tsx
const { scheme, preference, setScheme, toggle, isReady } = useHanuiTheme();

useEffect(() => {
  if (isReady) localStorage.setItem('theme', preference);
}, [preference, isReady]);
```

| Alan | |
| --- | --- |
| `scheme` | **ÇÖZÜLMÜŞ** tema — ekranda çizili olan (`light` \| `dark`) |
| `preference` | kullanıcının **SEÇİMİ** (`light` \| `dark` \| `system`) |
| `setScheme` | `'system'` verildiğinde açık seçim SİLİNİR |

Üç durumlu bir anahtar (Açık / Koyu / Sistem) `preference` okur; `scheme`
okusaydı "Sistem" seçiliyken düğme "Koyu"yu işaretli gösterirdi. `system` bir
değer değil **değerin yokluğu**: öznitelik silinir ve
`:not([data-hanui-theme])` sorgusu devreye girer.

Kalıcılık **kancanın işi değil**: seçimi `localStorage`a mı, sunucuda
okunabilsin diye bir çereze mi, kullanıcı profiline mi yazacağınız sizin
kararınız. Kütüphane `localStorage`a yazsaydı sunucu tarafı onu okuyamayacağı
için ilk boyama yine yanlış temada olurdu.

`isReady`: sunucu çıktısında ve hidrasyondan önceki ilk karede `false`. Tema
anahtarını çizmeden önce bekleyin — sunucu hangi temanın seçili olduğunu
bilmiyor ve bir tahminle çizilen anahtar, doğru tahmin edilse bile hidrasyonda
uyuşmazlık üretiyordu.

### Token katmanları

```
theme/palette.ts   → ham hex (TEK hex kaynağı)
theme/tokens.ts    → anlamsal token → değer
                     LIGHT_THEME / DARK_THEME  (renk, temaya bağlı)
                     METRIC_TOKENS             (ölçü, temadan bağımsız)
                     COMPACT_DENSITY           (yoğun kipin ezdikleri)
styles/*.generated → yukarıdakinden ÜRETİLİR (npm run tokens)
```

SCSS ve TypeScript tarafı elle tutulsaydı bir tarafta var olup diğerinde
olmayan bir token çıkardı — ve ayrışma sessiz: bileşen `var(--hanui-yok)`
okuyup rengini kaybediyor, derleme yeşil dönüyor. Nöbetçi
`theme/__tests__/tokens.contract.test.ts`.

**Ölçüler CSS değişkeni olduğu için SCSS aritmetiği çalışmaz.**
`$space-8 - $space-2` derlenmez — ve Sass hata da vermez: ifadeyi olduğu gibi
geçirip tarayıcıya `var(--a)-var(--b)` yazar, tarayıcı bütün bildirimi atar.
Hesap `calc()` içinde yazılır, negatif değer dahil:

```scss
padding-inline-start: calc(#{$space-8} - #{$space-2});
margin-inline: calc(-1 * #{$space-2});
```

---

## Metinler

Kütüphane "Kapat" yazamaz: hangi dilde, hangi üslupta, hangi terimle
yazacağını bilmez. Ama aynı dizeyi yüz çağrı yerine dağıtmak da doğru değil —
biri değiştiğinde doksan dokuzu eski kalıyor. Metinler **bir kez**, sağlayıcıda
verilir:

```tsx
<HanuiProvider
  labels={{
    close: 'Kapat',
    cancel: 'Vazgeç',
    submit: 'Kaydet',
    loading: 'Yükleniyor',
    required: '(zorunlu)',
    filters: 'Filtreler',
    breadcrumb: 'Konum',
    directoryJump: 'Harfe göre atla',
    selectPlaceholder: 'Seçiniz',
    locale: 'tr',
    currency: '₺',
    combobox: {
      searchPlaceholder: 'Ara…',
      emptyMessage: 'Sonuç bulunamadı',
      loadingMessage: 'Aranıyor…',
      clearLabel: 'Seçimi temizle',
    },
    pagination: { label: 'Sayfalar', previous: 'Önceki sayfa', next: 'Sonraki sayfa' },
    quantity: { label: 'Adet', decrease: 'Adeti azalt', increase: 'Adeti artır' },
    range: { min: 'En az', max: 'En çok' },
    dataTable: { empty: 'Kayıt bulunamadı.', loading: 'Yükleniyor…' },
    copyField: {
      copy: value => `${value} kopyala`,
      copied: value => `${value} kopyalandı`,
      announcement: 'Panoya kopyalandı',
    },
    rating: {
      srLabel: (value, count) => `5 üzerinden ${value}${count ? `, ${count} değerlendirme` : ''}`,
      starCount: star => `${star} yıldız`,
      scale: { 1: 'Hiç memnun kalmadım', 2: 'Beklentimi karşılamadı', 3: 'İdare eder', 4: 'Memnun kaldım', 5: 'Çok memnun kaldım' },
    },
  }}
>
```

**Çözümleme sırası: prop → config → geliştirme uyarısı.** Bir prop verilmişse o
kazanır; bağlama göre farklı olması gereken yerlerde (`closeLabel="Daha sonra"`)
hâlâ prop geçilir.

### Config'e girmeyenler

Öğeye **özgü** hiçbir metin config'e girmez — her çağrı yerinde farklı olduğu
için bir uygulama düzeyinde varsayılanı olamaz:

`Modal.title` · `ConfirmDialog.confirmLabel` ("Sil" — eylemi tekrarlamak
zorunda; "Tamam" kullanıcıya neyi onayladığını söylemez) · `IconButton.label` ·
`Select.label` · `Combobox.labels.placeholder` · `TableCheckbox.label` ·
`ChipGroup.label` · `RatingInput.label`

### Eksik metin nasıl görünür

TypeScript sağlayıcının çalışma zamanında ne taşıdığını göremiyor, o yüzden
prop'lar isteğe bağlı. Ne prop ne config varsa öğe adsız kalır ve bu geliştirme
kipinde konsola düşer:

```
[hanui] Eksik metin: Modal.closeLabel. Prop olarak geçin ya da
<HanuiProvider labels={…}> içinde bir kez tanımlayın.
```

Uyarı anahtar başına bir kez verilir; yirmi satırlık bir liste konsolu
doldurmaz.

---

## Yönlendirici

```tsx
import NextLink from 'next/link';

<HanuiProvider linkComponent={NextLink}>…</HanuiProvider>;
```

Bir bileşen kütüphanesi kendi yönlendiricisini **seçemez**: `next/link` import
etmek paketi Next'e bağlar, `react-router` import etmek başka bir uygulamayı
kırar.

Yönlendiriciye özgü props `linkProps` ile geçer:

```tsx
<Pagination buildHref={page => `?sayfa=${page}`} linkProps={{ scroll: false }} … />
```

---

## Yapışkan başlık

Sayfa kaydırmasına yapışan bileşenler (`DirectoryGroup`, `DirectoryJump`,
kapaklı `DataTable`) offset'i `--hanui-header-height`ten okur ve **varsayılanı
0**. Kendi yapışkan bandınız varsa gerçek ölçüyü yazın:

```tsx
useEffect(() => {
  const observer = new ResizeObserver(([entry]) =>
    document.documentElement.style.setProperty(
      '--hanui-header-height',
      `${entry.contentRect.height}px`,
    ),
  );
  observer.observe(headerRef.current!);
  return () => observer.disconnect();
}, []);
```

Sabit bir sayı yazmayın: bant mobilde arama kutusu kendi satırına düştüğünde
büyür, bir duyuru şeridi çıkıp kaybolduğunda değişir.

---

## Bileşen kataloğu

| Grup       | Bileşenler                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Eylem      | `Button` · `IconButton` · `TextLink` · `Tooltip`                                                                                              |
| Seçim      | `Chip` · `ChipGroup` · `Select` · `Combobox` · `Checkbox` · `Radio` · `RadioCard` · `RangeSlider` · `RatingInput` · `QuantityStepper` · `TableCheckbox` |
| Girdi      | `Input` · `Textarea` · `Field`                                                                                                                |
| Yüzey      | `Card` (+ `CardMedia`, `CardOverlay`, `CardBody`, `CardFooter`) · `Panel` (+ `PanelForm`, `PanelRow`) · `PageHeader` · `SectionHeader` · `Tile` · `Directory` |
| Geri bild. | `Alert` · `Badge` · `EmptyState` · `Skeleton` · `Spinner` · `Divider` · `Avatar` · `Rating` · `Price` · `CopyField` · `Breadcrumb`             |
| Kipsel     | `Modal` · `BottomSheet` · `ConfirmDialog` · `PromptDialog`                                                                                     |
| Veri       | `Table` (+ `TableScroller`) · `DataTable` (+ `DataTableRow`) · `FilterBar` (+ `FilterBarField`) · `Pagination`                                 |

### Seçenek sayısı öğeyi belirler

| Seçenek sayısı | Öğe                                             |
| -------------- | ----------------------------------------------- |
| 2–4            | `ChipGroup` — hepsi ekranda, tek dokunuş        |
| 5–20           | `Select` — aramasız liste; mobilde alt sayfa    |
| 20+            | `Combobox` — yazarak ara                        |
| Aralık         | `RangeSlider` (+ kesin değer için sayı girdisi) |
| Tekil aç/kapa  | `Checkbox`                                      |

Hepsini onay kutusu listesi yapmak tek tip ama kötü bir arayüzdür: 1121 markayı
da 3 seçeneği de aynı biçimde göstermek, ikisini de yanlış gösterir.

---

## Sistemin taşıdığı kararlar

**Doygun dolgu = tıklanabilir.** Durum etiketleri **her zaman** tint zeminli
(`Badge`, `Alert`), eylemler **her zaman** dolgulu veya çerçeveli. Bu ayrım
bozulduğunda kullanıcı durum etiketine tıklamayı deniyor. `Badge`in `solid`
varyantı durum tonlarında bilinçli olarak `soft` ile aynı şeyi verir.

**Bir ekranda tek `PRIMARY`.** `UIVariant` bir vurgu hiyerarşisi: iki dolu düğme
yan yana durduğunda hiçbiri öne çıkmaz. `UIVariant.CART` ekrandaki tek doygun
turuncu — dönüşüm eylemi.

**Renk tek başına anlam taşımaz** (WCAG 1.4.1). Her durum bir metin, ikon veya
işaretle de bildirilir: `Alert`in her tonunun kendi ikonu var, `Field`in zorunlu
yıldızının yanında okunabilir bir metin, `RatingInput`in yıldızlarının altında
açıklama duruyor.

**İkonlar `react-bootstrap-icons`ten, DOLU sürümüyle.** Kabuk simgeleri
(`Modal`ın kapatma çarpısı, `Select`in oku, `Alert`in durum ikonu) bir zamanlar
kütüphanenin içinde elle çizilmiş yollardı; bir ikon setinin bakımını üstlenmek
hiçbir şey kazandırmıyordu — tüketici uygulamalar kendi içerik ikonlarını zaten
aynı setten alıyor ve paket `external`, yani ikinci bir kopya inmiyor. Dolu
(`*Fill`) sürüm kural: ince konturlu bir simge, tint zeminde ve küçük ölçüde
tek piksele inip kayboluyor. Fill eşi olmayan simgelerde (`X`, `Check`, `Plus`,
`Dash`) kalın `*Lg` sürümü kullanılır, chevron yerine dolu `Caret*Fill` —
böylece bütün kabuk aynı çizgi ağırlığında kalır. İçerik ikonları (kategori
simgesi, marka logosu) her zaman `ReactNode` prop'u olarak DIŞARIDAN gelir.

**İkon ölçüsü metin puntosundan ayrıdır.** İkonlar `1em` ile ölçeklenir ama
taşındıkları kutunun `font-size` değeri metin için seçilmiştir ve simge için
küçük kalır: 40 px'lik bir `IconButton`ın ortasındaki 16 px'lik simge tıklanabilir
görünmüyordu. Ölçek ayrı bir token dizisidir (`$icon-xs` … `$icon-xl`,
14/16/18/20/24 px) ve ikon taşıyan her kutu puntosunu oradan alır.

**"Yüklenemedi" ile "boş" ayrı durumlardır.** `DataTable`da `error` verilmişken
boş mesajı **asla** çizilmez; bir ağ hatasını "kayıt kalmamış" diye okutmak
kullanıcıya yanlış karar verdirir.

**Yerel öğe, taklit öğeden iyidir.** `<dialog>`, `<input type="range">`,
`<input type="radio">` korunur. Tek istisna `<select>`: açılır listesinin içine
hiçbir biçimde girilemiyor ve mobil tekerleği uygulamanın geri kalanına hiç
benzemiyor. Bedeli (odak yönetimi, ok tuşları, `aria-activedescendant`) bir kez
ödenip tek bileşene kapatıldı.

**Dokunma hedefi en az 44×44 px** (WCAG 2.5.8). Görsel kutu daha küçük olabilir;
tıklanabilir alan görünmez bir örtüyle korunur.

**Hareket 200 ms'yi geçmez** ve `prefers-reduced-motion` her animasyonda
karşılanır.

**Odak halkası `:focus-visible` ile.** `:focus` fareyle tıklandığında da halka
gösterip görsel gürültü yaratıyor ve kullanıcılar bunu hata sanıyordu.

---

## Next.js App Router

Paket `'use client'` sınırını **kendi içinde** çizer: sunucu bileşenlerinden
doğrudan import edilebilir, `children` sunucuda çizilip aktarılır.

```tsx
// app/layout.tsx
import '@ahmetilhn/hanui/styles.css';
import { HanuiProvider } from '@ahmetilhn/hanui';
import NextLink from 'next/link';
```

---

## Geliştirme

```bash
nvm use            # .nvmrc → 24
npm install
npm run verify     # tokens → kontrast → typecheck → lint → kapsam → build → boyut
npm run playground # bileşen galerisi → http://localhost:5273
```

| Komut                     |                                                                 |
| ------------------------- | --------------------------------------------------------------- |
| `npm run tokens`          | SCSS token dosyalarını `theme/tokens.ts`ten üretir              |
| `npm run build`           | `build/` (ESM + CJS + `.d.ts` + `styles.css`)                   |
| `npm run test`            | Jest + Testing Library + `jest-axe`                              |
| `npm run test:coverage`   | kapsam kapısı — `helpers`/`hooks`/`theme` satır ≥ %80            |
| `npm run test:visual`     | görsel regresyon (Playwright); `verify` İÇİNDE DEĞİL, aşağı bkz. |
| `npm run test:device`     | iOS (WebKit) + Android (Chromium) davranış nöbetçileri, aşağı bkz. |
| `npm run check:contrast`  | WCAG kontrast ölçümü, iki temada 120 çift                        |
| `npm run size`            | paket boyutu bütçesi (`size-limit`)                              |
| `npm run playground`      | bileşen galerisi (tema · RTL · yoğunluk anahtarı)                |
| `npm run lint`            | ESLint (TS) + stylelint (SCSS)                                    |
| `npm run typecheck`       | `tsc --noEmit`                                                   |

### Nöbetçiler ne koruyor

- **Eksen taraması** — dışa verilen her bileşen, her anlamlı durumunda
  (`components/__tests__/a11y.test.tsx`). Deftere girmeyen yeni bir bileşen
  testi kırar.
- **Klavye sözleşmesi** — tuş matrisleri her bileşenin JSDoc'unda, nöbetçisi
  `components/__tests__/keyboard.test.tsx`.
- **Kontrast** — metin ≥ 4,5:1, ikon ve odak halkası ≥ 3:1. Eşiği tutmayan bir
  token derlemeyi kırar; düzeltme daima `palette.ts` düzeyinde yapılır.
- **Token sözleşmesi** — açık/koyu anahtar kümeleri ve üretilmiş SCSS kaynakla
  eşleşir. Ayrışma bugüne kadar sessizdi.
- **Paket boyutu** — tek bileşen import eden bir uygulamanın ne indirdiği
  ölçülür (`Badge` 2,7 kB, `Button` 3,4 kB, tüm paket 22,2 kB gzip).
- **Odak halkası ve hareket ölçeği** — stylelint, `focus-ring` mixin'i dışında
  `outline` ve bileşen SCSS'inde ham süre değeri (`0.7s`) yazılmasını
  engelliyor. Üç bileşen kendi halkasını, iki bileşen kendi süresini
  yazıyordu.

### Cihaz nöbetçileri — `npm run test:device`

```bash
npm run test:device:install   # WebKit + Chromium ikilileri (bir kez)
npm run test:device           # ios (iPhone 14 · WebKit) + android (Pixel 7 · Chromium)
```

Bu depodaki en pahalı hatalar masaüstünde **görünmüyordu**: alt sayfanın gövdesi
çöküyor, dip şerit klavyenin altında kalıyor, filtre seçenekleri maskenin
altında siliniyordu. Üçü de yerleşim/boyama hatası ve üçü de yalnızca gerçek bir
yerleşim motorunda ölçülebiliyor — jsdom bunları hiç hesaplamıyor.

**İki motor, çünkü bir motor yetmiyor.** iOS'taki her tarayıcı (Chrome dahil)
WebKit; Chromium'da doğru olan orada doğru olmak zorunda değil.

**Ekran görüntüsü değil sayı.** Bu koşu piksel karşılaştırmaz — yükseklik,
taşma, odak ve hesaplanmış CSS değeri ölçer. Yani platformdan bağımsız,
referans dosyası yok, `--update-snapshots` gerektirmiyor ve `test:visual`in
aksine **CI'da olduğu gibi koşabilir**.

**Emülasyonun dürüst sınırı.** Playwright'ın WebKit'i iOS Safari değil; çentik
payı (`env(safe-area-inset-*)` burada hep 0), ekran klavyesinin görünen alanı
daraltması, adres çubuğunun kaybolup gelmesi ve momentum kaydırma
yakalanmıyor. O sınırın altında kalanlar için savunma CSS'te taban değerlerde
(bkz. `bottom-sheet` mixin'i) ve onların nöbetçisi `e2e/bottom-sheet.spec.ts`.

**Görsel regresyon `verify` içinde değil**: ekran görüntüsü platforma bağlı
(yazı tipi tarama, alt piksel yumuşatma) ve macOS'te üretilmiş bir referans
ubuntu üzerinde koşan CI'da her dosyada kırmızı döner. Referanslar platform
başına saklanıyor (`e2e/__screenshots__/{platform}/`); CI'da açılacağı gün doğru
yol, Playwright'ın resmi konteynerinde koşup `linux` referanslarını orada
üretmek.

`master`a her push `npm publish` çalıştırır — **`package.json` sürümünü
yükseltmeyi unutmayın**, aynı sürüm ikinci kez yayımlanamaz ve iş akışı kırmızı
döner.

## Tasarım sözleşmesi

Öğe seçimi (hangi durumda hangi bileşen), yüzey/yükseklik merdiveni, renk
kararları, durum tintleri, tipografi rolleri, erişilebilirlik eşikleri, hareket
ölçeği ve `@deprecated` göç yolları **`CLAUDE.md`** içindedir. O dosya
`hanparca-frontend` ve `hanparca-admin` için de normatiftir.

## Lisans

MIT
