# @ahmetilhn/hanui

Hanparca tasarım sistemi. React 19 · TypeScript strict · SCSS Modules · Vite.

Bu dosya **tasarım sözleşmesini ve ölçülmüş kararları** tutar. Kurulum,
kullanım, token ezme, metin sözleşmesi ve geliştirme komutları `README.md`
içindedir.

⚠ Bu sözleşme `hanparca-frontend` ve `hanparca-admin` için de **normatiftir**.
Onların CLAUDE.md'leri yalnızca uygulamaya özgü sapmaları yazar.

## Öğe seçimi — hangisi, ne zaman

| Soru | Cevap | Ayrımın nedeni |
|---|---|---|
| Seçim mi eylem mi? | `Select` / `Menu` | `listbox` "2 seçenekten biri seçili" der, `menu` "menü, 3 öğe". Eylemi listbox sunmak kalıcı bir seçim vaat ediyordu |
| Kaç seçenek? | ≤7 `ChipGroup` · 5-20 `Select` · 20+ `Combobox` | Aramasız liste 20 satırdan sonra taranamıyor |
| Filtre mi görünüm mü? | `ChipGroup` / `SegmentedControl` | Çipe ikinci kez basmak seçimi KALDIRIR; bölmeli denetimde "hiçbiri" yok |
| Panel mi sekme mi? | `Tabs` / `SegmentedControl` | `Tabs` `aria-controls` ile bir panele bağlanır; yoksa var olmayan panel vaat ediliyor |
| Form seçimi mi ayar mı? | `Checkbox` / `Switch` | Checkbox GÖNDERİLİR, switch ANINDA uygulanır — ekran okuyucuda duyuluyor |
| Bilinen liste mi serbest değer mi? | `Combobox` / `TagInput` | |
| Açıklama mı eylem mi? | `Tooltip` / `Popover` | Tooltip `pointer-events: none` — içine konan bağlantıya ulaşılamaz |
| Dar ekran mı geniş mi? | `BottomSheet` / `Drawer` | Tercih değil EKRAN kararı |
| Karar bekliyor mu? | `Modal` / `Popover` | Popover kipsel değil; kullanıcıyı hapsetmez |
| İleri mi geri mi bakıyor? | `Steps` / `Timeline` | Bir ADIM "başarısız" olamaz, bir OLAY olabilir |
| Sonu biliniyor mu? | `Progress` / `Spinner` | |
| Boş mu yüklenemedi mi? | `EmptyState` · `tone="error"` | Ağ hatasını "kayıt kalmamış" diye okuyan kullanıcı yanlış karar veriyor |

## Yüzey ailesi ve yükseklik

| Bileşen | Bağlam | Yükseklik |
|---|---|---|
| `Tile` | Gezinme | `raised` |
| `Card` | İçerik | `card` |
| `Panel` | Form / veri | `card` |
| `Popover` · `Menu` · `Tooltip` | Geçici katman | `overlay` |
| `Modal` · `Drawer` · `BottomSheet` | Kipsel | `modal` |

Merdiven `_mixins.scss` → `elevation()`. Beş gölge token'ı vardı ama "hangi
yüzey hangisini kullanır" yazılı değildi; aynı kademedeki iki yüzey farklı gölge
taşıyordu.

⚠ **Koyu temada derinliği gölge değil KENARLIK kurar** — koyu zeminde gölge
okunmuyor.

## Yarıçap ritmi

**İç yarıçap = dış yarıçap − dolgu** (`nested-radius()`). İç içe iki yüzey aynı
yarıçapı paylaşmaz: `Panel` (12 px) içindeki bir `Input` da 12 px taşıdığında iki
eğri eş merkezli olmuyor ve iç kutu optik olarak kaçık duruyor.

## Durum katmanları

Tek kural kümesi (`interactive-surface()`):

- **hover** — zemin BİR kademe değişir, başka hiçbir şey
- **active** — 1 px basılır (dokunsal geri bildirim, renk değil)
- **selected** — kenarlık + zemin BİRLİKTE (`selected-surface()`)

