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
| Kargo takip zaman çizelgesi (vitrin) | `Timeline` | ✅ işaret geometrisi silindi |
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

### `ShipmentTracking` → `Timeline` + `Badge`

Zaman çizelgesi elle kuruluydu ve geometrisi hassastı: 2 px'lik çizginin
merkezine oturan 12 px'lik bir işaret, `calc(-#{$space-4} - 7px)` ile
hizalanıyordu ve bir piksel kaydığında zincir kırık görünüyordu. Güncel olayın
vurgusu üç sinyalle veriliyordu (tam kontrast metin, kalın durum, halkalı
işaret) — `Timeline` aynı üçlüyü `status="current"` ile veriyor ve
`failed` durumu da birinci sınıf.

Gönderi durumu rozeti de elle tint'lenmişti. Ton kararı çağrı yerinde kaldı:
**teslim edilemedi ve iade UYARI tonunda, hata tonunda değil** — ikisi de bir
sorun ama müşterinin bir şeyi yanlış yaptığı anlamına gelmiyor ve kırmızı bir
rozet siparişin iptal edildiği gibi okunuyordu.

SCSS 155 → 81 satır; kalan tek kural konum satırının iç yerleşimi (kargo
olayına özgü bir alan, kütüphane onu bilmiyor).

### Elle tint'lenmiş durum etiketleri → `Badge`

Üç yerde aynı desen vardı: `@include tint(...)` + yarıçap + punto + dolgu elle.
Üçü de `Badge tone=… variant="soft"`a indi ve **ton kararı çağrı yerinde
kaldı**, çünkü hangi tonun doğru olduğu alana özgü:

| Nerede | Ton | Neden bu ton |
| --- | --- | --- |
| `FitmentPreview` uyduğu araç | `success` | "Aracınıza uygun" rozetiyle aynı aile; nötr griyken sayfanın en çok bakılan teknik bilgisi arka plana karışıyordu |
| `OemList` "birebir" | `success` | Birebir mi muadil mi ayrımı — yanlış parça siparişinin en sık nedeni bu ayrımın kaybolması |
| Admin `TopBar` ortam etiketi | `warning` | Üretim olmayan ortamda çalışıldığının uyarısı |

Hepsinde `variant="soft"`: doygun dolgu "tıklanabilir" demek (ev kuralı) ve
bunlar etiket, eylem değil.

### `Stat` ürün sayfasına EKLENMEDİ

Belge "uyumluluk özeti → `Stat`" diyordu. Uyumluluk bir ÖLÇÜ değil bir DURUM:
uyar / uymaz / bilinmiyor. `Stat` bir sayı gösterir ve `trend`/`delta` ile
değişimini anlatır; üç durumlu bir bilgiyi oraya sokmak, doğru cevabı olan bir
alanı "kaç" sorusuna çevirirdi. Uyumluluk kutusu `CompatibilityBox` olarak
kalıyor ve "bilinmiyor" ≠ "uymuyor" ayrımı orada kodlu.

---

## 8. Kapanış turu — kalan bileşenler ve dört düzeltme

Bu turda 3. ve 4. aşamaların kalanı uygulandı. Sonuç: **70/71 bileşen** iki
uygulamanın birleşiminde kullanılıyor (frontend 61, admin 43). Tek istisna
`TagInput` ve nedeni aşağıda.

### `TagInput` TAŞINMADI — üç bağımsız gerekçe

Her biri tek başına yeterli:

1. **Admin şemasında dizi türü yok.** `ColumnType` birleşimi
   `TEXT|LONG_TEXT|RICH_TEXT|INTEGER|MONEY_MINOR|BOOLEAN|DATE|DATETIME|ENUM|REFERENCE|JSON|EMAIL|PHONE|URL|IMAGE|SLUG`.
   Tek aday `JSON` ve `resource.helper` onu **parse edilmiş** gönderiyor —
   bir `JSON` kolonu meşru olarak `{"anahtar":"değer"}` tutuyor. `string[]`e
   zorlamak nesne şekilli her JSON kolonunu bozardı ve ikisini ayıran bir
   şema bayrağı yok.
2. **Tarayıcı serbest metin bayraklarını bilinçli kaldırmış**
   (`crawler.type.ts`): *"Serbest metin türü YOKTUR … panelden gelen bir
   değerin dosya yolu olması artık yapısal olarak imkânsız."* Virgülle
   ayrılmış bir etiket alanı, kapatılmış bir deliği yeniden açardı.
