# Göç rehberi

Kırıcı değişiklikler ve `@deprecated` işaretli yollar burada kayıtlı.

**Kural:** bir prop adı ya da davranışı değişecekse eski yol **bir sürüm
boyunca çalışmaya devam eder**, `@deprecated` işaretlenir ve buraya yazılır.
Sessiz kırılma yok.

---

## Yayımlanmamış

### `DataTable` kaydırma kabı artık konumlanmış

`.wrapper` `position: relative` aldı. **Tüketici tarafında değişiklik
gerekmiyor.**

**Neden:** `overflow` yalnızca kendi kapsayıcı bloğundaki mutlak konumlanmış
torunları kırpar. Kap konumlanmamışken `srLabel` ile çizilen görünmez sütun
başlığı kırpılmıyor ve **sayfayı yana kaydırıyordu** — ölçüldü, 390 px'lik bir
ekranda `scrollWidth` 503 (+113 px). Yalnızca `hasViewportCap` verilmeyen
tablolarda görülüyordu: sınırlı olanlar yapışkan `thead th` sayesinde
tesadüfen bağışıktı.

Bu hatayı çağrı tarafında geçici bir sarmalayıcıyla kapatan varsa artık
kaldırabilir.

### `PageHeader` `breadcrumb` yuvası içeriği kadar

Yuva bir `<div>` içine alındı ve `align-self: flex-start` taşıyor. `Breadcrumb`
için görünüm aynı. Yuvaya **başka bir şey** koyanlar (bir "Geri" düğmesi)
öğenin artık gerilmediğini görür — eskiden başlık genişliğine yayılıp metni
ortalanıyordu.

### `DateRange` özeti `FilterBar` sıralamasına girdi

`isSummaryVisible` özeti ve hata satırı artık `--hanui-field-message-order`
okuyor. Şerit dışında değişiklik yok.

**Neden:** `Field`in ipucu için yapılan düzeltme özeti kapsamıyordu; şeritte
"Uygula" düğmesi tarih girdilerinden 26 px aşağıda kalıyordu.

### `Panel` dip şeridi `PanelForm`un sütununu izliyor

Panelde bir `PanelForm` varsa `footer` içeriği artık aynı sütunda biter.
**Tüketici tarafında değişiklik gerekmiyor**; `PanelForm` kullanmayan panelde
davranış aynı (şeridin sağına yaslı).

Şeridin içine bir sarmalayıcı `<div>` eklendi. Dip şeridinin **doğrudan
çocuklarına** tutunan bir seçici (`.my-panel [class*="panel__footer"] > button`)
varsa artık bir kademe daha derinde.

**Neden:** ölçüldü — form 97-662 px arasında dururken kaydet düğmesi 1238
px'te, gönderdiği formdan 576 px uzakta çiziliyordu.

### `Stat` yeni: `variant="plain"`

Yeni ve **isteğe bağlı**; varsayılan `card` bugünkü görünüm.

```diff
  .hero__stats {
-   --hanui-surface: transparent;   /* dolgu görünmez ama YER KAPLIYOR */
  }
- <Stat label="yedek parça" value="33.358" />
+ <Stat variant="plain" label="yedek parça" value="33.358" />
```

`plain` zemini, kenarlığı **ve dolguyu** birlikte kaldırır. Yüzeyi
`transparent`a çevirmek yalnızca ilk ikisini görünmez yapıyor, dolgu yer
kaplamaya devam ediyordu: ölçüldü, telefonda 2×2 ızgarada satır arası 48 px
boşluğa çıkıyor ve dört sayı tek bir grup gibi okunmuyordu. Ayrıca
`--hanui-surface` ezmesi o kapsayıcıdaki **her** hanui yüzeyini birden
düzleştiriyor.

### Pasif düğme etiketi okunabilir — yeni token `on-action-soft`

Görünüm değişti: `Button variant="primary"` ve `IconButton variant="solid"`
pasifken etiket beyaz değil `on-action-soft` (açıkta `n700`, koyuda `n300`).
Dolgu aynı. **Tüketici tarafında değişiklik gerekmiyor.**

**Neden:** ölçüldü — beyaz etiket pasif dolgu üzerinde açık temada **1,55:1**,
koyuda 1,93:1. WCAG pasif denetimleri muaf tutuyor, yani ihlal değildi; çift bu
yüzden kontrast denetçisinin listesinde de yoktu. Artık listede ve **zorunlu**
(bkz. `docs/A11Y.md`). Kendi temasını yazan tüketici `action-soft`u
değiştiriyorsa `on-action-soft`u da vermeli, yoksa derleme kırılır.

### `IconButton` · `Chip` · `CopyField` native `title` YAZMIYOR

Üçü de `label`ı hem `aria-label`a hem `title`a koyuyordu. `title` artık
yazılmıyor; `aria-label` aynen duruyor, yani erişilebilir ad **değişmedi**.

```diff
- <IconButton icon={<EyeFill />} label="Şifreyi göster" />
- {/* DOM: title="Şifreyi göster" aria-label="Şifreyi göster" */}
+ <Tooltip content="Şifreyi göster">
+   <IconButton icon={<EyeFill />} label="Şifreyi göster" />
+ </Tooltip>
```

**Neden:** tarayıcının `title` balonu **dokunmatikte hiç görünmez** — trafiğin
ağırlığı mobil olan bir arayüzde "üzerine gelince açıklama çıkar" demek,
kullanıcıların çoğu için açıklamanın hiç olmaması demekti. Klavyeyle gelen
kullanıcıda gecikmeli çıkar, biçimi işletim sistemine bağlıdır ve bazı ekran
okuyucular `aria-label` ile birlikte adı **iki kez** okur. Kütüphanenin kendi
`Tooltip` belgesi bunu zaten yazıyordu; bileşenler ona uymuyordu.