Ölçüldü: hover geri bildirimi 28 bileşen dosyasında **altı farklı özellik
yolundan** veriliyordu (`background-color` 30, `color` 18, `border-color` 16,
`transform` 7, `box-shadow` 3, `opacity` 2). Aynı jest iki bileşende iki farklı
şey yapıyordu.

⚠ `opacity` ile soluklaştırma **yasak**: metni de soluklaştırıp kontrast eşiğini
sessizce düşürüyor.

Tek istisna **yükselen yüzeyler** (`Card`, `Tile`): tıklanabilir kart hover'da bir
kademe yükselir, zemin değiştirmez — beyaz kartta bir kademe zemin değişimi
neredeyse görünmez (1,05:1). Satır, menü öğesi ve düğme için geçerli DEĞİL.

## Renk kararları

Palet **Hanparça kurumsal kimlik kılavuzu 2.0**'dan türer; kılavuzun altı
token'ı `palette.ts` içinde `BRAND` (üç marka rengi) + `CORPORATE` (üç yardımcı)
olarak ANKOR, geri kalan her kademe onlardan ölçülerek çıkarıldı.

| Kılavuz token'ı | Hex | `palette.ts` | Rolü |
|---|---|---|---|
| Koyu yeşil | `#00322a` | `BRAND.pine` | Birincil eylem, bant, açık zeminde logo |
| Açık yeşil | `#43ff9c` | `BRAND.mint` | İmza; koyu temanın birincil eylemi |
| Siyah | `#00120f` | `BRAND.ink` | Gövde metni, koyu temanın sayfası |
| Kâğıt | `#eff4f1` | `CORPORATE.paper` → `n100` | Açık zemin, koyu temada gövde metni |
| Slate | `#38594f` | `CORPORATE.slate` → `n600` | Açık zeminde ikincil metin |
| Sis | `#8fb3a7` | `CORPORATE.mist` → `textTwo` | Koyu zeminde ikincil metin |

- ⚠ **Açık yeşil AÇIK ZEMİNDE METİN OLAMAZ** — kâğıt üzerinde 1,18:1.
  Kılavuzdaki tek kesin renk kuralı bu ve kütüphanede iki yerde karşılığı var:
  koyu temanın `action` dolgusu (üzerine siyah metin, 14,65:1) ve `glow-1`.
  Olumlu durum ailesi mintten **türetilmez**; ankoru ayrı (`ANCHOR.green`
  `#1d9a64`, kâğıt üzerinde 3,22:1).
- **Nötr eksen yeşile kayar.** Önceki eksen serin gri-maviydi (H 207-220);
  kurumsal kâğıt/slate/sis H 144-162'de duruyor ve iki eksen yan yana
  geldiğinde aynı gri iki farklı renk gibi okunuyordu. Ara kademeler H
  152-168 bandında.
- **Amber yalnızca dönüşüm eylemi** (`UIVariant.CART`) — ekrandaki tek doygun
  turuncu. Kampanya bandında amber kullanılırsa o ekranda dönüşüm düğmesi
  koyu yeşile çevrilir; ikisi aynı anda olmaz. Kılavuzun "dördüncü renk yok"
  kuralı **logoyu** kapsar, arayüzün işlev renklerini değil.
- **Doygun dolgu = tıklanabilir.** Durum etiketleri **her zaman** tint zeminli
  (`@include tint`), eylemler her zaman dolgulu veya çerçeveli. Bu ayrım
  bozulursa kullanıcı durum etiketine tıklamayı dener.
- **Birincil eylem koyu yeşildir** (`#00322a`), amber değil; bir ekranda tek
  `PRIMARY`. `graphite*` token adları sözleşme gereği kaldı, değerleri koyu
  yeşil.
- **Mavi gezinme ve keşiftir**: bağlantı, etkin filtre, odak halkası. Odak
  halkası marka rengi OLAMAZ — yeşil halka yeşil dolgunun üzerinde görünmez.
