# @ahmetilhn/hanui

Hanparca tasarım sistemi. React 19 · TypeScript strict · SCSS Modules · Vite.

Bu dosya **tasarım sözleşmesini ve ölçülmüş kararları** tutar. Kurulum,
kullanım, token ezme, metin sözleşmesi ve geliştirme komutları `README.md`
içindedir.

⚠ Bu sözleşme `hanparca-frontend` ve `hanparca-admin` için de **normatiftir**.
Onların CLAUDE.md'leri yalnızca uygulamaya özgü sapmaları yazar.

⚠ **Bu dosya 5.x'i anlatır.** Hanparça uygulamaları hanui'yi `^4.1.0` ile
alıyor ve 5.x'e kendiliğinden geçmez; geçene kadar onlar için geçerli renk
kararları `v4.1.0` etiketindeki CLAUDE.md'dedir. Geçiş tablosu: "Göç" →
"5.0 token sözleşmesi".

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
| Tek bölüm mü bölümler listesi mi? | `Disclosure` / `Accordion` | `Accordion` her bölümünü bir `Disclosure` olarak çizer; `<details>` mantığı tek yerde |
| Durum noktası mı rozet mi? | `StatusDot` / `Badge` | Nokta süren bir durumu (bağlı, çalışıyor) ADIYLA taşır — `label` zorunlu, görsel olarak gizli. Rozet okunan bir etikettir |
| Boş mu yüklenemedi mi? | `EmptyState` · `tone="error"` | Ağ hatasını "kayıt kalmamış" diye okuyan kullanıcı yanlış karar veriyor |

## Yüzey ailesi ve yükseklik

| Bileşen | Bağlam | Yükseklik |
|---|---|---|
| `Tile` · `SummaryCard` | Gezinme | durgunken kenarlık; hover'da bir kademe yükselir (`shadow-md`) |
| `Card` | İçerik | kenarlık — gölge YOK |
| `Panel` | Form / veri | kenarlık — gölge YOK |
| `Popover` · `Menu` · `Tooltip` · `Select`/`Combobox` paneli · `Toast` | Geçici katman | `shadow-lg` |
| `Modal` · `Drawer` · `BottomSheet` · `CommandPalette` | Kipsel | `shadow-xl` |