Görünür bir açıklama isteyen çağıran `Tooltip` kullanır — balon dokunmatikte
uzun basmayla da açılır. Yine de `title` isteyen `IconButton`a `...rest` ile
geçirebilir.

### `Badge` nötr tonu kapsayıcıdan yeniden bağlanabilir

Yeni ve **isteğe bağlı**: `--hanui-badge-bg` · `--hanui-badge-fg` ·
`--hanui-badge-line`. Tanımlanmadıklarında bugünkü tint çizilir, yani hiçbir
çağıran yerde görünüm değişmez. Koyu bir gezinme bandının içindeki rozeti
oraya taşımak için (bkz. THEMING.md "Koyu bandın üzerindeki bileşen"):

```diff
  .rail__badge {
-   --hanui-surface-2: #{$rail-hover};
-   --hanui-text-2: #{$rail-fg-2};
-   --hanui-border: #{$rail-line};
+   --hanui-badge-bg: #{$rail-hover};
+   --hanui-badge-fg: #{$rail-fg-2};
+   --hanui-badge-line: #{$rail-line};
  }
```

Genel üçlü nötr rozette **hiçbir zaman** çalışmıyordu: nötr ton `tint(neutral)`
ile ayrı bir aileden (`off-*`) geliyor. Yukarıdaki ezme sessizce düşüyordu.

### `FilterBar` içindeki `Field`: mesaj denetimin üstünde

Şeritte sıra artık etiket → ipucu/hata → denetim. Şerit dışındaki `Field`
değişmedi. **DOM sırası ve `aria-describedby` bağı aynı**; yer değiştiren
öğeler odaklanabilir değil, yalnızca metin.

**Neden:** şerit denetimleri alt kenardan hizalıyor ve denetimin altına yazılan
metin alanın alt kenarını kaydırıyordu — yan yana duran iki girdi 24 px kaçık
çiziliyor, etiketleri de ayrı hizaya düşüyordu.

### `ConfirmDialog.kind` → `ConfirmDialog.variant`

```diff
- <ConfirmDialog kind="destructive" …>
+ <ConfirmDialog variant="destructive" …>
```

**Eski prop çalışmaya devam ediyor**; `variant` verilmediğinde okunuyor. Bir
sonraki büyük sürümde kalkacak.

**Ad neden değişti:** aynı işi yapan üçüncü bir ad kütüphanede zaten `variant`
olarak duruyordu (`Button`, `Badge`, `IconButton`) ve tüketici her bileşende
hangisinin geçerli olduğunu hatırlamak zorunda kalıyordu. Tutarsızlığı
`src/__tests__/api-consistency.test.ts` buldu — elle gözden geçirme değil.

---

## 2.0.0

### `Tooltip.position` → `Tooltip.side`

```diff
- <Tooltip content="…" position="bottom">
+ <Tooltip content="…" side="bottom">
```

**Eski prop çalışmaya devam ediyor**; `side` verilmediğinde okunuyor. Bir
sonraki büyük sürümde kalkacak.

**Ad neden değişti:** davranış değişti. `position` SABİT bir kenar yazıyordu
ve balon oraya sığmadığında görünüm alanının dışına taşıyordu. `side` yalnızca
bir TERCİH — yer yoksa karşıt kenara düşülüyor (`usePositioning`). Aynı adı
korumak, artık doğru olmayan bir sözü sürdürmek olurdu. Ayrıca `side` iki değer
değil dört alıyor (`top` · `bottom` · `left` · `right`).

### `Tooltip` balonu artık `document.body` altında

Balon portal ile gövdeye taşındı. Balona **dışarıdan** tutunan bir seçici
(`.my-card .hanui-bubble…`) varsa artık eşleşmez; `role="tooltip"` ya da
`@layer` dışı bir global kural kullanın.

**Neden:** balon tetikleyicinin içindeyken `overflow: hidden` taşıyan her
kapsayıcıda (kart, tablo hücresi, `Panel`) kırpılıyordu — bir tablo hücresinde
ipucu hiç görünmüyordu.

### `useHanuiTheme` dönüşüne `preference` eklendi

Kaldırılan alan yok; `scheme` hâlâ **çözülmüş** temayı döndürüyor. Üç durumlu
bir tema anahtarı kuruyorsanız `preference` okuyun:

```diff
- const { scheme, toggle } = useHanuiTheme();
+ const { scheme, preference, setScheme } = useHanuiTheme();
+ // setScheme('system') açık seçimi siler.
```

### `@layer hanui`

Kütüphane CSS'inin tamamı bir katmana alındı. Katmanlı kural, katmansız
kurala her zaman yenilir: kütüphaneyi ezmek için yazdığınız `!important` ve
şişirilmiş özgüllük artık **gereksiz**. Eskiden çalışan ezmeler çalışmaya
devam eder — bu yönde bir kırılma yok.

### Ölçüler CSS değişkeni oldu

`radius-*`, `space-*`, `font-size-*`, `leading-*`, `icon-*`, `duration-*`,
`ease-*` artık `var(--hanui-…)`. **Tüketici tarafında değişiklik gerekmiyor**;
kütüphane SCSS'ini fork etmiş bir tüketici varsa aritmetiğin `calc()`e taşınmış
olması gerekir (bkz. README "Token katmanları").