- **Fiyat siyah kalır.** Güncel fiyat `$text`, üstü çizili eski fiyat `$text-3`,
  indirim küçük bir rozet. Kırmızı fiyat bu sektörde ucuz durur ve kırmızıyı
  "aracına uymaz" anlamından koparır.

⚠ **Koyu temada bant sayfadan daha KOYU DEĞİL, daha YEŞİL.** Eski kural
"bant bir tık koyu olmalı, yoksa yüzüyor görünür" idi ve sayfa `#0e1419`ken
uygulanabilirdi. Sayfa artık kurumsal siyahın kendisi — altında kademe **yok**.
Bant kılavuzun "koyu yüzeylerin tamamı" dediği marka zeminine çıkar (1,36:1
sayfaya karşı) ve üstündeki logo mint olduğunda imza eşleşmesi bandın içinde
çıkar. ⚠ Bandın ayırıcı çizgisi bu yüzden sayfa kenarlığından **gelmez**
(`BAND.darkLine`): aynı ton bant zemininde 1,10:1'e düşüyordu — çizgi çizilmiş
ama görünmüyordu.

### Durum tintleri

Hepsi **tint zemin + koyu metin + eşleşen hairline**, asla doygun dolgu.

| `tone` | Anlam |
|---|---|
| `success` | Stokta / aracına uyar |
| `warning` | Son N adet |
| `neutral` | Tükendi |
| `danger` | Aracınıza uymaz |
| `oem` | Orijinal OEM |
| `alt` | Muadil |
| `info` | Nötr bilgi |

⚠ `$danger-solid` ayrıdır: yıkıcı bir **eylem** dolgusu (silme onayı), durum
tinti değil. Aynı kırmızıyı taşımaları kullanıcının uyarı etiketine tıklamayı
denemesine yol açıyordu.

## Tipografi rolleri

| Rol | Kademe | Not |
|---|---|---|
| Sayfa başlığı | `page-title` | Akışkan: 640-1360 px arası kademesiz |
| Bölüm başlığı | `heading(xl)` | |
| Panel başlığı | `heading(base)` | 19 px altı → arayüz fontu |
| Gövde | `font-size-base` | |
| Arayüz metni | `font-size-sm` | Düğme, etiket, tablo |
| Yardım metni | `font-size-xs` | |
| Overline | `font-size-2xs` | Büyük harf + `tracking-wide` |

⚠ `heading()` punto değil **kademe adı** alır: puntolar çalışma zamanında
ezilebilir ve "19 px eşiği" sabit bir sayı olarak anlamını yitiriyor.

## Erişilebilirlik

### Kontrast eşikleri

| Tür | Eşik |
|---|---|
| Gövde metni | 4,5:1 (WCAG 1.4.3) |
| ≥19 px ya da ≥16 px kalın | 3:1 |
| İkon, odak halkası, denetim sınırı | 3:1 (WCAG 1.4.11) |

**Advisory** (ölçülür, kırmaz): hairline'lar ve pasif dolgular. 1.4.11 "bilgiyi
ayırt etmek için GEREKLİ" görsel bilgiyi kapsar; rozetin kenarlığı anlamın tek
taşıyıcısı değil ve 3:1'e zorlamak her rozeti çerçeveli bir etikete çevirirdi.

⚠ **Pasif denetimde tek istisna: ETİKET.** Pasif dolgu advisory kalır ama
üzerindeki **metin** ölçülür ve eşiği tutmazsa derleme kırılır. WCAG bunu
istemiyor (1.4.3/1.4.11 pasif bileşeni muaf tutuyor) ama muafiyetin bedeli
ölçüldü: pasif düğme etiketi açık temada **1,55:1** çiziliyordu ve çift
denetçinin listesinde hiç yoktu. Pasiflik **dolgunun geri çekilmesiyle**
bildirilir, metnin silinmesiyle değil.

### Değişmez kurallar

- **Renk tek başına anlam taşımaz** (1.4.1). Her durum ikon/biçim/metinle de
  bildirilir: `Switch` kulbun konumu, `Steps` üç ayrı işaret, `Timeline` tik ve
  çarpı, `Stat` ok yönü + okunan metin.
