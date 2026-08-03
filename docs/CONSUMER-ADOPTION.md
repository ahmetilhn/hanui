# Tüketici geçiş planı — `hanparca-frontend` · `hanparca-admin`

Bu belge, iki uygulamada **elle yazılmış olup kütüphanede karşılığı bulunan**
her şeyin envanteri ve geçiş sırası. Ölçümler 64 bileşenlik hanui sürümüne
göre; sayılar gerçek dosyalardan sayıldı.

> **1. ve 2. AŞAMA TAMAMLANDI** (hanui `2.0.1` ile). İki uygulamanın kapısı
> yeşil: frontend 336 test, admin 131 test. Silinen kod: frontend −1 172 satır,
> admin −774 satır.
>
> **Bir sonraki yayın gerekiyor:** geçiş sırasında `Tabs`ın jsdom'da
> `TypeError` attığı ortaya çıktı (bkz. CHANGELOG → `scrollIntoView`).
> Düzeltme kütüphanede duruyor ama `2.0.1`de yok; yayımlandığında iki
> uygulamanın `package.json`u o sürüme çıkarılmalı.
>
> Sürüm `major` seçildi. Faz 0-4'ün API'si eklemeliydi ama iki şey majoru
> haklı çıkarıyor: palet düzeltmeleri **görsel** fark üretiyor (soluk metinler
> bir kademe koyu, yeşil ikonlar bir kademe koyu, perde bir tık koyu — hepsi
> WCAG ihlallerinin kapatılması) ve `@layer hanui` özgüllük davranışını
> değiştiriyor. İkisi de kod kırmıyor, ama görsel onay istiyor.

---

## 0. Neden bu geçiş: ölçülen tekrar

| | frontend | admin |
| --- | ---: | ---: |
| `react-hot-toast` kullanan dosya | 25 | 19 |
| Elle yazılmış `Toast` bileşeni | 145 satır | 132 satır |
| Kopya tasarım sistemi (`_mixins` + `_variables`) | 1249 satır | 1161 satır |
| Kütüphane iç kodunun kopyası | `useSheetViewport` (123) · `focus.helper` (61) | — |
| `useTheme` + `ThemeToggle` kopyası | 223 satır | 214 satır |

**Kopyalar ayrışıyor ve ayrışma sessiz.** Somut kanıt: `hanparca-frontend`in
`useSheetViewport` kopyası, mobil gerçek cihazda alt sayfayı çökerten **üç
kusurun** aynısını taşıyor (taban yok · absürt ölçüm koşulsuz yazılıyor · kare
bayrağı takılı kalabiliyor). Kütüphane tarafı düzeltildi; kopya düzelmedi.

---

## 1. Aşama — bağımlılık ve altyapı (önce bu)

| İş | Nerede | Durum |
| --- | --- | --- |
| `@ahmetilhn/hanui` → `^2.0.1` | iki repo | ✅ |
| `react-hot-toast` **kaldırıldı** | iki repo | ✅ bağımlılık ikisinden de düştü |
| `hooks/useSheetViewport.ts` **silindi** | frontend | ✅ testiyle birlikte |
| `helpers/focus.helper.ts` **silindi** | frontend | ✅ testiyle birlikte |
| `hooks/useTheme.ts` → `useHanuiTheme` | iki repo | ✅ 101 → 57 satır, kalan tek iş kalıcılık |
| `--hanparca-sheet-*` → `--hanui-sheet-*` | frontend | ✅ `_mixins.scss` |

**Ölçülen kazanç:** frontend −1 172 satır, admin −774 satır.

### Tema sözleşmesindeki gerçek fark

Eski `<head>` betiği ÇÖZÜLMÜŞ değeri her durumda yazıyordu: "Sistem" seçili ve
sistem koyuysa `data-hanui-theme="dark"`. `useHanuiTheme` tercihi DOM'dan okur
ve öznitelik gördüğü her yerde **açık bir seçim** varsayar — anahtar "Sistem"
seçiliyken "Koyu"yu işaretli gösterirdi. Kütüphane sözleşmesinde açık seçim
öznitelik yazar, "sistemi izle" öznitelik BIRAKMAZ; koyu sistem temasının
boyamadan önce doğru çizilmesini `:not([data-hanui-theme])` medya yedeği
sağlıyor. `Logo`nun tema seçicileri de aynı özniteliğe taşındı.

`.theme-switching` kopyası iki uygulamadan da silindi: kütüphanenin
`hanui-theme-switching` kuralı `@layer hanui` içinde ama `!important` taşıyor
ve **önemli kuralda katman sırası tersine döner** — katmanlı kural katmansızı
yener, uygulamanın geçişlerini de kapatır.

---

## 2. Aşama — bildirim (tek commit, iki repo)

`react-hot-toast` → hanui `toast` + `ToastHub`.

