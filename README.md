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
- **Üç alt giriş, ana pakete sıfır bayt.** `@ahmetilhn/hanui/chat` (sohbet ve
  araç arayüzleri), `@ahmetilhn/hanui/charts` (bağımlılıksız SVG grafikleri),
  `@ahmetilhn/hanui/scss` (token değişkenleri ve mixin'ler). Kullanmayan uygulama
  onları indirmez.

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

### İlk boyamadan önce yazın — `HanuiThemeScript`

```tsx
// app/layout.tsx — sunucu düzeni, <head> içine.
import { HanuiThemeScript } from '@ahmetilhn/hanui';

<head>
  <HanuiThemeScript storageKey="theme" />
</head>;
```

Kayıtlı açık seçimi (`light` / `dark`) `<html data-hanui-theme>`e yazar; kayıt
yoksa sistem tercihi izlenir. Satır içi betik HTML ayrıştırılırken çalışır.

Bu iş sağlayıcıya bırakılamaz: sağlayıcı ağaç monte olduktan sonra çalışıyor ve
koyu tema seçmiş kullanıcı o ana kadar **bir kare beyaz ekran** görüyor.
⚠ Bir **bileşen**, fonksiyon değil: paket `'use client'` taşıdığı için dışa
verilen düz bir fonksiyon Next'in sunucu düzeninde çağrılamıyor.

### Token'ları ezmek

Yalnızca değiştirdiğiniz token'ı verin; gerisi varsayılanında kalır.

```tsx
import { HanuiProvider } from '@ahmetilhn/hanui';

const THEME = {
  light: { link: '#0a58ca', 'ring-color': '#0d6efd' },
  dark: { link: '#6ea8fe' },
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

## Sayfalamada başa dönme

Sayfa değiştiren tıklamadan sonra pencereyi başa almak bir **prop**tur; çağıran
tarafta kaydırma kodu yazılmaz:

```tsx
<Pagination page={page} totalPages={totalPages} scrollTo="top" … />
```

İki kipte de çalışır (`buildHref` ve `onPageChange`). Kaydırma anidir ve üç
durumda **yapılmaz**: etkin sayfaya basıldığında, yeni sekmede açan tıklamada
(Ctrl/Cmd/orta tuş) ve prop verilmediğinde.

⚠ Sayfa içindeki bir listenin sayfalamasında (sekme içi değerlendirme listesi
gibi) **verilmez** — kullanıcıyı okuduğu bölümden sayfanın tepesine atar.

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

| Grup | Bileşenler |
| --- | --- |
| Eylem | `Button` · `IconButton` · `TextLink` · `Tooltip` · `Menu` · `Popover` |
| Seçim | `Chip` · `ChipGroup` · `SegmentedControl` · `Select` · `Combobox` · `Checkbox` · `Switch` · `Radio` · `RadioCard` · `RangeSlider` · `RatingInput` · `QuantityStepper` · `TableCheckbox` |
| Girdi | `Input` · `PasswordInput` · `Textarea` · `TagInput` · `DateField` · `FileUpload` · `Field` |
| Yüzey | `Card` (+ `CardMedia`, `CardOverlay`, `CardBody`, `CardFooter`) · `SummaryCard` · `Panel` (+ `PanelForm`, `PanelRow`) · `PageHeader` · `SectionHeader` · `Tile` · `Directory` (+ `DirectoryGroup`, `DirectoryRow`, `DirectoryJump`) · `Carousel` · `ScrollArea` · `Disclosure` · `Accordion` · `Tabs` |
| Geri bild. | `Alert` · `Badge` · `StatusDot` · `CodeBadge` · `Kbd` · `EmptyState` · `Skeleton` (+ `SkeletonCard`, `SkeletonRows`, `SkeletonTable`) · `Spinner` · `Progress` · `Steps` · `Divider` · `Avatar` · `Rating` · `Price` · `Stat` · `CopyField` · `Breadcrumb` · `ToastHub` (+ `ToastPortal`) |
| Kipsel | `Modal` · `Drawer` · `BottomSheet` · `ConfirmDialog` · `PromptDialog` · `CommandPalette` |
| Veri | `Table` (+ `TableScroller`) · `DataTable` (+ `DataTableRow`) · `FilterBar` (+ `FilterBarField`) · `Pagination` · `Timeline` |
| Tema ve kancalar | `HanuiProvider` · `HanuiThemeScript` · `initHanui` · `useHanui` · `useHanuiTheme` · `useHanuiTokens` · `useAnnounce` · `useStickToBottom` · `usePositioning` · `useVirtualList` · `useListboxNavigation` · `hasOpenSurface` |
| Sohbet — `/chat` | `ChatThread` · `ChatMessage` · `PromptInput` · `PromptSuggestions` · `Prose` · `CodeBlock` · `ReasoningBlock` (+ `ReasoningText`) · `ToolCall` (+ `ToolCallSection`) · `TerminalOutput` · `SourceList` · `Citation` · `MessageActions` · `AppBar` · `ActionList` (+ `ActionListItem`) · `SegmentBar` · `Legend` · `DescriptionList` |
| Grafik — `/charts` | `LineChart` · `AreaChart` · `BarChart` · `ComposedChart` · `PieChart` · `ScatterPlot` · `Heatmap` · `BoxPlot` · `Histogram` · `RadarChart` |

Alt girişlerin stilleri ayrı dosyada ve `styles.css`ten **sonra** içe aktarılır:
`@ahmetilhn/hanui/chat.css`, `@ahmetilhn/hanui/charts.css`.

### Seçenek sayısı öğeyi belirler

| Seçenek sayısı | Öğe                                             |
| -------------- | ----------------------------------------------- |
| ≤7             | `ChipGroup` — hepsi ekranda, tek dokunuş        |
| 5–20           | `Select` — aramasız liste; mobilde alt sayfa    |
| 20+            | `Combobox` — yazarak ara                        |
| Aralık         | `RangeSlider` (+ kesin değer için sayı girdisi) |
| Tekil aç/kapa  | `Checkbox`                                      |

Hepsini onay kutusu listesi yapmak tek tip ama kötü bir arayüzdür: 1121 markayı
da 3 seçeneği de aynı biçimde göstermek, ikisini de yanlış gösterir.

---

## Sistemin taşıdığı kararlar

**Zemin mürekkep ve kâğıt, yeşil eylemdir.** Nötrler sıcak mürekkep ekseninde
(açık sayfa `#faf9f5`, koyu sayfa `#141413`); markanın yeşili yalnızca birincil
eylemde, bağlantıda, odak halkasında ve marka işaretinde. Seçim — etkin sayfa,
seçili çip, sekme çizgisi, ilerleme, onay kutusu, anahtar — mürekkeptir.
Yeşilin yayılmasını `green-footprint.test.ts` derleme hatasına çevirir.

**Doygun dolgu = tıklanabilir.** Durum etiketleri **her zaman** tint zeminli
(`Badge`, `Alert`), eylemler **her zaman** dolgulu veya çerçeveli. Bu ayrım
bozulduğunda kullanıcı durum etiketine tıklamayı deniyor. `Badge`in `solid`
varyantı durum tonlarında bilinçli olarak `soft` ile aynı şeyi verir.

**Bir ekranda tek `PRIMARY`.** `UIVariant` bir vurgu hiyerarşisi: iki dolu düğme
yan yana durduğunda hiçbiri öne çıkmaz. `UIVariant.CART` ekrandaki en parlak
yeşil — dönüşüm eylemi; birincil eylemden (koyu çam) aydınlıkla ayrışır.

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

**Geçişler 200 ms'yi geçmez** — tek istisna dipten açılan panel
(`duration-slow`, 320 ms) — ve `prefers-reduced-motion` her animasyonda
karşılanır.

**Odak halkası `:focus-visible` ile.** `:focus` fareyle tıklandığında da halka
gösterip görsel gürültü yaratıyor ve kullanıcılar bunu hata sanıyordu.

---

## Next.js App Router

Paket `'use client'` sınırını **kendi içinde** çizer: sunucu bileşenlerinden
doğrudan import edilebilir, `children` sunucuda çizilip aktarılır.

```tsx
// app/layout.tsx — sunucu bileşeni
import '@ahmetilhn/hanui/styles.css';
import '@ahmetilhn/hanui/chat.css'; // yalnızca /chat kullanılıyorsa
import '@ahmetilhn/hanui/charts.css'; // yalnızca /charts kullanılıyorsa
import { HanuiProvider, HanuiThemeScript } from '@ahmetilhn/hanui';
import NextLink from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <HanuiThemeScript storageKey="theme" />
      </head>
      <body>
        <HanuiProvider linkComponent={NextLink}>{children}</HanuiProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning`: tema betiği `<html>`e sunucunun yazmadığı bir
öznitelik ekliyor; uyarı yalnızca o öğe için susturulur.

---

## Geliştirme

```bash
nvm use            # .nvmrc → 24
npm install
npm run verify     # tokens → kontrast → typecheck → lint → kapsam → build → API → animasyon → boyut
npm run playground # bileşen galerisi → http://localhost:5273
```

| Komut                     |                                                                 |
| ------------------------- | --------------------------------------------------------------- |
| `npm run tokens`          | SCSS token dosyalarını `theme/tokens.ts`ten üretir              |
| `npm run build`           | `build/` — ana giriş + `chat` + `charts` (ESM + CJS + `.d.ts` + CSS) ve `build/scss/` |
| `npm run test`            | Jest + Testing Library + `jest-axe`                              |
| `npm run test:coverage`   | kapsam kapısı — tüm `src/`: satır 89 · ifade 86 · fonksiyon 80 · dal 75 |
| `npm run test:visual`     | görsel regresyon (Playwright); `verify` İÇİNDE DEĞİL, aşağı bkz. |
| `npm run test:device`     | iOS (WebKit) + Android (Chromium) davranış nöbetçileri, aşağı bkz. |
| `npm run check:contrast`  | WCAG kontrast ölçümü, iki temada 210 çift                        |
| `npm run check:palette`   | palet tarifinin çıktısı mı + nötr chroma tavanı + tint ve kategori ayrışması |
| `npm run check:api`       | genel API nöbetçisi — dört giriş, dört taban çizgisi (ana 176 · sohbet 30 · grafik 22 · SCSS 252 ad) |
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
  ölçülür. Ölçülen (2026-10-10, `size-limit`): `Badge` **4,33 kB** · `Button`
  **5,12 kB** · `styles.css` **23,07 kB** · tüm paket **42,05 kB** gzip. Alt
  girişler ana pakette SAYILMAZ: sohbet **6,32 kB**, grafikler **14,02 kB**
  (yalnızca `LineChart` **7,19 kB**).
  ⚠ **Bütçeler `.size-limit.js`te** (paket 43 kB, `styles.css` 24 kB) ve
  başlıkta kalan pay dar. Bu satır bir dönem
  `Badge 2,7 / Button 3,4 / paket 22,2` diyordu — ölçüm değil, bayat bir
  kopyaydı ve okuyana **%70 boş alan** olduğunu düşündürüyordu. Yeni bir
  bileşen eklerken bütçenin fiilen dolu olduğu bilinerek girilir; `size-limit`
  kırmızıya döndüğünde doğru tepki limiti yükseltmek değil, ne eklendiğini
  ölçmektir (`npm run size`).
- **Genel API** — her girişin dışa aktarım kümesi kendi taban çizgisiyle
  karşılaştırılır (`npm run check:api`): ana giriş `scripts/api-baseline.txt`
  (176), `chat` (30), `charts` (22), `scss` (252 `$değişken` + `@mixin`). Düşen
  bir ad **kırıcı**dır ve tüketiciler caret ile aldığı için bir sonraki
  `npm install`da derleme hatası olarak çıkar. Bilinçli değişiklikte
  `node scripts/check-api.mjs --update` + CLAUDE.md'ye gerekçe.
- **Alt giriş sınırı** — `chat` ve `charts` ana girişi yalnızca PAKET ADIYLA
  alır (`subentry-boundary.test.ts`); göreli bir yol `HanuiProvider` bağlamının
  ve kipsel yüzey yığınının ikinci bir kopyasını paketlerdi.
- **Yeşil ayak izi** — bileşen SCSS'inde yeşil token ailesine uzanan her
  bileşen gerekçeli bir izin listesinde (`green-footprint.test.ts`).
- **Opacity ile soluklaştırma yasak** — `0`/`1` dışındaki her `opacity`
  derlemeyi kırar (`passive-opacity.test.ts`); pasiflik token'larla çizilir.
- **iOS yakınlaştırması** — galerideki her metin girdisi dar ekranda ≥16px
  (`e2e/mobile.spec.ts`, hesaplanmış stil).
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

> ⚠ **Referansları yenilerken `--update-snapshots=all` yazın, çıplak
> `--update-snapshots` DEĞİL.** Ölçüldü (palet değişikliği turunda): çıplak
> bayrak yalnızca **eksik** referansı yazıyor; eşleşmeyeni ne yeniden üretiyor
> ne de kırıyor — koşu `40 passed` diyor, dosyalar eski renkte kalıyor ve
> ardından gelen doğrulama koşusu **eski referansı eski referansla**
> karşılaştırdığı için yeşil dönüyor. Yani sessizce yanlış bir "temiz" alınıyor.
> `=all` mod, pikseli değişen her dosyayı yazar (bayt bayt aynı olanlara
> dokunmaz, o yüzden dosya sayısı toplamdan az çıkabilir). Doğrulama:
> yenilemeden sonra bir referansın baskın renklerini örnekleyin.
> ⚠ `=changed` de yetmez: yalnızca eşiği (`maxDiffPixelRatio: 0.002`) aşan
> farkı yazar — iki küçük yazının kalktığı bir değişiklik eşiğin altında kalıp
> eski referans dosyada durur. Küçük bir değişiklikte bölümün referansını silip
> `=missing` ile yazdırın.

`master`a her push `npm publish` çalıştırır — **`package.json` sürümünü
yükseltmeyi unutmayın**, aynı sürüm ikinci kez yayımlanamaz ve iş akışı kırmızı
döner.

## Sohbet bileşenleri — `@ahmetilhn/hanui/chat`

Sohbet ve araç arayüzleri için ayrı bir giriş; ana paketi ve `styles.css`i
büyütmez.

```tsx
import '@ahmetilhn/hanui/styles.css';
import '@ahmetilhn/hanui/chat.css'; // styles.css'TEN SONRA

import { HanuiProvider } from '@ahmetilhn/hanui';
import { ChatMessage, ChatThread, PromptInput } from '@ahmetilhn/hanui/chat';

<ChatThread
  isStreaming={isStreaming}
  dock={
    <PromptInput
      value={draft}
      onChange={setDraft}
      onSubmit={send}
      onStop={stop}
      isBusy={isStreaming}
      placeholder="Mesajınızı yazın…"
    />
  }
>
  {messages.map(message => (
    <ChatMessage key={message.id} author={message.author}>
      {message.content}
    </ChatMessage>
  ))}
</ChatThread>;
```

Metinler aynı sağlayıcıdan, `labels.chat` altında:

```tsx
<HanuiProvider
  labels={{
    chat: {
      thread: 'Sohbet',
      send: 'Gönder',
      stop: 'Durdur',
      scrollToLatest: 'En yeniye in',
      replyReady: 'Yanıt hazır',
      messageActions: 'Mesaj eylemleri',
      sources: 'Kaynaklar',
      citation: index => `Kaynak ${index}`,
      stderr: 'hata çıktısı',
      toolStatus: { running: 'çalışıyor', ok: 'tamamlandı', error: 'hata', aborted: 'durduruldu', interrupted: 'kesildi' },
      codeCopy: language => `${language} kodunu kopyala`,
      codeCopied: 'Kod kopyalandı',
    },
  }}
>
```

Ayrıştırma ve vurgulama tüketicide kalır: `Prose` markdown ayrıştırmaz,
`CodeBlock` önceden vurgulanmış HTML alır (`html` prop'u — güvenliği sizin).
Bileşen listesi ve kararlar: `CLAUDE.md` → "`@ahmetilhn/hanui/chat`".

## SCSS API — `@ahmetilhn/hanui/scss`

Token değişkenleri ve mixin'ler kopyalanmadan alınır. Değişkenler
`var(--hanui-…)` dizeleridir; tema çalışma zamanında döner. Modül kural basmaz,
`styles.css` yine gerekir.

```scss
@use '@ahmetilhn/hanui/scss' as hanui;

.panel {
  padding: hanui.$space-4;
  border: 1px solid hanui.$border;

  @include hanui.focus-ring;

  @media (max-width: hanui.$breakpoint-tablet-portrait) {
    padding: hanui.$space-3;
  }
}
```

Next.js (Turbopack ve webpack) paket `exports`'unu çözer. Başka bir derleyici
çözemezse yol `node_modules/@ahmetilhn/hanui/build/scss` ile `loadPaths`e verilip
`@use 'index' as hanui` yazılabilir.

## Grafikler — `@ahmetilhn/hanui/charts`

On SVG grafiği, sıfır bağımlılık (çizim, ölçek ve istatistik kütüphanenin
kendisinde). Ana paketi ve `styles.css`i büyütmez.

```tsx
import '@ahmetilhn/hanui/styles.css';
import '@ahmetilhn/hanui/charts.css'; // styles.css'TEN SONRA

import { BarChart, LineChart, PieChart } from '@ahmetilhn/hanui/charts';

<LineChart
  label="Aylık gelir ve gider"
  description="Gelir ekimde zirve yaptı"
  xKey="month"
  data={[
    { month: 'Oca', revenue: 120, cost: 90 },
    { month: 'Şub', revenue: 180, cost: null }, // null = veri yok: çizgi KESİLİR
  ]}
  series={[
    { key: 'revenue', label: 'Gelir' },
    { key: 'cost', label: 'Gider', format: value => `${value} ₺` },
  ]}
/>;
```

| Grafik | Ne zaman |
|---|---|
| `LineChart` · `AreaChart` | Zaman içinde eğilim; `AreaChart isStacked` toplamın parçaları |
| `BarChart` | Kategorileri karşılaştırma; `orientation="horizontal"` uzun adlar için |
| `ComposedChart` | Çubuk + çizgi; farklı birim `axis: 'right'` |
| `PieChart` | Bir bütünün ≤6 parçası (`variant="donut"` varsayılan) |
| `ScatterPlot` | İki değişkenin ilişkisi; `size` ile balon |
| `Heatmap` | İki kategorik eksende yoğunluk (gün × saat) |
| `BoxPlot` · `Histogram` | Dağılım: grupları karşılaştırma · tek değişkenin şekli |
| `RadarChart` | Birkaç seriyi aynı eksen takımında; eksenler AYNI ölçekte |

Her grafik tek bir sekme durağıdır: oklar öğeleri gezer (gelinen öğe
duyurulur), `Home`/`End` uçlara gider, `Escape` vurguyu kaldırır. Ekran okuyucu
grafiği gizli bir **veri tablosu** olarak da okur. Genişlik kapsayıcıdan ölçülür
(`width` ile sabitlenebilir), yükseklik `height`. Sayılar `labels.locale`
yereliyle biçimlenir; `formatValue` / `format` ile ezilir. Renkler kategorik
paletten (`tone`: `cat-1`…`cat-5`, `series-1`, `series-2`, `muted`).

## 5.0'a geçiş

5.0 bir **renk** sürümü: nötr eksen yeşilden sıcak mürekkebe geçti, yeşil
yalnızca eylem, bağlantı ve odakta kaldı. Bileşen API'si değişmedi; kırılan şey
token adları ve görünüm.

| 4.x token | 5.0 |
|---|---|
| `role`, `role-hover`, `role-active` | `selected`, `selected-hover`, `selected-active` (mürekkep) |
| `on-role` | `on-selected` |
| `role-tint` / `role-line` | `selected-tint` / `selected-line` |
| `role-text` | `link` (+ `link-hover`) |
| `shell*` | aynı ad, değer çamdan mürekkebe; yeni `on-shell`, `on-shell-2`, `on-shell-danger`, `shell-line` |
| — | `cat-1…5`, `series-1/2` (kategorik palet) |

Eski adlara takma ad **yok**. Kendi CSS'inizde `--hanui-role*` okuyan ya da
`theme={{ light: { role: … } }}` ezmesi yazan yerler yeni adlara geçer.
Görünüm değişiklikleri: açık sayfa krem (`#faf9f5`), koyu sayfa sıcak siyah
(`#141413`), kart ve panel durgunken gölgesiz, `info` tonu nötr, `CodeBadge`
mürekkep. Ayrıntı ve ölçümler: `CLAUDE.md` → "Renk kararları (5.0)".

## 5.1 – 5.3'te eklenenler

Hepsi ekleme; 5.0'ın token sözleşmesi dışında kırıcı değişiklik yok.

| Sürüm | Ne |
|---|---|
| 5.1 | `Disclosure`, `StatusDot`, `Kbd`; `useHanuiTokens`, `useStickToBottom`, `hasOpenSurface`; `Modal size="xl"`, `Button size={UISize.XSMALL}` + `shape="pill"`, `IconButton shape="round"`, `Textarea variant="bare"`, `Progress size="xs"`, etkileşimli `CodeBadge`, `Avatar` (`icon`, `shape="rounded"`, `tone="brand"`), `Stat variant="inline"`, `ScrollArea isFollowingEnd`; `CommandPalette` `hotkey` + komut kapanıştan SONRA çalışır |
| 5.2 | `HanuiThemeScript`; `@ahmetilhn/hanui/chat` — 20 sohbet bileşeni |
| 5.3 | `@ahmetilhn/hanui/charts` — 10 SVG grafiği; `@ahmetilhn/hanui/scss`; `Input --technical` dar ekranda ≥16px; `QuantityStepper` ve `DataTable` pasif/dinlenme hâli opacity yerine token |

Ayrıntı ve ölçülmüş gerekçeler: `CLAUDE.md` → "Göç ve `@deprecated` yollar",
"`@ahmetilhn/hanui/chat`", "`@ahmetilhn/hanui/charts`".

## Tasarım sözleşmesi

Öğe seçimi (hangi durumda hangi bileşen), yüzey/yükseklik merdiveni, renk
kararları, durum tintleri, tipografi rolleri, erişilebilirlik eşikleri, hareket
ölçeği ve `@deprecated` göç yolları **`CLAUDE.md`** içindedir. O dosya
`hanparca-frontend` ve `hanparca-admin` için de normatiftir.

## Lisans

MIT
