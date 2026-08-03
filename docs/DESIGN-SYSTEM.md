# Tasarım sistemi

Öğe kataloğu ve **hangi durumda hangi bileşen**. Bu belgenin asıl işi ikincisi:
görsel olarak benzeyen iki bileşen arasındaki ayrım, ikisini de yanlış yerde
kullanmayı engelleyen tek şey.

## Hangisi, ne zaman

| Soru | Cevap | Ayrımın nedeni |
| --- | --- | --- |
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

## Yüzey ailesi

| Bileşen | Bağlam | Yükseklik |
| --- | --- | --- |
| `Tile` | Gezinme | `raised` |
| `Card` | İçerik | `card` |
| `Panel` | Form / veri | `card` |
| `Popover` · `Menu` · `Tooltip` | Geçici katman | `overlay` |
| `Modal` · `Drawer` · `BottomSheet` | Kipsel | `modal` |

Merdivenin tanımı `_mixins.scss` → `elevation()`. Beş gölge token'ı vardı ama
"hangi yüzey hangisini kullanır" yazılı değildi; aynı kademedeki iki yüzey
farklı gölge taşıyordu.

**Koyu temada derinlik gölgeyle değil kenarlıkla** kurulur — koyu zeminde
gölge okunmuyor.

## Yarıçap ritmi

**İç yarıçap = dış yarıçap − dolgu** (`nested-radius()`). İç içe iki yüzey aynı
yarıçapı paylaşmaz: `Panel` (12 px) içindeki bir `Input` da 12 px taşıdığında
iki eğri eş merkezli olmuyor ve iç kutu optik olarak kaçık duruyor.

## Durum katmanları

Tek kural kümesi (`interactive-surface()`):

- **hover** — zemin BİR kademe değişir, başka hiçbir şey
- **active** — 1 px basılır (dokunsal geri bildirim, renk değil)
- **selected** — kenarlık + zemin BİRLİKTE (`selected-surface()`)

Ölçüldü: hover geri bildirimi 28 bileşen dosyasında **altı farklı özellik
yolundan** veriliyordu — `background-color` (30), `color` (18),
`border-color` (16), `transform` (7), `box-shadow` (3), `opacity` (2). Aynı
jest iki bileşende iki farklı şey yapıyordu.

`opacity` ile soluklaştırma **yasak**: metni de soluklaştırıp kontrast eşiğini
sessizce düşürüyordu.

## Renk kararları

- **Amber yalnızca dönüşüm eylemi** (`UIVariant.CART`) — ekrandaki tek doygun
  turuncu.
- **Doygun dolgu = tıklanabilir.** Durum etiketleri her zaman `@include tint()`.
- **Birincil eylem grafittir**, amber değil: her dolu düğmeyi amber yapmak
  dönüşüm noktasının tekilliğini yok ediyordu.
- **Bir ekranda tek `PRIMARY`.**
- **Mavi gezinme ve keşif**: bağlantı, etkin filtre, odak halkası.

## Tipografi rolleri

| Rol | Kademe | Not |
| --- | --- | --- |
| Sayfa başlığı | `page-title` | Akışkan: 640-1360 px arası kademesiz |
| Bölüm başlığı | `heading(xl)` | |
| Panel başlığı | `heading(base)` | 19 px altı → arayüz fontu |
| Gövde | `font-size-base` | |
| Arayüz metni | `font-size-sm` | Düğme, etiket, tablo |
| Yardım metni | `font-size-xs` | |
| Overline | `font-size-2xs` | Büyük harf + `tracking-wide` |

`heading()` punto değil **kademe adı** alır: puntolar çalışma zamanında
ezilebilir ve "19 px eşiği" sabit bir sayı olarak anlamını yitiriyor.

## Ayrıntı

- Erişilebilirlik → [`A11Y.md`](./A11Y.md)
- Hareket → [`MOTION.md`](./MOTION.md)
- Marka uyarlama → [`THEMING.md`](./THEMING.md)
- Göç → [`MIGRATION.md`](./MIGRATION.md)
- Tüketici geçiş planı → [`CONSUMER-ADOPTION.md`](./CONSUMER-ADOPTION.md)