**Önce renk bloğu, gölge nadir (5.0).** Kart ve panel durgun hâlde gölge
taşımaz; derinliği krem sayfa ile açık kartın farkı ve kenarlık kurar
(`card` / `panel` mixin'leri). 4.x'te her kart `shadow-sm` taşıyordu ve gölge
"bir şey bu yüzeyin üstünde" sinyali olmaktan çıkmıştı.

⚠ **Koyu temada derinliği gölge değil KENARLIK kurar** — koyu zeminde gölge
okunmuyor ve 5.0'da kademeler bilinçle birbirine yakın (aşağıda).

## Yarıçap ritmi

**İç yarıçap = dış yarıçap − dolgu.** İç içe iki yüzey aynı yarıçapı paylaşmaz:
`Panel` (12 px) içindeki bir `Input` da 12 px taşıdığında iki eğri eş merkezli
olmuyor ve iç kutu optik olarak kaçık duruyor. Kural bugün elle uygulanır;
bunu hesaplayan bir mixin YOK (bir dönem burada `nested-radius()` yazıyordu,
öyle bir mixin hiç olmadı).

## Durum katmanları

Tek kural kümesi (`interactive-surface()`):

- **hover** — zemin BİR kademe değişir, başka hiçbir şey
- **active** — 1 px basılır (dokunsal geri bildirim, renk değil)
- **selected** — kenarlık + zemin BİRLİKTE: `selected-tint` + `selected-line`
  (mürekkep). Seçim yalnız zeminle verilmez.
- **disabled** — dolgu geri çekilir, metin silinmez (`passive-surface()`:
  `surface-2` zemin · `border` kenarlık · `text-3` metin). Pasif **seçim** seçim
  mürekkebini bırakır ve `text-3` bir işaretle taşınır: `Chip` kenarlığı,
  `RadioCard` noktası, `Switch` izinin kenarlığı, `RatingInput` dolu yıldızı

Ölçüldü: hover geri bildirimi 28 bileşen dosyasında **altı farklı özellik
yolundan** veriliyordu (`background-color` 30, `color` 18, `border-color` 16,
`transform` 7, `box-shadow` 3, `opacity` 2). Aynı jest iki bileşende iki farklı
şey yapıyordu.

⚠ `opacity` ile soluklaştırma **yasak**: metni de soluklaştırıp kontrast eşiğini
sessizce düşürüyor.

⚠ **Kural yazılıydı ama dokuz bileşende ÇİĞNENİYORDU** (2026-10-10): `Chip`,
`Pagination`, `RadioCard`, `Switch`, `RangeSlider`, `FileUpload`, `RatingInput`
pasif hâli; `DateField` takvim ikonu ve `Spinner`ın azaltılmış hareket hâli.
Hepsi token'a çevrildi. stylelint `opacity`yi yasaklayamaz (geçişlerde meşru);
nöbetçi `__tests__/styles/passive-opacity.test.ts` — `0`/`1` dışındaki her
`opacity` soluklaştırmadır ve kırar. `QuantityStepper` pasif düğmesi ve
`DataTable` sıralama ikonu hâlâ taşıyor: testte `KNOWN_DEBT`, düzeltilince
listeden çıkar (çıkmazsa test kırar).

⚠ **`opacity` zorlanmış renk kipinde de soluklaştırıyordu; token'lar
soluklaştırmaz.** O kipte `text-3` `CanvasText`e eziliyor ve pasif hâl etkin
hâlden ayırt edilemiyordu (ölçüldü: `Switch`, `FileUpload`, `RatingInput`,
`RadioCard`). `passive-text()` / `passive-surface()` o kipte `GrayText` yazar.
⚠ Sistem rengi **ebeveynden miras KALMAZ**: kendi rengini yazan her çocuk ayrı
ister — pasif `fieldset` `GrayText` alırken içindeki `legend` `CanvasText`
çiziliyordu. Yerel `:disabled` öğeleri `base.scss` zaten karşılıyor.

⚠ **`Switch` pasif izi `track`tır, `surface-2` DEĞİL.** Kapalı etkin anahtarın
izi zaten `action-soft` (pasif dolgu token'ı), ve koyu temada `surface-2` kulpla
(`surface`) aynı aydınlıkta: 1,12:1, kulp kayboluyordu.

Tek istisna **yükselen yüzeyler** (`Card`, `Tile`): tıklanabilir kart hover'da bir
kademe yükselir, zemin değiştirmez — açık kartta bir kademe zemin değişimi
neredeyse görünmez. Satır, menü öğesi ve düğme için geçerli DEĞİL.

## Renk kararları (5.0)

**Tek cümle: zemin mürekkep ve kâğıt, yeşil eylemdir.** Arayüzün nötrleri
claude.com'un sıcak mürekkep ekseninden; markanın iki yeşili (çam, mint) yalnızca
**birincil eylemde, bağlantıda, odak halkasında ve marka işaretinde** yaşar.

Palet `palette.ts` içinde ÜRETİLİR (`scripts/lib/palette-recipe.mjs` →
`npm run tokens`); dört değer ankor, geri kalan her şey onlardan OKLCH'te türer:

| Ankor | Hex | `palette.ts` | Rolü |
|---|---|---|---|
| Çam | `#00322a` | `BRAND.pine` | Birincil eylem dolgusu, marka şeridi, açık zeminde logo |
| Mint | `#43ff9c` | `BRAND.mint` | İmza; koyu zeminde logo, koyu temada birincil eylemin SINIRI |
| Mürekkep | `#141413` | `BRAND.ink` = `NEUTRAL.n900` | Gövde metni, koyu temanın sayfası, seçim dolgusu |
| Kâğıt | `#faf9f5` | `NEUTRAL.n25` | Açık temanın sayfası, koyu temada gövde metni |

### 4.x'ten 5.0'a: nötr eksen yeşilden çıktı

4.x'in nötr merdiveni marka eksenindeydi (H 152-177) ve açık ucu bilinçle
"doygun" yazılmıştı (chroma 0,05'e kadar). Sonuç ölçülmedi, **görüldü**:
sayfa `#f7fcf8`, kart zemini `#e9f7ed`, kenarlık `#c0eacf`, koyu sayfa
`#010f0b`, koyu kart `#071915` — arayüzün her yüzeyi açık bir yeşil çiziyordu
ve rol rengi de yeşil olduğu için yeşil bir vurgu olmaktan çıkıp arayüzün genel
rengine dönüşmüştü.

5.0'ın nötrleri sıcak mürekkep: **H 75-107, chroma 0,002-0,02**. Kademeler
mutlak chroma ile yazılır (`{ l, c, h }`) — oranla yazılan bir nötr, erişilebilir
tavan tona göre üç katına kadar değiştiği için kademeler arasında kayıyordu.

⚠ **Nöbetçi:** `build-palette.mjs` nötr merdivende chroma > **0,025** gördüğünde
patlar (`NEUTRAL_CHROMA_CEILING`). 4.x'te eksen hiçbir kapıya takılmadan
renklendi; bir daha sessizce olamaz.

⚠ **Kurumsal kılavuz 2.0'dan BİLİNÇLİ SAPMA.** Kılavuzun kâğıt / slate / sis
üçlüsü (`CORPORATE`) yeşil tonlu ve 4.x'te nötr merdivenin takma adıydı. 5.0'da
üçlü **yalnızca marka şeridinde** (`band-*`) yaşıyor: çam zeminin üzerindeki yeşil
tonlu metin markanın sesi, arayüzün zemini değil. Arayüz nötrleri kılavuzdan değil
mürekkep ankorlarından türer.

### Açık tema: sayfa KREM, kart AÇIK

| Token | Değer | Ölçüm |
|---|---|---|
| `page` | `#faf9f5` | `text` 17,50:1 |
| `surface` (kart, girdi) | `#fffefc` | sayfaya 1,05:1 |
| `surface-inset` | `#f5f0e8` | |
| `surface-2` | `#efe9de` | sayfaya 1,15:1 |
| `surface-3` | `#e8e0d3` | |
| `border` / `border-strong` | `#ded8d0` / `#d0c8bd` | sayfaya 1,34 / kartta 1,64 (advisory) |
| `text` / `text-2` / `text-3` | `#141413` / `#4d4b46` / `#67655e` | `surface-2` üzerinde 15,26 / 7,21 / 4,83:1 |

⚠ **Kart sayfadan dolguyla AYRIŞMAZ** (1,05:1) — ayrımı kenarlık taşır.
Kenarlığı olmayan yeni bir yüzey krem üzerinde **görünmez** olur ve nöbetçisi
yoktur: `check-contrast` kenarlık çiftlerini advisory listesinde tutar.

⚠ claude.com'un `muted` değeri (`#6c6a64`) `surface-2` üzerinde 4,48:1 —
eşiğin altında; `text-3` bu yüzden bir tık koyu. `muted-soft` (`#8e8b82`,
kremde 3,23:1) açık temada hiçbir metin token'ına girmez.

⚠ Saf beyaz ve saf siyah palette YOK (`palette.contract.test.ts`).

⚠ Değişiklik tüketicilerde **elle** izlenen iki yerde yankılanır:
`hanparca-frontend` `manifest.ts` → `background_color` ve uygulamaların
`themeColor`'ı. hanration için: `layout.tsx` → `themeColor` açık/koyu çifti.

### Koyu tema: zemin SICAK SİYAH, yeşil vurgudur

| Token | Değer | Ölçüm |
|---|---|---|
| `surface-inset` | `#0e0e0d` | |
| `page` | `#141413` | |
| `surface` | `#181715` | sayfaya 1,03:1 |
| `surface-2` | `#1f1e1b` | `surface`e 1,07:1 |
| `surface-3` | `#2a2925` | `surface-2`ye 1,14:1 |
| `border` / `border-strong` | `#33312d` / `#4a4843` | sayfaya 1,42:1 |
| `text` / `text-2` / `text-3` | `#faf9f5` / `#b4b1a9` / `#8e8b82` | `surface-2` üzerinde 15,82 / 7,78 / 4,89:1 |

⚠ Kademeler arası fark **bilinçle küçük** (1,03-1,14:1): derinliği kenarlık
kurar. `surface-3` claude.com'un `#252320`sinden bir tık açık, çünkü
`interactive-surface`in hover'ı TEK kademe ve o değerde görünmüyordu.

⚠ **Bant sayfayı ÖRTMEZ, sayfanın devamıdır** — iki temada da `nav-bg` = `page`,
sınırı `nav-line` çizer. Alt bilgi bir kademe yukarı çıkar.

### Yeşil nerede yaşar — ve nerede YAŞAMAZ

| Ne | Token | Açık | Koyu |
|---|---|---|---|
| Birincil düğme dolgusu | `action` | `#00322a` | `#00322a` |
| Birincil düğmenin sınırı | `action-line` | `#00322a` | `#43ff9c` |
| Bağlantı | `link` / `link-hover` | `#17704e` | `#60d4a1` |
| Odak halkası | `ring-color` | `#1f7b56` | `#60d4a1` |
| Marka şeridi, logo, marka madalyonu | `band-*` | çam + mint | aynı |
| Dönüşüm eylemi (Hanparça) | `cart*` | `#1ba055` | `#37c971` |
| Olumlu DURUM | `ok-*`, `green-accent` | anlamsal | anlamsal |

**Seçim mürekkeptir:** etkin sayfa, seçili çip/seçenek/satır, sekme çizgisi,
ilerleme, döndürücü, kaydırıcı, onay kutusu, radyo, anahtar, adım, `Tile`
madalyonu, `Button` OUTLINE çerçevesi → `selected*` (açıkta `#141413`, koyuda
krem `#faf9f5` + siyah metin). 4.x'te bunların hepsi rol yeşilini taşıyordu:
**28 bileşen dosyasında 87 bildirim.**

⚠ **Nöbetçi `__tests__/styles/green-footprint.test.ts`.** Bileşen SCSS'indeki
`action*`, `cart*`, `link*`, `green-accent*`, `band-*`/`glow-*` kullanımları bir
izin listesine bağlı; listede olmayan bir bileşen yeşile uzanırsa test kırılır,
listede olup artık kullanmayan da (bayat izin). 4.x rol ailesinin
(`$role*`) geri gelmesi ayrıca kırar. Yeni bir yeşil kullanım listeye
**gerekçesiyle** girer.

- **Doygun dolgu = tıklanabilir.** Durum etiketleri **her zaman** tint zeminli
  (`@include tint`), eylemler her zaman dolgulu veya çerçeveli. Bu ayrım
  bozulursa kullanıcı durum etiketine tıklamayı dener.
- **Bir ekranda tek `PRIMARY`.**
- **Fiyat siyah kalır.** Güncel fiyat `$text`, üstü çizili eski fiyat `$text-3`,
  indirim küçük bir rozet. Kırmızı fiyat bu sektörde ucuz durur ve kırmızıyı
  "aracına uymaz" anlamından koparır.
- ⚠ **Mint AÇIK ZEMİNDE METİN OLAMAZ** — krem üzerinde 1,24:1. Kılavuzdaki
  tek kesin renk kuralı bu.
- ⚠ **AÇIK YEŞİL ZEMİNLİ DÜĞME YOKTUR.** Mint kılavuzda **logonun** rengi; bir
  dönem koyu temanın birincil eylemini mint dolguya çevirmiştik (ölçüm olarak
  kusursuzdu: siyah metin 14,65:1) ve aynı ekranda mint logo ile mint düğme yan
  yana geldiğinde imza rengi vurgu olmaktan çıkıyordu.

### Birincil eylem İKİ TEMADA DA çam — sınırı `action-line` taşır

Çam koyu yüzeylerde kayboluyor; düğmeyi dolgusu değil **kenarı** görünür kılar:

| Zemin | Çam dolgu (`action`) | Mint sınır (`action-line`) |
|---|---|---|
| `page` (`#141413`) | **1,31:1** | 14,06:1 |
| `surface` | 1,27:1 | 13,67:1 |
| `surface-2` | 1,18:1 | 12,72:1 |
| `surface-3` | **1,03:1** | 11,11:1 |

Metin beyaz (13,99:1). Çözüm bilinçli olarak dolguyu açmak değil sınır vermek:
dolguyu bir kademe açmak çamdan çıkmak, iki kademe açmak mint dolguya varmak olurdu.

- `action-line` **açık temada dolgunun kendisidir** — görünmez, ama 1 px'lik
  kenarlık iki temada da yazıldığı için düğmenin ölçüsü değişmez.
- `check-contrast.mjs`: `action-line` üç yüzeye karşı **`graphic`** katmanında
  (≥3:1); dolgunun kendisi advisory listede (1,03:1 orada bilinçli bir kayıt).
- Aynı kenarlığı `IconButton--solid` ve `Badge--action.solid` da taşır.
- ⚠ `action-line` **teknik bir yüzeyin rengi değildir.** `CodeBadge` 4.x'te çam
  dolgu + `action-line` sınır + `action-line` "kopyalandı" tiki taşıyordu ve açık
  temada `action-line` = `action` olduğu için tik ile odak halkası dolguyla aynı
  renkteydi (**1:1, görünmüyordu**). 5.0'da `CodeBadge` mürekkep yüzeyde (`shell`).

### Dönüşüm düğmesi — ailenin en parlak yeşili

`cart*` ("sepete ekle") birincil eylemden ton açısıyla değil **aydınlıkla**
ayrışır: birincil **koyu dolgu + açık metin**, dönüşüm **açık dolgu + siyah
metin**.

| | Dolgu | Metin | Birincil eyleme karşı |
|---|---|---|---|
| Açık tema | `#1ba055` | siyah (5,61:1) | 4,17:1 |
| Koyu tema | `#37c971` | siyah (8,82:1) | 6,55:1 |

⚠ **Etkileşim yönü açık temada TERS**: hover **açılır**, active **koyulur**.
Metin siyah olduğu için koyulaşan her kademe metin eşiğini aşağı çeker;
`cart-active` 4,82:1 ile tabanın hemen üstünde.

⚠ **Bu mint dolgu DEĞİL** — "açık yeşil zeminli düğme yok" kuralı logonun rengini
korur; buradaki yeşil olumlu durum ailesinin ekseninde (H 152).

### Mürekkep yüzey — `shell*`, temaya göre DÖNMEZ

Terminal, teknik blok, koyu kod penceresi, `CodeBadge`. İki temada da sıcak
siyah: `shell` / `shell-2` / `shell-3` = `#181715` / `#1f1e1b` / `#2a2925`,
üzerine `on-shell` (`#faf9f5`, 17,00:1), `on-shell-2` (`#b4b1a9`) ve hata metni
için `on-shell-danger` (`#f2a099`, 7,12-8,76:1 — açık temanın `bad-fg`i mürekkep
üzerinde 2:1'in altında kalıyor).

- 4.x'te `shell*` **çamdı** ve "uygulama kabuğu" diye tanımlıydı. Yeşil teknik bir
  yüzeyin zemini değil, eylemin rengi.
- ⚠ Koyu temada kabuk sayfadan 1,03:1 ayrışıyor — görünür kılan `shell-line`.

### Marka şeridi — `band-*`, temaya göre DÖNMEZ

`band-*` iki temada da birebir aynı: çam zemin + kâğıt gövde metni (12,75:1) +
sis ikincil metin (6,46:1) + üçüncü kademe (5,20:1) + `BAND.darkLine` ayırıcı.
Şeridin metinleri **marka ekseninde** kalır (`CORPORATE`, `BAND.fgThree`): çam
üzerinde sıcak gri yazı kirli duruyor.

⚠ Böyle bir yüzeyde `nav-fg-2` **kullanılamaz** — açık temada çam üzerinde
**1,62:1**. Şerit üzerine yazan her şey `band-fg*` kullanır; hover zemini
`band-hover`.

⚠ Tema alt ağaca **kapsamlandırılamaz**: `_tokens.generated.scss` `light`/`dark`
karışımlarını yalnızca `:root`a bağlar. "Bu şeridi koyu temaya sabitle" demek
için `data-hanui-theme`i bir `<div>`e yazmak **çalışmaz**; doğru yol tam olarak
budur — temadan bağımsız bir token ailesi (`band-*`, `shell*`).

### Bağlantı ve odak — yeşil kalan üç yerden ikisi

Bağlantı ve odak halkası 4.x `role` ailesinin yeşil kalan yarısı (`LINK`, H 162).

⚠ **H 162 GÖZLE ÖLÇÜLDÜ.** Rol rengi bir sürüm boyunca H 182'de durdu: ölçüm
olarak temizdi ve düşen şey markaydı — ekranda **camgöbeği** okunuyordu. H 174
hâlâ camgöbeği-teal, H 168 (çamın kendi açısı) yüksek aydınlıkta turkuaz, H 156
olumlu durumla çakışıyor, H 150 mintin kendisi. H 162 dizideki ilk kesin yeşil.

⚠ **Bağlantının alt çizgisi ZORUNLU** (satır içinde): bağlantı gövde metnine
yalnızca **3,04:1** — 1.4.1'in eşiğinin hemen üstü. `TextLink` tek başına
durduğu (oku ve kalınlığı var) için durgunken alt çizgisiz.

⚠ **Odak halkası bağlantı yeşili ve çam OLAMAZ** — birincil düğmenin dolgusuyla
aynı ton. Halka `focus-ring` varsayılan `outline-offset` **+2px** ile sayfanın
üzerinde duruyor: açıkta 4,32-5,18:1, koyuda 9,07-10,03:1.

⚠ **Olumlu durumla karışma ton açısıyla değil BİÇİMLE çözülür.** Durum her zaman
tint zemin + kenarlık taşıyan bir rozet; bağlantı ise metin.

### Durum tintleri

Hepsi **tint zemin + koyu metin + eşleşen hairline**, asla doygun dolgu.

| `tone` | Anlam | Aile |
|---|---|---|
| `success` | Stokta / aracına uyar | olumlu yeşil (H 152) |
| `warning` | Son N adet | amber (H 72) |
| `neutral` | Tükendi | **nötr eksen** (gri, kremden ayrı) |
| `danger` | Aracınıza uymaz | kırmızı (H 25) |
| `oem` | Orijinal OEM | yeşil (H 158) |
| `alt` | Muadil | **menekşe** (H 300) |
| `info` | Nötr bilgi | **nötr mürekkep** (`selected-tint` + `border-strong` + `text`) |

⚠ **Durum zemini yüzeyle karışmaz — kapı var.** Krem yüzeyler (H 80-95) uyarı ve
tehlike ailelerine ton açısıyla çok yakın; 4.x şablonuyla krem kartta (`surface-2`)
uyarı tinti **ΔE 2,0**, tehlike **2,1** veriyordu — sayfa→kart kademesi 4,7.
Zemin şablonu bir kademe aşağı ve doygun (l .928 → .91, s .62 → .8); uyarı 4,8,
tehlike 4,2. Nöbetçi `build-palette.mjs`: her ailenin zemini temasının sayfa /
yüzey / kart üçlüsüne karşı **ΔE×100 ≥ 4** (`MIN_TINT_DELTA_E`).

⚠ **Olumlu zemin şablona İNMEZ** (`ok-bg` `#c2f6cf`): yeşil ton açısında s .8
mint'e yaklaşan bir dolgu üretiyordu ve "Stokta" rozeti imza rengini taşımaya
başlıyordu.

⚠ **`info` artık yeşil değil.** 4.x'te rol tintiydi ve `Alert`in VARSAYILAN tonu
olduğu için yeşili her uyarıya taşıyordu. Anlamı ikon taşır (1.4.1).

⚠ **`alt` menekşe KALDI.** `oem` ile `alt` bir çiftin iki yarısı ("Orijinal" ↔
"Muadil") ve ayrımı taşıyan tek görsel sinyal ton açısı.

⚠ `$danger-solid` ayrıdır: yıkıcı bir **eylem** dolgusu (silme onayı), durum
tinti değil.

⚠ **Yıldız** (`star`, `#846310`) krem kartta metin eşiğini de geçer: 4.x
değeriyle 4,15:1'e düşüyordu, 5.0'da 4,61:1.

### Kategorik palet — `cat-1…5`, `series-1/2`

Grafik serileri, kategori noktaları, lejant kareleri. Beş ton (mavi, kil
turuncusu, yeşil, okra, erik) sabit L/C şablonundan, değişen yalnızca ton açısı.

- Her ton iki temanın üç yüzeyinde **≥3:1** (`check:contrast`, grafik katmanı).
- İki ton arasında **ΔE ≥ 8** (üreteç; en yakın çift 10,5).
- ⚠ **Marka yeşilleri seri rengi OLMAZ.** `series-1` mürekkebin kendisi (açıkta
  `#252523`, koyuda krem); `cat-3` orta aydınlıkta bir kategori yeşili, çam ya da
  mint değil.
- ⚠ `cat-2` kil **turuncusu** (H 42): H 30'da tehlike ailesiyle (H 25) karışıyordu.

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
  ⚠ **KURAL İKİ BİLEŞENDE ÇİĞNENİYORDU ve nöbetçi bunu göremedi** (2026-09-22):
  `Chip` 40px, `Pagination` dar ekranda **36×40**. `__tests__/styles/tap-targets.test.ts`
  ELLE bakılan bir liste ve ikisi listede değildi — yani kural yazılıydı,
  kısmen zorlanıyordu ve aradan geçen iki bileşen sessizce kaldı. İkisi de
  TÜKETİCİDE ölçüldü (`hanparca-frontend`, 390px ve 320px gerçek tarayıcı),
  hanui'nin kendi ızgarasında değil.
  ⚠ Türetilmiş bir kural denendi ve **elendi**: "44px altında sabit yükseklik
  yazan her dosya `tap-target` içermeli" 32 satır işaretliyor ve ezici
  çoğunluğu süs (`Progress` 4px çubuk, `Spinner`, `Steps` 1px bağlayıcı çizgi).
  Liste kalıyor — yeni etkileşimli bileşen oraya da eklenir.
- ⚠ **`--technical` GİRDİ VARYANTI 16px KORUMASINI DÜŞÜRÜYOR.**
  `input-base` ölçüyü bilerek `$font-size-control` (`max(16px, …)`) ile kurar;
  iOS Safari 16px altındaki bir metin girdisine odaklanıldığında sayfayı
  **büyütür ve geri küçültmez**. Varyant bunu `$font-size-base`
  (`clamp(15px, …, 16px)`) ile yeniden yazıyor → dar ekranda **15,03px**
  (ölçüldü: `hanparca` şase sorgulama formu, 17 hane girilen en mobil akış).
  ⚠ **DÜZELTME BU TURDA YAPILMADI ve gerekçesi ölçüldü:** ölçüyü
  `$font-size-control`e çekmek alanı 1px uzatıyor, ızgarada satır yüksekliğini
  büyütüyor ve dar ekran anlık görüntülerinin **40'tan fazlasını** kaydırıyor;
  yineleyen güncelleme yakınsamadı. Bir sürümün bedeli olarak makul, ama
  anlık görüntülerin toplu yenilenmesiyle **birlikte** yapılmalı. Tüketici
  tarafı şimdilik ölçüyü kendisi veriyor (`MaskedInput`).
- **Odak halkası `:focus-visible`**, bağlantı yeşili (`ring-color`), asla kaldırılmaz. `outline: none`
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
1400 ms, `duration-pulse` 1600 ms (`StatusDot` nabzı — 700 ms telaş, 2 sn ölü gibi
okunuyordu; nabız noktayı soluklaştırmaz, etrafında sönen bir HALE çizer). Sürekli dönen bir gösterge bir *geçiş* değil — 320 ms'lik dönüş baş
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

### `Pagination.scrollTo="top"` — kaydırma kodu ÇAĞIRANDA yazılmaz

Sayfa değiştikten sonra başa dönme her tüketicide elle yazılıyordu (ya da hiç
yazılmıyordu: uzun katalog listesinde 2. sayfaya geçen kullanıcı listenin
**dibinde** kalıyordu). Kural artık bileşende: `scrollTo="top"` iki kipte de
(`buildHref` ve `onPageChange`) çalışır.

⚠ **Kaydırma ANİDİR** (`behavior: 'instant'`), yumuşak değil. Yumuşak kaydırma
içerik değişirken sürüyor olur — kullanıcı yeni listeyi hareket hâlinde görür —
ve uzun sayfada tıklama ile üste varış arasında saniyeler geçer. Anî kaydırma
ayrıca `prefers-reduced-motion` sorusunu tamamen ortadan kaldırır.

⚠ **Üç durumda kaydırılmaz:** etkin sayfaya basıldığında (içerik değişmiyor),
yeni sekmede açan tıklamada (Ctrl/Cmd/Shift/orta tuş — mevcut sayfa yerinde
kalmalı) ve `linkProps.onClick` `preventDefault` çağırdığında (gezinme iptal
edilmiş).

⚠ **`linkProps.onClick` DÜŞMEZ:** bileşenin kendi `onClick`i spread'den sonra
yazılıyor, bu yüzden tüketicininki zincirlenerek önce çağrılır.

### ⚠ Bağlantı kipinde OKLAR ölü tuştu

Aynı turda ölçüldü: `buildHref` verildiğinde sayfa numaraları `<a>` oluyordu ama
önceki/sonraki okları `onPageChange` çağıran birer `<button>` olarak kalıyordu —
o kipte `onPageChange` tanımsız olduğu için **tıklama hiçbir şey yapmıyordu**.
Hata yok, log yok; yalnızca çalışmayan iki tuş. Oklar artık numaralarla aynı
kipi izler.

⚠ **Sınırdaki ok bağlantı DEĞİL devre dışı düğmedir** — bir `<a>` devre dışı
bırakılamaz ve `aria-disabled` taşıyan bir bağlantı hâlâ tıklanır.

## Ankrajlı yüzeyler — panel tetikleyicisine bağlı kalır

Açılır her yüzey (`Menu`, `Popover`, `Tooltip`, `Combobox`, `Select`) konumunu
`usePositioning`ten alır; kanca **viewport koordinatı** üretir ve yüzeye
`position: fixed` + `top`/`left` yazar.

⚠ **`position: fixed` TEK BAŞINA "viewport'a göre konumlan" DEMEK DEĞİL.**
`none` olmayan bir `transform`/`translate`/`scale`/`rotate`, bir `filter`,
`backdrop-filter`, `perspective`, `will-change` ya da `contain: paint|layout`
taşıyan **her ata** sabit konumlu torunları için kapsayıcı blok yaratır. Kapsayıcı
blok kayınca kancanın ürettiği koordinatlar atanın sol üstüne göre yorumlanır ve
yüzey **atanın sayfa içindeki konumu kadar kayar**; aynı ata `overflow: hidden`
de taşıyorsa yüzey ayrıca **kırpılır**.

**Kural: ankrajlı yüzey PORTALLANIR.** Tek yol `hooks/usePortalSurface` —
hedef seçimi (`document.body` ya da en yakın açık `<dialog>`) ve üst katman
kararı `helpers/portal.helper.ts`te.

⚠ **`Combobox` ve `Select` bu düzeltmeyi ALMAMIŞTI** ve ikisi de panelini kökün
içinde çiziyordu. Ölçüldü (2026-08-19, chromium 1280×900, `.gallery__stage`
üzerinde `transform: translateZ(0)`):

| yüzey | panelin tetikleyiciden yatay kayması |
|---|---|
| `Menu` / `Popover` / `Tooltip` | 0px (portallanmış) |
| `Combobox` | **46px** |
| `Select` | **46px** |

Kırpan bir ata eklendiğinde (`overflow: hidden`) panel isabet testini de
kaybediyordu — yani görünür sayılıyor ama tıklanamıyordu.

⚠ **PORTALLAMAK DIŞARI-TIKLAMA DENETİMİNİ KIRAR ve kırılma SESSİZDİR.** Panel
artık kökün içinde olmadığı için `rootRef.current.contains(target)` tek başına
panelin **içine** yapılan `mousedown`u "dışarı" sayar: panel, seçeneğin
`onClick`i ateşlenmeden kapanır ve liste açılır ama **hiçbir seçenek
seçilemez**. Denetim iki ref'e birden bakmak zorunda (`Menu` baştan öyle
yapıyordu). Nöbetçi `__tests__/components/Combobox.portal.test.tsx`.

⚠ **Panel genişliği render sırasında DOM'dan okunmaz.** İki bileşen de
`triggerRef.current?.offsetWidth` yazıyordu; render sırasında DOM okumak ilk
render'da `undefined` verir ve değer bir daha **güncellenmez** — pencere yeniden
boyutlandığında panel bayat genişlikte kalır. Ölçüm `usePositioning`in kendi
`ResizeObserver`ında: `PositioningState.anchorWidth`.

### ⚠ Tetikleyici içi süsler — `tap-target` SIRALAMASI üç arıza üretiyordu

`.combobox__clear` `position: absolute` yazıyor, ama `@include tap-target`
ondan **sonra** gelip `position: relative` yazıyordu; aynı özgüllükte son
bildirim kazanır ve `absolute` **ölü** kalıyordu. Dosyayı okuyan kişi doğru
sanıyor — bildirim orada duruyor.

Ölçüldü (2026-08-19, `?solo=Combobox`, `isClearable` + seçili değer):

| ne | beklenen | ölçülen |
|---|---|---|
| `✕` `position` | `absolute` | **`relative`** |
| `.combobox` kök yüksekliği | 48px (tetikleyici) | **73px** |
| `✕` yatay konumu | tetikleyicinin içinde | kökün **36px SOLUNDA** |
| caret dikey kayması | 0px | **12px** |

Zincir tek yönlü ve üç arıza **tek** hatadan doğuyor: düğme akışta kaldı →
tetikleyicinin altına blok olarak dizildi → kök 48'den 73px'e şişti →
`right: 36px` göreli bir öteleme olarak yorumlanıp düğmeyi bileşenin tümüyle
dışına attı → köke çapalı caret'in `top: 50%`i artık tetikleyicinin merkezini
göstermiyor.

**İki düzeltme, iki ayrı gerekçe:**

| ne | nasıl |
|---|---|
| `✕` | `position` artık `@include tap-target`TAN SONRA yazılır. `absolute` de konumlu kutu kurar, `::after` çapası korunur |
| caret | mutlak konum bırakıldı, **düz esnek çocuk** oldu — hizalamayı tetikleyicinin `align-items: center`ı yapar, kapsayıcı bloktan bağımsız. Kardeş `Select` baştan böyleydi ve arızayı hiç taşımadı |

⚠ **Caret esnek akışa girince `--clearable` DOLGUSU DÜŞTÜ.** Eski dolgu
(`$space-3 + $icon-sm + $space-2 + $clear-size + $space-2` = 66px) iki süsün
payını birlikte ayırıyordu; caret artık gerçek yer tuttuğu için o dolgu onu içe
itiyor ve caret sağ kenardan **67px** kopup `✕`in soluna düşüyordu. `✕`in payı
bugün caret'in `margin-inline-start`ıyla açılır.

⚠ **Mixin artık uyarıyor:** `tap-target` `position` yazar, yani çağrı yerinde
**en başta** include edilmeli. Kalan yedi kullanıcı tarandı; sıralama hatası
yalnızca burada vardı.

### Nöbetçiler ve ölçülemeyen boşluk

| nöbetçi | ne tutuyor |
|---|---|
| `__tests__/e2e/anchored-panel.spec.ts` (7) | panelin dönüştürülmüş/kırpan atada kaymaması, caret ve `✕`in tetikleyici içinde kalması, kök yüksekliği == tetikleyici yüksekliği |
| `__tests__/components/Combobox.portal.test.tsx` (7) | panelin kökün DIŞINA çizilmesi; portallanan panelde seçim ve arama kutusunun paneli kapatmaması |

⚠ **`desktop-behavior` PLAYWRIGHT PROJESİ BU TUR AÇILDI ve boşluk yapısaldı.**
Öncesinde davranış ölçen her spec yalnızca `ios` + `android` projelerinde
koşuyordu (tek masaüstü projesi `visual` ekran görüntüsü alıyor) ve
`Combobox`/`Select` dar ekranda **alt sayfa** açıyor. Yani bu iki bileşenin
`popover` dalı — panelin konumlandırıldığı **tek** dal — hiçbir tarayıcı testi
tarafından çalıştırılmıyordu.

⚠ **Görsel nöbetçi arızayı ZATEN GÖRMÜŞTÜ, kimse bakmadı.** Depodaki
`Combobox-light.png` **1232×155**; hatalı kod aynı bölümü **1232×180** çiziyor,
yani taban çizgisi hatadan ÖNCE kaydedilmiş ve `visual.spec.ts` o günden beri
kırmızı. Düzeltme taban çizgisini **bayt bayt** geri getiriyor — güncelleme
gerekmedi. ⚠ `ızgara` testi ilk uyuşmazlıkta durduğu için tek bir bileşen
bildiriyor; arkasında kalan bayat taban çizgileri (`Accordion`, `CopyField`,
`Modal`, `rtl`, `compact`, `forced-colors` ve taban çizgisi **hiç olmayan**
`CodeBadge`) bu turda **kapsam dışı** ve hâlâ kırmızı.

## `@ahmetilhn/hanui/chat` — sohbet bileşenlerinin AYRI girişi (5.2)

**Neden ayrı:** 5.1 tüm girişi bütçenin sınırına taşıdı (42,00 / 42 kB) ve
sohbet bileşenlerinin Hanparça'da çağıranı yok. Ana girişe girselerdi vitrinin
indirdiği paket ve `styles.css` büyürdü. Ayrı girişte ana pakete **sıfır bayt**
eklendi (ölçüldü: ana giriş 42 000 bayt, önce ve sonra).

| Ne | Nerede |
|---|---|
| Kaynak | `src/chat/<Bileşen>/` · cephe `src/chat/index.ts` |
| Derleme | `vite.chat.config.ts` → `build/chat.js`, `chat.cjs`, `chat.css` |
| Tipler | `tsconfig.chat.json` → `build/types/chat/` (dosya başına) |
| Dışa aktarım | `exports["./chat"]`, `exports["./chat.css"]` |
| Bütçe | `chat.js` 8 kB (ölçülen 6,29) · `chat.css` 5 kB (ölçülen 3,90) |
| API taban çizgisi | `scripts/api-baseline.chat.txt` (30 ad) |

⚠ **ANA GİRİŞ DIŞSAL — sohbet kodu onu PAKET ADIYLA alır.** Bir sohbet
dosyası `../../components/…` ya da `../../theme/context` gibi göreli bir yolla
ana girişe uzanırsa o modülün İKİNCİ BİR KOPYASI `chat.js`e paketlenir ve
derleme yine de yeşil biter:
- `theme/context` kopyası → sohbet bileşenleri `HanuiProvider`ın metinlerini
  ve yönlendiricisini GÖRMEZ
- `helpers/focus.helper` kopyası → kipsel yüzey yığını ikiye bölünür, `Escape`
  yanlış yüzeyi kapatır
- bir bileşen kopyası → CSS'i `chat.css`e de girer

Nöbetçi `__tests__/chat/boundary.test.ts`: göreli yolla yalnızca DURUMSUZ
yardımcılar (`cx`, `named`, metin çözümü, tipler, sabitler) ve SCSS alınabilir;
`@/` takma adı da yasak (dosya başına tiplerde çözülmeden kalıyor). Aynı test ana
girişin sohbeti içe aktarmadığını da ölçer. Derlenmiş `chat.js`te
`createContext` SIFIR.

⚠ **Depo içinde paket adı kaynağa eşlenir** (tsconfig `paths`, jest
`moduleNameMapper`, playground `alias`). Paketin kendi adı tüketicide `exports`
üzerinden derlenmiş ana girişe çözülür.

⚠ **Tipler neden `vite-plugin-dts` ile DEĞİL:** toplama adımı girişi
`<outDir>/index.d.ts` diye hesaplıyor ve ortak `build/`da duran ANA girişin
tiplerini toplayıp üzerine yazıyordu (ölçüldü: `chat.d.ts` 176 ana adı
taşıyordu). Dosya başına `tsc` çıktısı bu sorunu taşımaz ve `check:api` sohbet
girişinin cephe dosyasındaki `export { … } from` satırlarını okur.

**Bileşenler** (20; hepsi eksen taramasında, davranışları `__tests__/chat/`):

| Grup | Bileşen | Not |
|---|---|---|
| İskelet | `ChatThread` | Sona yapışık kaydırma, "en yeniye in", alt dok. ⚠ Akan belirteçler OKUNMAZ (`aria-live` yok, `role="log"` değil); yanıt bitince TEK cümle duyurulur (`labels.chat.replyReady`) |
| | `ChatMessage` (`author`) | Kullanıcı balonu `surface-2`; eylemler hover'da VE `:focus-within`de belirginleşir (renkle, `opacity` değil) |
| | `PromptInput` | `Enter` gönderir, `Shift+Enter` satır, IME yazımında `Enter` GÖNDERMEZ; `Escape` akışı durdurur ama açık bir yüzey varken DOKUNMAZ (`hasOpenSurface`). Gönder = çam (ekranın tek PRIMARY'si) |
| | `PromptSuggestions` | EYLEM ızgarası, seçim değil (`ChipGroup` değil) |
| Yanıt | `Prose` | Tipografi kabı; ayrıştırıcı İÇERMEZ (markdown/KaTeX tüketicide) |
| | `CodeBlock` | Vurgulayıcı İÇERMEZ; Shiki çift tema değişkenleri `for-dark` ile; `html` güvenliği ÇAĞIRANIN |
| | `ReasoningBlock` + `ReasoningText` | Tur sürerken açık, bitince kapanır — kullanıcı dokunduysa tercihine DOKUNULMAZ |
| | `ToolCall` + `ToolCallSection` | Durum nokta + OKUNAN metin (`labels.chat.toolStatus`); çalışan nokta NÖTR nabız |
| | `TerminalOutput` | Mürekkep yüzey (`shell*`), sona yapışık; stderr gizli önek taşır (renk tek başına anlam taşımaz) |
| | `SourceList` + `Citation` | Atıfın okunan adı `labels.chat.citation(n)` |
| | `MessageActions` | `role="toolbar"`, ok/`Home`/`End` |
| Uygulama | `AppBar` | Kendi yüksekliğini `--hanui-header-height`e yazar |
| | `ActionList` + `ActionListItem` | `isSelected` verilirse SEÇİM (`aria-pressed`), verilmezse EYLEM; `rowHeight` ile sanal (`aria-posinset`/`aria-setsize`) |
| Veri | `SegmentBar` | Yığılmış (`value`) ya da zaman çizelgesi (`from`/`to`); TEK görsel (`role="img"`), adı tüm parçaları okur |
| | `Legend` · `DescriptionList` | Kategorik palet; `tone` (`color` değil — tek ad kuralı) |

**Plandan sapmalar:** `ChatMessage.role` → `author` (`role` HTML özniteliğiyle
çakışıyordu); `StatusDot`ta `brand` tonu yok (yeşil seyrek); `SegmentBar`
parça başına `Tooltip` yerine tek bir okunan özet (çubuğun içinde sekme durağı
dizmek daha az bilgi verip daha çok tuş istiyordu); `code-bg` / `terminal-*`
token'ları eklenmedi (`surface-inset` ve `shell*` karşılıyor).

## Göç ve `@deprecated` yollar

**Kural:** bir prop adı ya da davranışı değişecekse eski yol **bir sürüm boyunca
çalışmaya devam eder**, `@deprecated` işaretlenir ve buraya yazılır. Sessiz
kırılma yok. Nöbetçi: `__tests__/api-consistency.test.ts` — burada kayıtlı
olmayan bir `@deprecated` prop derlemeyi kırar.

### 5.0 token sözleşmesi — KIRICI, takma ad YOK

Renk token'ları prop değil, ama `--hanui-*` adları tüketicinin sözleşmesi. 5.0
büyük sürüm olduğu için eski adlar **bırakılmadı**: `role*` iki farklı renk
taşıyacaktı ve 4.0.0'da `blue*`/`amber*` adlarının yanlış rengi anlatması tam
olarak bu hataydı.

| 4.x | 5.0 | Not |
|---|---|---|
| `role`, `role-hover`, `role-active` | `selected`, `selected-hover`, `selected-active` | mürekkep — yeşil DEĞİL |
| `on-role` | `on-selected` | koyu temada siyah |
| `role-tint` | `selected-tint` | |
| `role-line` | `selected-line` | |
| `role-text` | `link` (+ yeni `link-hover`) | yeşil kalır |
| `ring`, `ring-color` | aynı ad | değer bağlantı ailesinden |
| `shell*` | aynı ad | **değer çamdan mürekkebe** ve temaya göre dönmüyor; yeni `on-shell`, `on-shell-2`, `on-shell-danger`, `shell-line` |
| — | `cat-1…5`, `series-1/2` | yeni |

Tüketicide değer ezmesi yazan yerler (`--hanui-page: #ffffff` gibi) ayrıca
gözden geçirilir: 5.0'da açık sayfa krem.

### 5.1 — `CommandPalette` komutu KAPANDIKTAN SONRA çalıştırır

API değişmedi, çağrı SIRASI değişti: `onSelect` artık palet kapanıp odak açan
öğeye geri verildikten **sonra** çağrılır. Önce çağrıldığında komutun açtığı
pencere, paletin odak iadesiyle odağını kaybediyordu; tüketici bunu
`requestAnimationFrame(() => setTimeout(fn, 0))` ile atlatıyordu — o geçici
çözüm artık gereksiz ve kaldırılabilir. Kapanış sırası zorunlu: önce `<dialog>`
kapanır (açık kipsel pencerenin dışındaki öğe odak alamaz), sonra odak döner,
sonra komut çalışır. Nöbetçi `__tests__/components/CommandPalette.test.tsx`.

Yeni `hotkey` (`'mod+k'`) + `onOpen`: kısayol kapalıyken açar, açıkken kapatır,
başka bir kipsel yüzey açıkken dokunmaz (`hasOpenSurface`).

### Sohbet planından BEKLEYEN altyapı maddesi — SCSS API (`exports["./scss"]`)

Plan, tüketicinin `@use '@ahmetilhn/hanui/scss'` ile token değişkenlerini ve
mixin'leri almasını öneriyordu (hanration bunları kopyalamış ve değerler kaymış:
`$tablet-breakpoint: 760px`, hanui'de 768 / 1024). **Bu turda yapılmadı:** SCSS
kaynaklarının pakete girmesi (`files: ["build"]`) ve Next'in Sass çözücüsünün
paket `exports`'unu hangi koşulla okuduğu (webpack `sass` koşulu, Turbopack)
tüketicide doğrulanmadan yayınlanırsa kırılma YAYINDAN SONRA görünür. Doğru
sıra: hanration'da yerel paketle (`npm pack`) bir `@use` denemesi, sonra ihraç.

### 5.1 — Faz 1 eklemeleri (yalnızca ekleme, kırıcı değil)

| Bileşen | Ekleme |
|---|---|
| `Modal` | `size="xl"` (≈1040 px) |
| `Button` | `size={UISize.XSMALL}` (görsel 30 px; `tap-target` 44 px kalır) + `shape="pill"` |
| `IconButton` | `shape="round"` |
| `Textarea` | `variant="bare"` — çerçeve ve odak göstergesi KAPSAYICININ (`:focus-within`) |
| `Progress` | `size="xs"` (2 px) |
| `CodeBadge` | `onClick` / `href` ile etkileşimli kod (+ `label`), `size="xs"` |
| `Avatar` | `icon` yuvası, `shape="rounded"`, `tone="brand"` (marka madalyonu — yeşil ayak izi listesinde) |
| `Stat` | `variant="inline"` — etiket ve değer tek satır, değer teknik fontta |
| `ScrollArea` | `isFollowingEnd` |
| `Accordion` | iç yapı `Disclosure`; API aynı |

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

### `Carousel.itemMinWidth` → `itemWidth` — şerit artık kart GERMİYOR

Ad davranışla birlikte değişti. Şerit `grid-auto-columns: minmax(item, 1fr)`
yazıyordu ve o `1fr` **yalnızca şerit dolmadığında** devreye giriyor: kart
sayısı görünümü doldurmuyorsa sütunlar boş alanı paylaşıp genişliyordu.
Ölçülen sonuç iki kartlık bir şeritte **biri başta, biri tam ortada** —
kartın kendi genişliği sabitse (tüketiciler öyle yazıyor) aradaki fark boşluk
olarak görünüyor, kart genişliği serbestse bu sefer kartlar absürt geniş
çiziliyordu. İki durumda da "şerit" izlenimi kayboluyordu.

Sütun genişliği artık **sabit** ve dolmayan şerit `justify-content: start` ile
başa yaslanıyor. `itemMinWidth` bir sürüm daha çalışır (`itemWidth` verilirse
o kazanır), ama adı artık yalan: değer asgari değil, kartın genişliğinin
kendisi.

⚠ **Duyarlı genişlik prop'tan GELMEZ.** Sayı tek bir kırılma noktası
anlatabilir; kart genişliği ise mobilde ayrı, masaüstünde ayrıdır. Inline
yazılan değer bu yüzden `--hanui-carousel-item-default` adını taşıyor ve
tüketici kendi medya sorgusundan `--hanui-carousel-item` ile eziyor — inline
stil bir sınıf kuralına yenilmediği için tek isim kullanılsaydı ezme
**imkânsız** olurdu. "Yarım kart görünsün" gibi ölçüler de aynı kapıdan:
`--hanui-carousel-item: max(232px, calc((100% - 4.3 * 16px) / 4.3))`.

Nöbetçi: `__tests__/components/Carousel.track.test.ts` — `fr` biriminin ya da
`minmax(`in geri gelmesi ve ezme zincirinin düşmesi ayrı ayrı kırar.

## Kod düzeni ve tasarım prensipleri — ZORUNLU

**Bundan sonraki her geliştirme bu prensiplere uyar; kurallar aşağıdaki
otomatik denetçilerle zorlanır** — `npm run verify` zinciri: `tokens` →
`check:contrast` → `typecheck` → `lint` → `test:coverage` (satır ≥ 80) →
`build` → **`check:api`** → `check:animations` → `size-limit`.

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
aktarım kümesi taşımadan önce ve sonra **birebir aynı**.
`src/index.ts` bir cephedir; tip gövdeleri nerede yaşarsa yaşasın tüketici
(`hanparca-frontend`, `hanparca-admin`) aynı adları aynı yerden alır.

### `src/index.ts`teki her ad bir SÜRÜM TAAHHÜDÜDÜR — `check:api` bunu ölçer

Ölçüm artık elle değil: `scripts/check-api.mjs` `build/index.d.ts`ten dışa
aktarım adlarını çıkarır ve `scripts/api-baseline.txt` ile karşılaştırır
(**167 ad**). Kapı `verify` içinde, `build`ten hemen sonra.

```bash
npm run check:api               # doğrula
node scripts/check-api.mjs --update   # taban çizgisini BİLİNÇLİ tazele
```

⚠ **Eski elle ölçüm yanlış sayıyordu.** CLAUDE.md'de kayıtlı komut
`grep -oE 'export (type )?\{[^}]*\}'` idi; vite-plugin-dts her bildirimi tek tek
`export declare …` olarak yazıyor ve dosyanın sonunda yalnızca **boş** bir
`export { }` bırakıyor. Yani o komut ne değişirse değişsin **tek satır**
(`export { }`) döndürüyordu: küme hiç ölçülmüyordu ama ölçülüyor sanılıyordu.
Betiğin deseni `export declare (const|type|function|class|interface|enum) Ad`
ve **sıfır eşleşmede açıkça düşer** — ölçemediği şeyi yeşil geçmez.

**Tip taşımalarında diff ZORUNLU.** Tüketiciler hanui'yi **caret** ile alıyor
(`hanparca-frontend` ve hanration `^4.1.0`), yani küçük sürümde düşen bir ad
bir sonraki `npm install`da, sebebi çoktan unutulmuşken derleme hatası üretir.
Taban çizgisi bu yüzden repoda duruyor. (Bu satır bir dönem "iki tüketici de
`2.4.0` ile tam pinli" diyordu; artık doğru değil.)

**Bu turda taşınan iki tip** ve neden kırıcı olmadıkları:

| Tip | Önce | Sonra | Neden güvenli |
|---|---|---|---|
| `Formatter<TArgs>` | `helpers/label.helper.ts` **ve** `types/theme.type.ts` — birebir aynı imza, iki bildirim | tek bildirim `types/theme.type.ts`te | `index.ts`ten **dışa verilmiyor**; `.d.ts`te zaten tek `declare type` olarak görünüyordu |
| `ListboxNavigation` | `hooks/useListboxNavigation.ts` (kardeşleri `types/hook.type.ts`te) | gövde `types/hook.type.ts`te, **hook yeniden ihraç ediyor** | `Combobox` deseninin aynısı: `src/index.ts` **değişmedi**, ad aynı yoldan geliyor |

**5.1'de açılan adlar — her birinin kütüphane dışında çağıranı var:**

| Ad | Neden dışa açık | Çağıran |
|---|---|---|
| `useHanuiTokens` | Çizim kütüphaneleri (recharts) `stroke`/`fill` için `var(--…)` okuyamıyor; çözülmüş değer gerekiyor ve tema değişince yenilenmeli | hanration `MetricsPanel` (kendi `useCssVars` kopyasıyla yapıyordu) |
| `HanuiThemeScript` | Tema ilk boyamadan ÖNCE yazılmalı; iki tüketici aynı betiği elle yazıyordu. ⚠ BİLEŞEN, fonksiyon değil: paket `'use client'` taşıdığı için dışa verilen düz bir fonksiyon Next'in sunucu bileşeninde çağrılamıyor (ölçüldü: `next build` "Attempted to call themeBootScript() from the server" ile kırıldı). Bileşen sunucuda da çizilir | hanration `layout.tsx` (`THEME_BOOT_SCRIPT`) |
| `hasOpenSurface` | Sayfa düzeyinde `Escape` dinleyen kod önce açık bir yüzey olup olmadığını sormalı; sormayan, modalı kapatan tuşla arkadaki akışı da durduruyordu | hanration `Composer` |
| `Disclosure` (+ `DisclosureVariant`) | Tek başına açılır bölüm; aynı kalıp hanration'da üç kez elle yazılmıştı | hanration `Disclosure`, `ProcessBlock`, `ToolCallCard` |
| `StatusDot` (+ `StatusDotTone`) | Adı olan durum noktası; dört yerde elle çiziliyordu ve hiçbiri durumu okutmuyordu | hanration `Header`, `LiveStatusBar`, `ToolCallCard`, `EventsPanel` |
| `Kbd` | Klavye kısayolu; `CommandPalette`in kısayolu da artık bunu kullanıyor | hanration `Composer` ipucu satırı |
| `useStickToBottom` | Kaydırma kutusunu sona yapışık tutar, kullanıcı yukarı kaydırınca bırakır; `ScrollArea isFollowingEnd` de bunu kullanır | hanration `ChatView` (kendi kopyası vardı) |

⚠ **Paket bütçesi SINIRDA (2026-10-10):** 5.1'in eklemeleri tüm girişi 40,17 →
**42,00 kB** taşıdı (bütçe 42 kB) ve `styles.css`i 23,07 / 24 kB'a. Sohbet
bileşenleri bu yüzden ana girişe GİRMEZ, ayrı `chat` girişine gider — plan bunu
"Hanparça'nın bütçesi büyümesin" diye öneriyordu, ölçüm artık zorunlu kılıyor.

⚠ Sohbet planı `hasOpenSurface` yerine bir **kanca** (`useIsModalOpen`) öneriyordu.
Çağıranın ihtiyacı reaktif bir durum değil, tuşa basıldığı ANDAKİ tek bir soru;
kanca her yüzey açılıp kapandığında çağıranı yeniden çizdirirdi (KISS). Yığının
kendisi (`pushModal` / `isTopModal`) iç API olarak kalır.

**İç kancalar `src/index.ts`e EKLENMEZ.** Bu turda açılan `useDismissOnEscape`
ve `useAsyncSearch` dışa verilmedi — her ihraç bir sürüm taahhüdüdür ve
ikisinin de kütüphane dışında çağıranı yok (YAGNI).

⚠ **14 CSS varyant union'ı enum dönüşümünden KALICI MUAF.** `AlertTone`,
`BadgeTone`, `BadgeVariant`, `ChipSize`, `CardMediaFit`, `ConfirmKind`,
`IconButtonVariant`, `ModalTone`, `StatTrend`, `TimelineStatus`, `ToastTone`,
`PositionSide`, `PositionAlign`, `HanuiDensity`, `HanuiColorScheme` —
hepsi `className` besliyor ve tüketiciler düz dize geçiyor
(`<Badge tone="success">`). Enum'a çevirmek o çağrıları **derlenmez** yapardı:
`TS2322` ile, üstelik iki uygulamada onlarca yerde. Monorepodaki "tel değeri
olan union → enum" kuralı **backend'i aynalayan** değerler içindir; bunların
telde karşılığı yok, CSS sınıf adı sonekleri.

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

**Bu turda uygulanan modern dizi yolları** — kütüphane daha önce hiçbirini
kullanmıyordu:

| Yer | Ne | Neden |
|---|---|---|
| `helpers/focus.helper.ts` `isTopModal` | `.at(-1)` | Yığının tepesi; karşılaştırma, dar tip gerekmiyor |
| `TagInput` Backspace dalı | `.at(-1)` | `values.length > 0` guard'ı doğal olarak `!== undefined`a dönüştü |
| `Toast` Escape dalı | `.at(-1)` | Kanca çıkarımı zaten `useCallback` istiyordu |

⚠ **`.at(-1)` HER YERE uygulanmadı ve sebebi tsconfig'de.**
`noUncheckedIndexedAccess: false` olduğu için `dizi[dizi.length - 1]` **dar**
tip döner (`number`), `dizi.at(-1)` ise imzası gereği `number | undefined`.
Yani `Menu:82,155` ve `Avatar:29` gibi **zaten korunmuş** çağrı yerlerinde
dönüşüm bir okunurluk kazancı değil, `?? …` / `!` gürültüsü üretiyordu
(`Menu`de liste boşken menü hiç açılmıyor, `Avatar`da `words.length === 0`
erken dönüyor). Uygulanmayan yer bir eksiklik değil ölçülmüş karar.

⚠ **`Pagination:63` `toSorted`a ÇEVRİLMEDİ.** İfade `[...pages].sort(cmp)` ve
`pages` bir `Set` — spread zaten **taze bir dizi** üretiyor, yani ortada
mutasyon riski yok. `toSorted` eklemek ikinci bir kopya ayırmak olurdu:
immutability kazancı sıfır, allokasyon iki katı.

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
**Stylelint** → **TAM test süiti**. Ölçüldü (2026-10-10): süit 3,9 sn (53 dosya /
542 test). `package.json`daki `prepare` betiği `core.hooksPath`i
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