3. **Storefront'ta serbest etiket yüzeyi yok**; her çoklu seçim sunucudan
   sayılıyor (`FacetGroup.values`), yani bilinen bir kümeden seçim — bu
   `ChipGroup`/`Checkbox` işi.

Sahte adopsiyon "birden çok OEM kodunu birlikte ara" olurdu; dizi kabul eden
bir uç yok ve bir bileşeni kullanmak için backend alanı uydurulmaz.

### `data-hanui-density="compact"` — panelde, `<html>` üzerinde

Panel bir operasyon aracı: ekrana sığan satır sayısı doğrudan iş hızına
dönüyor. Öznitelik `src/app/layout.tsx`'te `<html>` üzerinde duruyor,
`(panel)/layout.tsx`'te **değil**: `Modal`, `Drawer`, `Tooltip` ve
`CommandPalette` gövdeye portal ediliyor ve daha aşağı bir düğüme yazılan
yoğunluk o yüzeyleri varsayılan boşlukta bırakır — aynı ekranda iki farklı
yoğunluk görünürdü. `initHanui({ density })` de kullanılmadı: mount sonrası
çalışıp her yüklemede yeniden akış üretiyor.

**Sıra önemliydi.** Yoğunluk, `calc(-#{$space-4} - 7px)` gibi piksel-kırılgan
hizalamaları bozar. İki elle çizilmiş zaman çizelgesi `Timeline`a taşındıktan
**sonra** açıldı; o geometri zaten silinmişti. Storefront varsayılan
yoğunlukta kalıyor — iki yoğunluk sözleşmesinin amacı tam olarak bu ayrım.

### Paylaşılan SCSS kilidi hakkındaki iddia YANLIŞTI

Belge ve `hanparca-admin/scripts/check-styles.mjs` çevresinde "iki repo
byte-özdeş tutulur" varsayımı dolaşıyordu. Ölçüldü:

| dosya | frontend | admin |
| --- | --- | --- |
| `_variables.scss` | `7ffcbb47…` | `7ffcbb47…` (aynı) |
| `_mixins.scss` | `0179fc54…` | `971faed0…` (**farklı**) |

Denetçi admin'in *kendi* dosyalarını hash'leyip admin'in *kendi* lock
dosyasıyla karşılaştırıyor — yani repolar arası eşitlik denetimi değil, admin
kopyası üzerinde bir **kurcalama dedektörü**. Frontend'de böyle bir denetim
hiç yok. Yani `_mixins.scss` zaten ayrışmış ve nöbetçi bunu hiç görmedi.
Gerçekten ortak olan tek dosya `_variables.scss`.

### `normalizeSearchTerm` — kütüphaneye geçiş bir SÖZLEŞMEYİ ONARDI

Frontend'in yerel kopyası kaldırılıp `@ahmetilhn/hanui`ye bağlandı. Bu bir
sadeleştirme değil, bir **düzeltme**: sunucudaki `TextHelper.toAscii` Türkçe
harfleri eşledikten sonra NFD ayrıştırması + birleştirici işaret temizliği
yapıyor (`é` → `e`). Yerel kopyada NFD adımı **yoktu** ve `é` olduğu gibi
kalıyordu — `Citroën`, `Škoda` gibi adlarda istemci eşleşmiyor, sunucu
eşleşiyordu. Kütüphane sürümü sunucunun adım sırasını birebir uyguluyor.

### Bileşenin YANLIŞ olduğu üç yer — kayda geçsin

Bu turda planlanmış ama **uygulanmamış** üç takas; gerekçeleri ileride aynı
öneri tekrar gelmesin diye burada:

| Öneri | Neden yapılmadı |
| --- | --- |
| Admin `TopBar` ayırıcısı → `Divider` | `Divider` bilinçli olarak YATAY: `<hr>` + `border-top` + `width: 100%`, `orientation` prop'u yok. Dikey ayırıcı yerine kullanmak satırın ortasına tam genişlikte bir çizgi çizerdi. `Divider` storefront `Header` çekmecesinde yatay bölme olarak kullanıldı — doğru yeri orası. |
| Admin `DashboardContainer` kartları → `Tile` | Kartın birincil içeriği SAYI; `Tile` etiketi birincil yapar ve sayıyı `meta` yuvasına iter, yani hiyerarşiyi ters çevirir. Mevcut `<Link><Stat/></Link>` sarmalayıcısı zaten gerekçesiyle yazılmış. |
| Admin `Sidebar` 77 tablosu → `Directory` | `Directory` bir İÇERİK indeksi (marka A–Z); satırları ≥44px ve geniş. Yoğun bir gezinme rayında 77 satırı o yükseklikte çizmek rayı kullanılamaz hale getirirdi. `Directory` storefront'ta `BrandListContainer`/`CategoryIndexContainer` içinde zaten kendi işini yapıyor. |
| Admin `ModerationContainer` satırları → `Card` | Satırlar zaten bir `Panel`in içinde ve bilinçli olarak `$surface-2` (tek kademe) kullanıyor. `Card` orada kart-içinde-kart üretirdi — yükseklik merdiveninin uyardığı durum. |

### Bulunan ve düzeltilen bir hata — `useFavorites` 24 istek

Kapsam turu için yazılan `useFavorites` testi gerçek bir hata buldu: kanca
yalnızca `isInitialized` bayrağına bakıyordu ve 24 ürünlü katalog sayfasında
her `FavoriteButton` aynı karede mount olup hepsi bayrağı `false` gördüğü
için **24 ayrı `GET /favorites/ids`** gidiyordu. `useCart` ve `useGarage`
aynı sorunu modül düzeyinde bir "uçuşta" kilidiyle çözmüş, `useFavorites`
korumasız kalmıştı. Aynı kilit eklendi; test 24 → 1 isteği kilitliyor.

---

## 9. Girdi ergonomisi — `PasswordInput` ve `MaskedInput`

Kütüphanede karşılığı **olmayan** iki girdi deseni uygulama katmanında yazıldı.
İkisi de hanui'ye taşınmaya aday; bu bölüm taşınırken gerekecek kararları
kaydediyor.

### `PasswordInput` — göz düğmesi neden `Input suffix` değil

`Input`un `suffix` yuvası bilinçli olarak `aria-hidden` **ve**
`pointer-events: none`: orası bir birim işareti ("TL", "kg") için. Tıklanan bir
denetim oraya konsaydı ne fareyle basılabilir ne de ekran okuyucuya görünürdü.
Bu yüzden düğme girdinin üzerine konumlanıyor ve girdiye sağdan yer açılıyor.

Durum `aria-pressed` ile değil düğmenin **adıyla** taşınıyor ("Şifreyi göster"
↔ "Şifreyi gizle"): düğme bir kip açmıyor, doğrudan bir eylem yapıyor.
Görünürlük her alanın kendi durumu — "yeni şifre" ile "tekrar" birlikte
açılmaz.

**Testlerde tuzak:** düğmenin erişilebilir adı "Şifre" ile başladığı için
`getByLabelText(/Şifre/i)` artık iki öğe buluyor. Kullanıcı için belirsizlik
yok (biri metin kutusu, biri düğme) ama testin hangisini istediğini söylemesi
gerekiyor: `{ selector: 'input' }`.

### `MaskedInput` — şablon görünür, "yazdıkça dolar"

Alanlar zaten yazılırken biçimleniyordu; eksik olan, kullanıcının **kaç hane
kaldığını yazmadan önce** görmesiydi. Kalan şablon girdinin üzerine bindirilen
soluk bir katmanla çiziliyor: yazılan kısım saydam (yalnızca genişliği kadar
yer tutar), kalanı `$text-3`.

Hizalama iki koşula bağlı ve bu bir **sözleşme**: girdi `isTechnical` (eş
genişlikli yazı tipi) ve katman `input-base` ile aynı dolguyu kullanıyor.
Orantılı bir yazı tipinde "1" ile "8" farklı genişlikte olduğu için katman
kayardı. Kütüphaneye taşınırsa bu ikisi tek dosyada birleşir ve kuplaj biter.

### Maske YALNIZCA biçimi sabit olan alana kondu

Bu listenin kendisi kararın parçası:

| Alan | Şablon | Neden |
| --- | --- | --- |
| Telefon | `+90 ### ### ## ##` | Ülke kodu sabit; "başına sıfır koyayım mı" sorusu tümüyle kalkıyor |
| Şase (VIN) | 17 yuva | Uzunluk standart. `I`/`O`/`Q` dönüşümü maskede değil `normalize` kancasında — o bir VERİ kuralı |
| Kart numarası | aileye göre | 15 haneli aileler (Amex) `4-6-5`; sabit 16 hanelik şablon Amex'te dört fazla yuva gösteriyordu |
| Son kullanma | `##/##` | Kartın üzerindeki biçimin aynısı |