```diff
- import toast from 'react-hot-toast';
+ import { toast } from '@ahmetilhn/hanui';

- toast.success('Adres kaydedildi');
+ toast.success('Adres kaydedildi');   // çağrı yeri AYNI
```

- `components/Toast/` ve `constants/toast.constants.ts` (iki repo) **silindi**;
  yerine kök yerleşimlerde tek `<ToastHub />` (frontend 1, admin 2 — panel ve
  giriş ayrı yerleşimler).
- Çağrı yerleri birebir geçti: 23 dosya (frontend) + 17 dosya (admin), yalnızca
  import satırı değişti. Tek istisna `useCompare`ın çıplak `toast(…)` çağrısı —
  `react-hot-toast`ta nötr bildirimdi, karşılığı `toast.show`.
- Admin'in yedi testindeki `jest.mock('react-hot-toast')` `@ahmetilhn/hanui`ye
  taşındı; `requireActual` ile modülün geri kalanı gerçek kalıyor, yalnızca
  `toast` sahteleniyor.
- **Neden:** goober özgüllük hatası — aynı bildirim geliştirmede ve üretimde
  iki farklı renkte çıkıyordu. Sarmalayıcı bunu çözmez, erteler.

---

## 3. Aşama — birebir karşılığı olan bileşenler

### `hanparca-frontend`

| Uygulamadaki | Yerine | Durum |
| --- | --- | --- |
| `FilterToolbar` panel (elle `<dialog>`) | **`BottomSheet`** | ✅ `Drawer` DEĞİL — aşağıya bakın |
| `CheckoutSteps` (80 + 119 SCSS) | `Steps` | ✅ 51 satırlık alan sarmalayıcısına indi |
| `Pagination` (66) | `Pagination` | `<Link>` sözleşmesi + kısaltma deseni zaten var |
| `ProductCarousel` | `Carousel` | ⛔ DEĞİŞTİRİLMEDİ — aşağıya bakın |
| `AccountSidebar` (elle `<dialog>`) | `Drawer side="start"` | |
| `ProductGallery` (elle `<dialog>`) | `Modal size="lg"` | |
| `ErrorRecovery` | `EmptyState tone="error"` | "Boş" ile "yüklenemedi" ayrımı kodlu |
| 28 dosyadaki elle iskeletler | `SkeletonCard` · `SkeletonRows` | Ölçü gerçek bileşenden → CLS yok |
| `AppliedFilters` | `ChipGroup isMultiple` | zaten `Chip` kullanıyor |
| `SavedAddressPicker` | `RadioCard` | ✅ kopya kart kabuğu silindi |
| `SpecTable` · `OemList` · `FitmentTable` | `Table` / `DataTable` | Sıralama + `aria-sort` + yapışkan sütun |
| `VehicleSelector` | `Select` / `Combobox` | Alt sayfa davranışı hazır |
| `AskAiBox` | `CommandPalette` | Aksan duyarsız arama, APG klavye |

### `hanparca-admin`

| Uygulamadaki | Yerine | Kazanç |
| --- | --- | --- |
| `Sidebar` çekmecesi | `Drawer side="start"` | ✅ dört elle etkiden üçü gitti |
| `CrawlerJobDialog` | `Modal` + `Steps` | |
| `ReferenceSelect` (108) | `Combobox` | Sanallaştırma ve çoklu seçim geldiğinde bedava |
| `DashboardContainer` sayaçları | `Stat` ızgarası | ✅ `<Link>` sarmalayıcı korundu |
| `ResourceListContainer` tabloları | `DataTable` (sıralama + toplu şerit) | `aria-sort`, yapışkan ilk sütun |
| `OrderDetailContainer` durum geçmişi | `Timeline` | `failed` durumu birinci sınıf |
| `ModerationContainer` toplu onay | `Checkbox` + yapışkan şerit | ✅ kısmi başarı sayıyla |
| Ayar anahtarları (8 dosya) | `Switch` | `role="switch"` — "açık/kapalı" diye okunur |
| Üst bar kullanıcı eylemleri | `Menu` | APG menü, harfe atlama |
| Global arama | `CommandPalette` | |
| Yoğunluk | `<html data-hanui-density="compact">` | Operasyon paneli 80 satır gösteriyor |

---

## 4. Aşama — ekranların yeniden kurgusu

Kullanıcı onayıyla yerleşim de değişiyor. Öncelik sırası:

1. **Admin gösterge paneli** — `Stat` ızgarası + `ProgressCircle` + `Timeline`.
2. **Admin liste ekranları** — `DataTable` sıralama, satır seçimi, toplu eylem
   şeridi; filtreler `Drawer`da `Accordion` gruplarıyla.
3. **Vitrin katalog filtreleri** — `Drawer` + `Accordion` + `ChipGroup`;
   `SegmentedControl` ile liste/ızgara görünümü.