- **Dokunma hedefi ≥ 44×44** (2.5.8) — görsel kutu büyütülmeden
  `@include tap-target`. Yoğun kipte de küçülmez.
- **Odak halkası `:focus-visible`**, mavi, asla kaldırılmaz. `outline: none`
  yalnızca yerine başka bir gösterge çizildiği dört yerde. `:focus` kullanmak
  fareyle tıklandığında da halka gösteriyor ve kullanıcılar bunu hata sanıyordu.
- **Kaydırılabilir bölge klavyeyle ulaşılabilir** (2.1.1). `ScrollArea` taşmayı
  ölçüp `tabindex`i yalnızca gerçekten gerekiyorsa yazar.
- **Metin kütüphaneden gelmez.** Erişilebilir adlar `labels` sözleşmesinden;
  eksik metin geliştirme kipinde konsola düşer.

### Yerel öğe korunur

`<dialog>`, `<input type="range">`, `<input type="radio">`,
`<input type="checkbox">`, `<input type="date">`, `<input type="file">`,
`<details>`. Taklit yazmanın tek gerekçesi **ölçülmüş bir kusur** ve o gerekçe
bileşenin JSDoc'una yazılır.

⚠ **Bugünkü tek istisna `Select`.** Kural onu da kapsıyordu ve uzun süre doğru
karardı; ancak açılır listesinin içine hiçbir biçimde girilemiyor — seçili değeri
işaretlemek, satırı yükseltmek, ikon koymak mümkün değil ve her tarayıcı onu
başka türlü çiziyor. `Select` tetikleyici + listbox olarak kuruldu; bedeli (odak
yönetimi, ok tuşları, `aria-activedescendant`) **bir kez** ödenip tek bileşene
kapatıldı. Yeni bir yerde ham `<select>` yazılmaz.

## Hareket

Bileşenler kendi sürelerini SEÇMEZ; ölçek dışı süre gerekiyorsa token'a eklenir.
Nöbetçi `stylelint.config.mjs` — bileşen SCSS'inde ham `ms`/`s` yasak.

| Token | Süre | Ne için |
|---|---:|---|
| `duration-instant` | 80 ms | Basma, tik, sayaç |
| `duration-fast` | 140 ms | Hover, odak, renk, kenarlık |
| `duration-normal` | 200 ms | Kip pencere, panel, açılır liste |
| `duration-slow` | 320 ms | Dipten açılan panel, uzun kayma |

⚠ **200 ms üzerindeki geçişler** tıklama ile sonuç arasında görünür gecikme
yaratır ve arayüz yavaş hissedilir.

**Döngü süreleri ölçekten AYRI**: `duration-spin` 700 ms, `duration-shimmer`
1400 ms. Sürekli dönen bir gösterge bir *geçiş* değil — 320 ms'lik dönüş baş
döndürücü, 140 ms'lik parıltı titreşim gibi okunuyor. Ayrı isim vermenin sebebi
ölçekten kaçmak değil **ölçeği korumak**.

**Eğriler:** `ease-out` yüzey açılışı ve giriş · `ease-in-out` iki yönü de
anlamlı geçiş · `ease-spring` **yalnızca** dipten açılan panel.

**Giriş ve çıkış SİMETRİK.** Kipsel yüzeyler açılırken canlanıp kapanırken bir
karede yok oluyordu; kullanıcı neyin kapandığını göremiyordu.
`surface-transition` bunu `@starting-style` + `transition-behavior:
allow-discrete` ile tek kural kümesinde verir.

⚠ `animation` ile bu **mümkün değil**: bir animasyon öğenin `display: none`
olmasını geciktiremez. `::backdrop` için **ayrı** mixin
(`backdrop-transition`) — `&[open]` sözde öğeye uygulanamaz, çünkü
`dialog::backdrop[open]` hiçbir zaman eşleşmez.

`prefers-reduced-motion` her animasyonda karşılanır.

## Göç ve `@deprecated` yollar