**Şablon KONMAYAN alanlar** — üçü de biçimi değişken olduğu için:

- **Plaka**: `34 A 1234`, `34 AB 123` ve `34 ABC 12` üçü de geçerli
  (`validation.helper` `PLATE`). Sabit şablon ikisini reddederdi.
- **Parça / stok numarası**: üreticiye göre değişiyor; `isValidPartNumber`
  bu yüzden yalnızca "en az bir rakam içeren alfanümerik" diyor.
- **Sipariş numarası**: önek bir **ayardan** geliyor
  (`order.number_prefix`, en fazla dört harf) ve `order-number.helper` bunu
  bilerek sabitlemiyor. Rigid bir şablon, ayar değiştiği gün hiçbir müşterinin
  kendi numarasını yazamaması demekti. Alan yazarken biçimlenmeye devam ediyor,
  yalnızca şablonu gösterilmiyor.

### `applyMask`te bulunan hata

İlk sürüm sabit karakteri "girdi bitmediyse yaz" kuralıyla yazıyordu ve
girdinin kalanı şablona uymayan çöpten ibaretse ayraç yine de çıkıyordu:
`applyMask('5a3b2c', PHONE_MASK)` → `"+90 532 "`. Boşluk göze çarpmıyor ama
`maskRemainder` onu yazılmış saydığı için kalan şablon bir karakter kayıyordu.
Sabitler artık **bekletiliyor** ve ancak arkasından gerçek bir karakter
geldiğinde yazılıyor. Nöbetçi: `helpers/__tests__/mask.helper.test.ts`.

---

## 10. Tüketiciden gelen hata raporları — üçü kütüphanede

Beş rapor geldi; **üçü kütüphane kusuru** çıktı ve hanui kaynağında
düzeltildi. Bu bölüm nedenlerini kaydediyor.

### `ToastHub` her sayfada hidrasyon uyuşmazlığı üretiyordu

`if (!isClient()) return null;` render'ın **içindeydi** ve ardından portal
açılıyordu — React'in hidrasyon uyuşmazlığı için saydığı ilk maddenin ta
kendisi (sunucu/istemci dallanması). Sunucu `null`, istemcinin ilk render'ı
portal üretiyordu.

Yığın kök yerleşimde durduğu için uyuşmazlık **her sayfada** oluşuyordu.
Ölçüldü: `<ToastHub />` kaldırılınca `/` ve `/sepet` temiz, geri konunca hata
geri geliyor. `Tooltip` ve `Popover` aynı hatayı yapmıyor — onlar
`isOpen && isClient() && createPortal(...)` yazıyor ve hidrasyon sırasında
`isOpen` zaten `false`.

Düzeltme: `isClient()` yerine bir **montaj bayrağı**. Sunucu ve istemcinin
ilk render'ı aynı şeyi (`null`) üretir; portal montajdan sonra açılır.

### `Combobox` paneli kip pencerede kırpılıyordu

Panel `position: absolute` idi. `Modal` gövdesi `overflow: hidden` taşıyor
(uzun formda başlık sabit kalsın diye) ve panel oraya girince kesiliyordu:
"Aracınızı tanımlayın" penceresinde marka listesinin yalnızca ilk satırı
görünüyordu. Ölçüldü: liste `y=615 h=280`, pencerenin alt kenarı `655`.

Düzeltme: konum artık `usePositioning` ile — sabit konum kırpan atayı atlar
ve aşağıda yer yoksa panel **yukarı çevrilir**. Aynı kanca `Popover` ve
`Tooltip` içinde de kullanılıyor; konumlandırma tek yerden.

### `Combobox` ok ve çarpı ikonları birbirine yapışıktı

Üç ölçü birbiriyle çelişiyordu:

| | değer | sorun |
| --- | --- | --- |
| `--clearable` dolgusu | `$space-3 + $icon-md + $space-2 + 22px` | caret bir **flex çocuğu** olduğu için bu dolgu onu da içeri itiyordu; rezervasyon yalnızca mutlak konumlu çarpı içindi |
| çarpı ofseti | `$space-3 + $icon-md + $space-2` | caretin `$icon-md` (18px) genişliğinde olduğunu varsayıyordu |
| caret ölçüsü | `$icon-xs` (14px) | varsayımdan 4px küçük |