4. **Vitrin ödeme akışı** — `Steps` + `RadioCard` + `Progress`.
5. **Vitrin ürün sayfası** — `Carousel`, `Tabs`, `Timeline` (kargo), `Stat`
   (uyumluluk özeti).

---

## 5. Doğrulama kapısı

Her aşama sonunda ilgili uygulamanın kendi kapısı koşar:

```bash
npm run verify   # her iki uygulamada da tanımlı
```

Ek olarak `hanparca-frontend`te **kütüphane kopyalarının silindiği**
doğrulanmalı: `useSheetViewport`, `focus.helper` ve `--hanparca-sheet-*`
değişkenlerine hiçbir referans kalmamalı.

---

## 6. Bilinen risk

- **`@layer hanui`** — kütüphane CSS'i artık bir katmanda. Uygulamaların
  kütüphaneyi ezmek için yazdığı `!important` ve şişirilmiş özgüllük artık
  **gereksiz**; eskiden çalışan ezmeler çalışmaya devam eder (katmansız kural
  her zaman kazanır). Geçiş sırasında bu ezmeler temizlenmeli, yoksa iki
  uygulamada da ölü CSS birikir.
- **Palet düzeltmeleri görsel fark üretir.** Soluk metinler bir kademe koyu,
  koyu temada bir kademe açık, yeşil ikonlar bir kademe koyu, kip pencere
  perdesi bir tık koyu. Tümü WCAG ihlallerinin kapatılması; görsel onay
  gerektirir ama geri alınmamalı.
- **`Tooltip` balonu artık `document.body` altında.** Ona dışarıdan tutunan
  bir seçici varsa güncellenmeli.


---

## 7. Değişimin düzelttiği şeyler — ölçülenler

### `FilterToolbar` → `BottomSheet` (`Drawer` değil)

Bu belge önce `Drawer` diyordu; **yanlıştı**. Kütüphanenin kendi ayrımı ekrana
göre: `Drawer` geniş ekranın (yandaki panel listeyi görünür bırakır),
`BottomSheet` darın. Katalog filtre paneli yalnızca ≤1024 px'te açılıyor —
masaüstünde filtre zaten kenar çubuğunda. Belgeye bakıp `Drawer` seçmek,
telefonda ekranın tamamını kaplayan ve "panel" olmaktan çıkan bir şey üretirdi.

Elle yazılmış olan ve bileşende zaten bulunan: `showModal()` senkronu,
masaüstüne geçildiğinde kapanma (artık `closeAbove`), görünen alana yaslanma,
başlık/dip şerit iskeleti, odak yönetimi. Panelin SCSS'i 203 → 148 satır.

### `Sidebar` çekmecesi → `Drawer side="start"`

Aynı öğe masaüstünde **kalıcı ray**, dar ekranda çekmeceydi ve `translateX`
ile kaydırılıyordu. İkisi ayrıldı: ray `<aside>` olarak kalıyor (kipsel açmak
içeriği inert bırakırdı), çekmece `Drawer`. Menü gövdesi **paylaşılıyor** — iki
liste tutmak, bir bağı birinde ekleyip diğerinde unutmaya açık bir kopyaydı.

Dört elle yazılmış etkiden üçü gitti (gövde kaydırma kilidi, `Escape`, odak
tuzağı + odağın açan öğeye dönmesi). Kalan tek etki kırılma noktası nöbetçisi:
`Drawer`da `closeAbove` karşılığı yok ve kipsel bir panel açık kalırsa
masaüstünde ekranda hiçbir şey yokken sayfa tıklanamaz hâle geliyor.