**Kural:** bir prop adı ya da davranışı değişecekse eski yol **bir sürüm boyunca
çalışmaya devam eder**, `@deprecated` işaretlenir ve buraya yazılır. Sessiz
kırılma yok. Nöbetçi: `__tests__/api-consistency.test.ts` — burada kayıtlı
olmayan bir `@deprecated` prop derlemeyi kırar.

### `Card.isContained` → `fit`

Görselin çerçeveyi nasıl doldurduğu artık **üç değerli** tek bir prop:
`fit="cover"` (doldurur, taşanı kırpar) · `fit="contain"` (kırpmadan sığdırır,
varsayılan) · `fit="inset"` (sığdırır + %85'e çekip merkezler).

`isContained` bir sürüm daha çalışır; iki prop birlikte verilirse **`fit`
kazanır**. Ters öncelik, `isContained`ın varsayılanı `true` olduğu için yeni
prop'u sessizce etkisiz bırakırdı.

⚠ **Davranış değişikliği — `cover`:** bu dal eskiden hiç `object-fit`
taşımıyordu, yani tarayıcı varsayılanı `fill` yürürlükteydi ve oranı çerçeveden
farklı bir fotoğraf kırpılmıyor **eziliyordu**.

### `Tooltip.position` → `side`

Ad değişti çünkü davranış değişti: `position` SABİT bir kenar yazıyordu ve balon
oraya sığmadığında görünüm alanının dışına taşıyordu. `side` bir *tercih*tir;
sığmazsa karşı kenara çevrilir.

### `ConfirmDialog.kind` → `variant`

Ölçü/ton/varyant için sistemde **tek ad** kullanılır; `kind` o sözleşmenin
dışında kalmış tek isimdi.

## Kod düzeni ve tasarım prensipleri — ZORUNLU

| Prensip | Ne demek |
|---|---|
| **KISS** | Uzun ve dolambaçlı yerine sade ve okunur. |
| **DRY** | Aynı kural iki yerde yaşamaz. |
| **SRP** | Bir dosya tek sebeple değişir. |
| **SoC** | Konumlandırma/erişilebilirlik mantığı `hooks/`ta, çizim bileşende, renk `theme/`te. |
| **OCP** | Yeni görünüm yeni varyant token'ıdır; bileşen gövdesine `if` eklemek değil. |
| **YAGNI** | Çağıranı olmayan prop eklenmez — her prop bir API taahhüdüdür. |
| **Immutability** | Prop'lar ve token nesneleri yerinde değiştirilmez. |

### Klasör sözleşmesi

| Ne | Nerede |
|---|---|
| Paylaşılan / alanı anlatan `type` | `src/types/*.type.ts` |
| `enum` | `src/enums/*.enum.ts` |
| Sabit değerler | `src/constants/*.constants.ts` |
| Birden fazla yerde kullanılan fonksiyon | `src/helpers/*.helper.ts` |

⚠ **Bileşenin KENDİ genel API tipi bileşenin yanında kalır** (`BadgeTone`
`Badge`de, `TabItem` `Tabs`ta, `UploadFile` `FileUpload`ta). Bunlar "o an
çalışılan dosyaya rastgele eklenmiş" tipler değil, bileşenin sözleşmesidir;
bileşen ile sözleşmesini ayırmak, tüketicinin iki dosya açmasını gerektirir
ve bir bileşen kütüphanesinde okunurluğu **düşürür**.

**Taşınanlar — gerçekten dağınık olanlar:** tema tipleri (`HanuiToken`,
`HanuiThemeConfig`, `HanuiLabels`, `InitHanuiOptions`… — `theme/tokens.ts`
480 satırlık bir **veri** dosyası, tip bildirmesi işi değildi), kanca
tipleri (`PositionSide`, `PositioningOptions`, `VirtualRange`,
`AnnouncePoliteness`…) ve `ClassValue`.

**`Combobox` istisnası — 515 satır bir sinyaldi.** Tipleri (`ComboboxOption`,
`ComboboxLabels`, `ComboboxProps`) `types/combobox.type.ts`e, ölçüleri
(`VIRTUAL_THRESHOLD`, `OPTION_HEIGHT`) `constants/combobox.constants.ts`e
taşındı; dosya **460** satıra indi. Kural bozulmadı: tipler bileşenden
**yine de dışa açılıyor**

```ts
export type { ComboboxLabels, ComboboxOption, ComboboxProps } from '../../types/combobox.type';
```

çünkü çağıranlar (uygulamalar ve testler) `@/components/Combobox` yolundan
alıyordu ve yalnızca dosya yeri değişti diye bir sürüm kırılması olmamalı.

⚠ **`theme/tokens.ts` (422) BÖLÜNMEDİ.** O bir **veri tablosu**; renk/uzaklık
adlarını iki dosyaya ayırmak "hangi token nerede" sorusunu üretir ve
okunurluğu düşürür. Dosya boyu bir kapı değil sinyaldir — burada sinyal
yanlış alarm.

⚠ **Public API DEĞİŞMEDİ, ölçüldü.** `build/index.d.ts` içindeki dışa
aktarım kümesi taşımadan önce ve sonra **birebir aynı** (144 ad).
`src/index.ts` bir cephedir; tip gövdeleri nerede yaşarsa yaşasın tüketici
(`hanparca-frontend`, `hanparca-admin`) aynı adları aynı yerden alır.
Taşıma yaparken bu karşılaştırma **tekrarlanmalı**:

```bash
npm run build && grep -oE 'export (type )?\{[^}]*\}' build/index.d.ts | sort -u
```

### Node 24 · ECMAScript 2025

`tsconfig.json` → `target: ES2023`, `lib: ["DOM", "DOM.Iterable", "ESNext"]`.

⚠ **`target` burada ES2024 DEĞİL ve bunun ölçülmüş bir sebebi var.** Diğer
depolar `ES2024` yazıyor; hanui'de o değer her derlemede **89 uyarı** basıyordu:

```
▲ [WARNING] Unrecognized target environment "es2024" [tsconfig.json]
```

Vite 5.4'ün getirdiği esbuild **0.21.5** ve o sürümün *tsconfig* ayrıştırıcısı
`es2024`ü tanımıyor (`--target=es2024` bayrağı ayrı bir yol ve kabul ediyor —
bu yüzden ilk bakışta çelişkili görünüyor). Tanımadığı değeri **sessizce yok
sayıp** kendi varsayılanına düşüyordu, yani yapılandırma çalışmıyor ama
başarısız da olmuyordu.

**Kaybedilen bir şey yok:** `target` yalnızca *downlevel* üretimini belirler,
ES2025 API'lerini veren şey `lib: ESNext`. Yayınlanan bir kütüphane için
`ES2023` çıktısı zaten daha güvenli. Vite/esbuild yükseltildiğinde `ES2024`
yazılabilir; ölçüm `npm run build 2>&1 | grep -c "Unrecognized target"` → `0`.

⚠ **`memo()` çağrısı `/*#__PURE__*/` OLMADAN yazılmaz — ağaç sarsmayı kırar.**
`PasswordInput` ve `ToastPortal` eklenirken bu atlandı ve `size-limit`
yakaladı: yalnızca `Button` ithal eden bir uygulama **3,93 → 5,68 kB**
indiriyordu (`Badge` 3,31 → 5,19). İki bileşen de anlaşılabilir biçimde
"küçük"tü ama modül düzeyindeki açıklamasız çağrı, bundler için yan etki ve
hedefin **tüm bağımlılık zincirini** ayakta tutuyor. Doğru biçim istisnasız:

```ts
export default /*#__PURE__*/ memo(/*#__PURE__*/ named(PasswordInput, 'PasswordInput')) as typeof PasswordInput;
```

Düzeltmeden sonra ölçüm tabana **birebir** döndü (3,93 / 3,31). Bu kural
`helpers/component.helper.ts` javadoc'unda ve `Toast`taki `new Set()`
açıklamasında zaten yazılıydı; nöbetçi `.size-limit.js` — **ve yalnızca tam
`npm run verify` koşusunda çalışır**, `npm test` bunu görmez.

### Ön-commit kancası

`.githooks/pre-commit` (bu turda **eklendi**) — **Prettier** → **ESLint** →
**Stylelint** → **TAM test süiti**. Ölçüldü: süit 3,4 sn (35 dosya /
411 test). `package.json`daki `prepare` betiği `core.hooksPath`i
`npm install` sırasında ayarlar.

### `PasswordInput` ve `ToastPortal` — iki uygulamadan buraya taşındı

Her ikisi de `hanparca-admin` ve `hanparca-frontend`te **birebir aynı dosya**
olarak duruyordu ve ikisi de zaten bu kütüphanenin bileşenlerini sarmalıyordu
(`Input`+`IconButton`, `ToastHub`) — yani en baştan buraya aitlerdi.

| Bileşen | Neden burada |
|---|---|
| `PasswordInput` | `Input` + `IconButton` sarmalayıcısı. Etiketler `labels.passwordShow` / `labels.passwordHide` üzerinden; sabit Türkçe metin gömülü DEĞİL. |
| `ToastPortal` | `ToastHub` portal kullanıyor ve `document` olmadan çalışamıyor; sunucuda çizilen ağaçta hidrasyon uyuşmazlığı üretir. Montaj bekleyen sarmalayıcı uygulamanın değil bileşenin sorunu. |

⚠ **Uygulamalar HENÜZ GEÇMEDİ.** `hanparca-admin` ve `hanparca-frontend`
hanui'yi npm'den alıyor (`2.1.1`) ve bu bileşenler `2.1.0`da. Geçiş için
sırasıyla: `npm publish` → iki uygulamada bağımlılığı yükselt → yerel
`components/PasswordInput` ve `components/ToastPortal` klasörlerini sil →
`import { PasswordInput, ToastPortal } from '@ahmetilhn/hanui'`. Yayın
yapılmadan yerel kopyaları silmek her iki uygulamayı da kırar.

⚠ **`2.2.0` (kurumsal palet) de aynı kapıda bekliyor.** Bağımlılık tam sürüme
sabit (`"2.1.1"`, aralık değil), yani yeni palet **yayınlanana ve iki
uygulamada `@ahmetilhn/hanui@2.2.0`'a yükseltilene kadar** vitrine/panele
inmez. Uygulamaların kendi dosyalarında duran marka yüzeyleri (logo varlıkları,
panel rayı, `og.png`, `themeColor`, manifest, mail token'ları) bundan bağımsız
ve **zaten güncel** — yani geçiş penceresinde kurumsal logo yeni, gövde
renkleri eski görünür. Doğru sıra: `npm publish` → iki uygulamada dep bump.

### `ThemeToggle` ve `Logo` neden BURAYA TAŞINMADI

- **`ThemeToggle`** `nav-fg`, `nav-bg`, `nav-hover`, `nav-line` token'larını
  okuyor; bunlar uygulamanın üst bandına ait ve hanui'nin token
  sözleşmesinde **yok**. Buraya taşımak ya o token'ları kütüphaneye sokmayı
  (bir uygulamanın kroması genel bir tasarım sistemine girer) ya da bileşeni
  yeniden tasarlamayı gerektirir (zemin rengi tüketiciden gelen CSS özel
  değişkenleriyle). İkincisi doğru yol ama ayrı bir tur.
- **`Logo`** marka varlığı taşıyor (`/brand/*.svg`, "Hanparca"). MIT
  lisanslı, genel amaçlı bir tasarım sistemine tek bir şirketin markasını
  koymak yanlış olur. Doğru ayrıştırma: mekanizma (temaya göre kaynak
  değiştirme, orana göre boyutlandırma) hanui'ye, varlıklar uygulamada.

⚠ İkisi de bugün **iki depoda kopya** ve ikisi de **ayrışmış** (`ThemeToggle`
101 vs 96 satır — admin'de `Tooltip`, vitrinde `IconButton`; `Logo` 117 vs
128 — vitrinde ek `app` varyantı). Bu bilinen bir borçtur, görünmez bir
kopya değil.