Ölçüldü: 199px'lik tetikleyicide caret sağ kenardan 60px, çarpı 38px içeride;
aralarında hiç boşluk yok — yani birbirine yapışık ve kutunun ortasına kaymış.

Düzeltme: caret de mutlak konumlu ve sağ kenara sabit; iki ofset de tek bir
`$clear-size` değişkeninden türüyor; ikon ölçüsü `$icon-sm`'e çıkarıldı
(14px çarpının yanında "yarım çizilmiş" görünüyordu).

### Tüketici tarafında geri alınan bir taşıma

**`AccountOrdersContainer` filtre şeridi `FilterBar`a çevrildi ve geri
alındı.** `FilterBar` eşit ağırlıkta, DAR alanlar için: `filter-surface`
yatay bir sarma satırı ve `FilterBarField` varsayılanı `flex: 0 1 220px`. Tam
genişlik isteyen kaydırılabilir bir çip şeridi o yuvaya sokulunca 220px'lik
bir pencereye sıkışıyor, `align-items: flex-end` yüzünden arama kutusuyla
hizası kayıyor ve şerit sağa taşıyordu. **Alanların biçimi aynı değilse şerit
de aynı değildir.**

---

## 11. Kapalı `<dialog>` çiziliyordu — "görünmez linkler"

Tüketici "boş bir yere tıklayınca başka sayfaya gidiyor, DOM'da
`hanui-palette__search` görünüyor" diye bildirdi. Kök neden kütüphanedeydi ve
iki bileşeni birden etkiliyordu.

`CommandPalette` ve `Drawer` kök kurallarında doğrudan `display: flex`
yazıyordu. Bu, tarayıcının `dialog:not([open]) { display: none }`
varsayılanını **ezer**: pencere kapalıyken de yerleşime girer, gerçek bir kutu
kaplar ve içindeki tıklanabilir öğeler etkin kalır.

**Ölçüldü** (panel, 1440×900, `/stok`): kapalı palet `x 576–1136, y −150–330`
kutusunu kaplıyordu — içeriğin tam üstünde. Boş görünen `(900, 250)`
noktasına tıklamak `/kaynak/bank-transfer-notifications` sayfasına götürdü.
`Drawer`da aynı hata vardı ve orada kutu 77+ gezinme bağı taşıyor.

`Modal` ve `PromptDialog` etkilenmiyordu (kökte `display` yazmıyorlar),
`BottomSheet` zaten doğru kalıptaydı (`display: none` + `&[open]`). `display`
artık üçünde de `[open]` altında. Kapanış animasyonu etkilenmiyor:
`surface-transition` zaten `display … allow-discrete` taşıyor, yani
`display: none` geçişe katılıyor.

**Kural:** bir `<dialog>` kök kuralına `display` yazılacaksa `[open]` altına
yazılır. Kapalı pencerenin görünmez ama tıklanabilir kalması sessiz bir
hatadır — ekranda hiçbir iz bırakmaz.

## 12. `compact` yoğunluk punto ölçeğinin yalnızca yarısını indiriyordu

Tüketici "panelde bazı ekranlar büyük görünüyor" dedi. Ölçüldü:

| token | varsayılan | compact (önce) | compact (şimdi) |
| --- | --- | --- | --- |
| `body` | 17px | 16px | 16px |
| `base` | 16px | 15px | 15px |
| `lg` | 19px | **19px** | 18px |
| `xl` | 23px | **23px** | 21px |
| `2xl` | 29px | **29px** | 25px |
| `3xl` / `4xl` | 37 / 47px | **aynı** | 31 / 39px |

Gövde 15 px'e inerken bir `<h2>` 29 px'te kalıyordu — başlık gövdenin
neredeyse iki katı. Aynı başlık vitrinde (gövde 17 px) 1,7 kat ve doğru
duruyor. Üst üste `h2`/`h3` yığan ekranlar (stok düzeltme, moderasyon,
raporlar) bu yüzden "devasa" okunuyordu.

**Yoğunluk bir ORAN kararıdır, bir kırpma listesi değil.** Ölçeğin yarısını
indirip yarısını bırakmak, aynı ekranda iki farklı ölçek karıştırmaktır.
Büyük uç da aynı oranda (~%15) indi. Görsel testler etkinin doğru yerde
olduğunu doğruladı: yalnızca "yoğun kip" iki görüntüsü değişti, başka hiçbir
bileşen sapmadı.