**İki test tersine çevrildi ve gerekçesi yazıldı.** `PanelLayout` testleri artık
kütüphaneye ait mekanizmayı ölçüyordu: `document` üzerinde `keydown` (dinleyici
artık yok — `<dialog>` `Escape`te `cancel` gönderiyor) ve `[aria-hidden]` perde
düğümü (perde artık `::backdrop`, DOM'da düğüm değil). Tarayıcı sürümü daha
doğru: üst üste açık panellerde `Escape` yalnızca en üsttekini kapatır, elle
yazılan dinleyici hepsini birden kapatıyordu.

### `DashboardContainer` sayaçları → `Stat`

Kartın gövdesi (`icon` / `value` / `label` / `description`) `Stat`e birebir
oturdu; SCSS 75 → 45 satır. **`<Link>` sarmalayıcı korundu**: operatör sayıyı
görüp o ekrana gitmek istiyor ve `Stat` bir ölçü gösterir, nereye gidildiğini
bilmez — ona `href` eklemek her çağırana gezinme sözleşmesi taşıtırdı.

"Bekleyen iş" rengi değerin **içinden** geçiriliyor, dışarıdan bir seçiciyle
değil: `Stat`in iç sınıfları derlemede hash'leniyor ve onlara tutunan bir kural
kütüphanenin bir sonraki yayınında sessizce koparadı.

### `SavedAddressPicker` → `RadioCard`

Kart kabuğu elle yazılıydı — kenarlık, hover'da bir kademe koyu kenar, seçilide
mavi kenar + halka (`:has(input:checked)`) — ve üçü de `RadioCard`ın kendisi.
Kütüphane aynı kararı aynı gerekçeyle veriyor: doygun dolgu "tıklanabilir"
demek, seçili bir seçenek ise eylem değil DURUM.

**Değişim sırasında iki şey neredeyse kayboldu ve ikisi de geri kondu.**
`role="radiogroup"` + `aria-label`: yerel radyolar aynı `name` ile örtülü bir
grup oluşturuyor ama o grubun bir ADI olmuyor — ekran okuyucu "3 seçenekten 1."
der, neyin seçildiğini söylemezdi. Ve sütun sarmalayıcı: `RadioCard`ın gövdesi
bir SATIR (`justify-content: space-between`), sarmalanmasaydı adresin üç satırı
yan yana diziliyordu.

### `FilterToolbar` görünüm anahtarı → `SegmentedControl`

Anahtar iki tekil `Chip`i elle bir `role="radiogroup"` kutusuna koyuyordu ve o
zamanki not şunu diyordu: "`ChipGroup` DEĞİL çünkü grup, seçili çipe tekrar
basıldığında seçimi `null`a düşürüyor; görünüm anahtarında 'hiçbiri' diye bir
durum yok". Bu, tam olarak `SegmentedControl`ün sözleşmesi.

### `FacetSection` → `Accordion` (ve düzeltilen bir YANLIŞ İDDİA)

Bölüm elle kurulmuş bir disclosure'dı: `aria-expanded` taşıyan bir `<button>`,
bir `aria-controls` bağı, `hidden` ile gizlenen gövde. JSDoc'u şunu iddia
ediyordu: *"içerik `hidden` ile gizlenir, DOM'dan çıkarılmaz: tarayıcı içi arama
(Ctrl+F) gizli seçenekleri de bulabilir."* **Yanlıştı.** `hidden`
`display: none` demek ve sayfa içi bulma `display: none` içindeki metni bulmaz;
DOM'da olmak yetmiyor. Kapalı bir `<details>`te ise tarayıcı aranan metni bulup
bölümü kendisi açıyor. 1121 markalı bir listede aranan markanın bulunabilmesi,
bu grubun var oluş nedeni — yani `Accordion` sadece kod kısaltmadı, iddia edilen
davranışı ilk kez gerçekten sağladı.

Grup başına BİR akordeon: gruplar bağımsız açılır ve bu mevcut davranış. Testi
`aria-expanded` yerine `<details open>` üzerinden ölçüyor.

### `ModerationContainer` toplu onay

Kuyrukta elli kayıt birikebiliyor ve her biri ayrı bir tıklamaydı. **Sunucuda
toplu uç YOK** — istekler tek tek gidiyor. Bu yüzden iki karar yazıldı:

- **`Promise.allSettled`, `Promise.all` değil.** `all` ilk hatada duruyor:
  önündeki başarılı onaylar zaten yapılmış oluyor ama kullanıcı yalnızca hatayı
  görüyor ve *hepsinin* başarısız olduğunu sanıyordu. Sonuç olduğu gibi
  yazılıyor — "1 onaylandı, 1 tanesi başarısız".
- **RED toplu yapılamaz.** Red bir gerekçe istiyor ve gerekçe kayda özgü; toplu
  redde tek bir gerekçe elli kayda yazılırdı ve müşteriye giden metin onun
  yazdığı yorumla ilgisiz olurdu.

### `ProductCarousel` DEĞİŞTİRİLMEDİ — ve nedeni

`Carousel` `scroll-snap`, klavye ve nokta göstergesini veriyor; ama okları
KENDİ içinde çiziyor. Vitrinde oklar şeridin değil **bölüm başlığının**
parçası: "Tümünü gör" düğmesiyle aynı satırda, `SectionHeader action` içinde
duruyorlar. Değişim ya o yerleşimi bozacaktı ya da `Carousel`e "okları dışarıda
çiz" gibi bir kaçış kapısı eklemeyi gerektiriyordu — ikincisi bileşeni, tek bir
çağıran için genelleştirmek olurdu.

Mevcut uygulama zaten ölçülmüş ve gerekçeleri yazılı (bir sayfa görünür genişliğin
%85'i, `ResizeObserver` ile yeniden ölçüm, 1 px alt piksel toleransı). Kazanç
nokta göstergesiyle sınırlı, bedel görünür bir yerleşim gerilemesi.
