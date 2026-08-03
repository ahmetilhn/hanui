# Tüketici geçiş planı — `hanparca-frontend` · `hanparca-admin`

Bu belge, iki uygulamada **elle yazılmış olup kütüphanede karşılığı bulunan**
her şeyin envanteri ve geçiş sırası. Ölçümler 64 bileşenlik hanui sürümüne
göre; sayılar gerçek dosyalardan sayıldı.

> **hanui `2.0.0` YAYIMLANDI.** Her iki uygulama hâlâ `^1.1.1` çekiyor;
> ilk iş bağımlılığı `^2.0.0`a çıkarmak.
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

| İş | Nerede | Not |
| --- | --- | --- |
| `@ahmetilhn/hanui` → `^2.0.0` | iki repo | **Hazır** — yayımlandı |
| `react-hot-toast` **kaldır** | iki repo | Aşama 2 ile birlikte, tek commit'te |
| `hooks/useSheetViewport.ts` **sil** | frontend | `BottomSheet` zaten kendi içinde çağırıyor |
| `helpers/focus.helper.ts` **sil** | frontend | `preventAutoKeyboard` + `isKeyboardOpeningElement` dışa veriliyor |
| `hooks/useTheme.ts` → `useHanuiTheme` | iki repo | Yeni `preference` alanı üç durumlu anahtarı da mümkün kılıyor |
| `styles/_variables.scss` → hanui token'ları | iki repo | Ölçüler artık CSS değişkeni; **`--hanparca-*` prefix'li kopya ölçüler silinebilir** |

**Kazanç:** ~2 400 satır kopya kodun kaldırılması ve iki uygulamanın aynı
token zincirinden beslenmesi.

---

## 2. Aşama — bildirim (tek commit, iki repo)

`react-hot-toast` → hanui `toast` + `ToastHub`.

```diff
- import toast from 'react-hot-toast';
+ import { toast } from '@ahmetilhn/hanui';

- toast.success('Adres kaydedildi');
+ toast.success('Adres kaydedildi');   // çağrı yeri AYNI
```

- `components/Toast/` (iki repo) **silinir**; yerine kök yerleşimde tek
  `<ToastHub />`.
- Çağrı yerleri neredeyse birebir: `toast.success` / `toast.error` aynı imza.
  `toast.custom` kullanan yerler `toast.show(message, { description, action })`
  ile yeniden yazılır.
- **Neden:** goober özgüllük hatası — aynı bildirim geliştirmede ve üretimde
  iki farklı renkte çıkıyordu. Sarmalayıcı bunu çözmez, erteler.

---

## 3. Aşama — birebir karşılığı olan bileşenler

### `hanparca-frontend`

| Uygulamadaki | Yerine | Kazanç |
| --- | --- | --- |
| `FilterToolbar` (438 satır, elle `<dialog>`) | `Drawer` + `Accordion` | Odak yığını, sayaçlı kilit, çıkış animasyonu, RTL |
| `CheckoutSteps` (80) | `Steps` | Üç durum üç işaretle; ekran okuyucuya durum metni |
| `Pagination` (66) | `Pagination` | `<Link>` sözleşmesi + kısaltma deseni zaten var |
| `ProductCarousel` | `Carousel` | Yerel `scroll-snap`, klavye, nokta göstergesi |
| `AccountSidebar` (elle `<dialog>`) | `Drawer side="start"` | |
| `ProductGallery` (elle `<dialog>`) | `Modal size="lg"` | |
| `ErrorRecovery` | `EmptyState tone="error"` | "Boş" ile "yüklenemedi" ayrımı kodlu |
| 28 dosyadaki elle iskeletler | `SkeletonCard` · `SkeletonRows` | Ölçü gerçek bileşenden → CLS yok |
| `AppliedFilters` | `ChipGroup isMultiple` | |
| `SavedAddressPicker` | `RadioCard` | |
| `SpecTable` · `OemList` · `FitmentTable` | `Table` / `DataTable` | Sıralama + `aria-sort` + yapışkan sütun |
| `VehicleSelector` | `Select` / `Combobox` | Alt sayfa davranışı hazır |
| `AskAiBox` | `CommandPalette` | Aksan duyarsız arama, APG klavye |

### `hanparca-admin`

| Uygulamadaki | Yerine | Kazanç |
| --- | --- | --- |
| `Sidebar` (elle `<dialog>`) | `Drawer side="start"` | |
| `CrawlerJobDialog` | `Modal` + `Steps` | |
| `ReferenceSelect` (108) | `Combobox` | Sanallaştırma ve çoklu seçim geldiğinde bedava |
| `DashboardContainer` sayaçları | `Stat` ızgarası | Yön/renk/metin üçlüsü |
| `ResourceListContainer` tabloları | `DataTable` (sıralama + toplu şerit) | `aria-sort`, yapışkan ilk sütun |
| `OrderDetailContainer` durum geçmişi | `Timeline` | `failed` durumu birinci sınıf |
| `ModerationContainer` / `ReturnDecision` | `EmptyState tone` + `ConfirmDialog` | |
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
