# Değişiklik günlüğü

Biçim [Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) esaslı; sürümleme
[SemVer](https://semver.org/lang/tr/). Sürüm yükseltme ve yayın kararı
kullanıcınındır — bu dosya neyin değiştiğini, **neden** değiştiğini ve tüketici
tarafında ne gerektirdiğini kaydeder.

## [Yayımlanmamış]

### Faz 5 — görsel dil · Faz 6 — belge ve DX

#### Faz 5

- **Yükseklik merdiveni yazıldı** (`elevation()`): `flat` · `raised` · `card` ·
  `overlay` · `modal`. Beş gölge token'ı vardı ama "hangi yüzey hangisini
  kullanır" **yazılı değildi**; aynı kademedeki iki yüzey farklı gölge taşıyor,
  göz hangisinin daha yukarıda olduğunu okuyamıyordu.
- **Yarıçap ritmi** (`nested-radius()`): iç yarıçap = dış yarıçap − dolgu.
  `Panel` (12 px) içindeki bir `Input` da 12 px taşıdığında iki eğri eş
  merkezli olmuyor ve iç kutu optik olarak kaçık duruyordu.
- **Durum katmanları tek kural kümesine alındı** (`interactive-surface()`,
  `selected-surface()`). ÖLÇÜLDÜ: hover geri bildirimi 28 bileşen dosyasında
  **altı farklı özellik yolundan** veriliyordu — `background-color` (30 kez),
  `color` (18), `border-color` (16), `transform` (7), `box-shadow` (3),
  `opacity` (2). Kural: hover'da zemin bir kademe, `active`te 1 px basılma,
  `selected`te kenarlık + zemin birlikte. `opacity` ile soluklaştırma yasak —
  metni de soluklaştırıp kontrast eşiğini sessizce düşürüyordu.

#### Faz 6

- **`docs/` kuruldu:** `DESIGN-SYSTEM.md` (öğe kataloğu + **hangi durumda
  hangi bileşen** tablosu), `A11Y.md`, `MOTION.md`, `THEMING.md`. README
  onlara işaret ediyor.
- **API tutarlılık denetçisi** (`src/__tests__/api-consistency.test.ts`) —
  64 bileşenin prop adlarını kural kümesine karşı ölçüyor: boolean `is*`/`has*`,
  olay `on*`, ölçü/ton/varyant tek ad. Yerel öznitelikler (`disabled`,
  `checked`, `type`) ve `aria-*` muaf; gerekçeleri yazılı.
- Denetçi **`@deprecated` yolunu tanıyor** ama muafiyet bedava değil: her
  `@deprecated` prop'un `MIGRATION.md`de kayıtlı olması ayrıca ölçülüyor —
  unutulan bir işaret sessizce kalıcı hâle gelen bir istisnaydı.

#### Denetçinin bulduğu

- **`ConfirmDialog.kind` → `variant`.** Aynı işi yapan üçüncü bir ad
  kütüphanede zaten `variant` olarak duruyordu (`Button`, `Badge`,
  `IconButton`). Eski prop bir sürüm çalışıyor, `MIGRATION.md`de kayıtlı.
- **`Timeline.status` ve `DateField.type` denetimden ÇIKARILDI** — ve bu bir
  taviz değil bir ayrım: `tone` bir SUNUM tercihi (`Alert tone="danger"` yazan
  geliştirici görünümü seçiyor), `status` bir OLGU (olayın başarısız olması bir
  tercih değil). İkisini tek ada indirmek, doğru cevabı olan bir alanı "renk
  seç" alanına çevirirdi. `type` ise yerel `<input type>`e doğrudan geçiyor.

#### Faz 4 — kalan maddeler (bu turda)

- **`Field` hatayla birlikte ipucunu da GÖSTERİYOR.** Önce ipucu hatanın
  alternatifiydi ve hata belirir belirmez kural ekrandan siliniyordu:
  "Geçersiz adres" neyin yanlış olduğunu söylüyor, "en az 8 karakter" ne
  yapılması gerektiğini — kullanıcı ikincisini tam da ihtiyaç duyduğu anda
  kaybediyordu. `aria-describedby` artık ikisini birden taşıyor, **hata önce**.
  Bu iki taraf çelişiyordu: bağ ipucuna işaret ediyor, ipucu çizilmiyordu —
  yani kimlik BOŞ bir düğümü gösteriyordu. Eski testi tersine çevirdi.
- **`Textarea`** — `isAutoSize` (ölçüm boyamadan önce, `height: auto` okumadan
  önce yazılır; yoksa kutu bir kez büyüyüp bir daha küçülmüyordu), `maxRows`,
  `hasCounter`. Sayaç `aria-hidden`: her tuş vuruşunda değişen bir canlı bölge
  ekran okuyucuyu yazılan metnin üzerine konuşturuyordu.
- **`Textarea` sayacı KONTROLLÜ kipte `value`dan okuyor** — yeni testin
  bulduğu gerçek hata. Uzunluk yalnızca `onChange` ile güncelleniyordu: profil
  ön doldurması, form sıfırlama ya da taslak yükleme sayacı eski sayıda
  bırakıyordu; 400 karakterlik metni yükleyen kullanıcı "12 / 500" okuyordu.
- **`Tabs isManualActivation`** (APG). Otomatik kipte ok tuşu sekmeyi anında
  açıyor; içeriği ağdan gelen bir sekme rayında klavye kullanıcısı üçüncü
  sekmeye giderken üç istek tetikliyordu.
- **`Pagination formatAnnouncement`** — sayfa değişince canlı bölgeye yazar.
  İLK çizimde duyurmaz: sayfa yeni açılmışken "Sayfa 1 / 9" demek,
  kullanıcının yapmadığı bir eylemi bildirmek olurdu.
- **`Price isFormatted`** — `Intl.NumberFormat`, yerel ayar `labels.locale`den.
  Ayar yoksa biçimlendirme YAPILMAZ: yanlış yerel ayarda biçimlenmiş tutar
  biçimlenmemiş olandan kötü ("1,250" bir yerde bin iki yüz elli, başka yerde
  bir tam iki yüz elli).
- **`Price` rakamsız değeri artık bozmuyor** — yine testin bulduğu gerçek hata.
  Soyma adımı "Fiyat sorunuz"u boş dizeye indiriyor, `Number('')` ise 0:
  ekranda tutar yerine **"0"** yazıyordu. Fiyat alanı dolu görünüp içeriği
  yanlış oluyordu.
- **`useListboxNavigation`** — `Select` ve `Combobox`ın ortak klavye modeli tek
  yerde. Altı davranış (uçlarda dönme, `Home`/`End`, seçme, `Escape`, `Tab` ile
  kapatıp gezinmeyi sürdürme, etkin seçeneği görünür tutma) iki bileşende kopya
  koddu ve ayrışma SESSİZDİ: her bileşenin kendi testi vardı ve her biri kendi
  davranışını doğruluyordu. `Space` yalnızca `hasSpaceSelect` ile — arama
  kutusunda boşluk bir KARAKTER ve seçime çevrilmesi "fren balatası" yazmayı
  imkânsız kılıyordu.
- **`useVirtualList`** — 1121 markalı bir `Combobox` listesinde DOM 1121 satır
  taşıyordu; panel açılışı mobilde gözle görülür şekilde donuyordu. Sabit satır
  yüksekliği, tek eksen; `react-window` eklemek yerine kütüphane içinde, çünkü
  paketin tek çalışma zamanı bağımlılığının ikon seti olması bilinçli bir karar.
  `scrollToIndex` ayrı duruyor: `scrollIntoView` **çizilmemiş** satırda çalışmaz.
- **`Select` ve `Combobox` kancaya bağlandı** — kopya klavye kodu gitti (net
  −56 satır). Görsel regresyon (46 senaryo) ve erişilebilirlik/klavye takımı
  (174 test) **fark üretmedi**: davranış birebir aynı, kaynağı tek. Kanca
  yalnızca gezinmeyi taşıyor — açılma kararı (panel mi alt sayfa mı),
  filtreleme ve `value`/`onChange` sözleşmesi bileşenlerde kaldı; ikisi orada
  gerçekten farklı ve tek kancaya toplamak `Select`e hiç kullanmayacağı arama
  kodunu taşıtırdı.

#### Faz 5 — mixin'in uygulanması

- `Menu` ögesi, `Accordion` başlığı ve `Steps` düğmesi `interactive-surface`e
  geçti; üçü de aynı deseni elle yazıyordu.
- **`Card` için belgelenmiş bir İSTİSNA yazıldı.** Tıklanabilir kart zemin
  değiştirmez, bir kademe YÜKSELİR. Gerekçe ölçülebilir: kart zaten `$surface`,
  sayfa `$page` ve aradaki bir kademe zemin değişimi beyaz kartta neredeyse
  görünmez (1,05:1). Kuralı kartlara zorlamak, kuralı korumak için görünür bir
  gerileme üretirdi; istisna yüzeylere özgü — satır, menü ögesi ve düğme için
  geçerli değil.

#### Boyut bütçesi 36 kB → 38 kB

Tüm paket girişi 532 B aştı ve bütçe yükseltildi. **Bileşen başına bütçelere
dokunulmadı** ve payla geçiyorlar (Button 3,93/4,5 · Badge 3,29/3,8) — tüketiciyi
koruyan sayılar onlar, çünkü gerçek uygulamalar ağaç sarsıyor. Yapılandırma
JSON'dan JS'e taşındı ki sayının **yanında gerekçesi** dursun; bütçeyi her
aşıldığında yükseltmek onu anlamsız kılar.

#### Kalan

**Tüketici geçişi** (`docs/CONSUMER-ADOPTION.md`) — `hanparca-frontend` ve
`hanparca-admin`i `^2.0.0`a çıkarmak, `react-hot-toast`ı kaldırmak, kopya
`useSheetViewport`/`focus.helper`/`useTheme`yi silmek (~2 400 satır).

**`Combobox` çoklu seçim** — kasıtlı olarak ertelendi. `useVirtualList` yazıldı
ve testi var ama `Combobox`a **henüz bağlanmadı**: sanallaştırma `aria-setsize`
/ `aria-posinset` gerektiriyor (çizilmeyen satırlar yüzünden ekran okuyucu
"3 / 16" diyordu, "3 / 1121" değil) ve çoklu seçim `Chip`lerle alanın kendisini
büyütüyor — ikisi de klavye modelinin ötesinde, ölçülmesi gereken görsel
değişiklikler. Kancalar hazır; bağlama ayrı bir adım.

---

### Faz 4 — mevcut bileşenlerin geçişi (ilk parti)

- **`EmptyState` hata tonu.** Kütüphanenin merkezi kuralı — "boş" ile
  "yüklenemedi" ayrı durumlardır — bu bileşende **kodlu değildi**: JSDoc
  "ağ hatasında bu bileşen çizilmez" diyordu ve sonucu şuydu, her çağıran
  kendi hata kutusunu yazıyor, kutular birbirinden farklı görünüyordu.
  `tone="error"` artık aynı yerleşimi farklı tonla ve `role="alert"` ile
  veriyor; ayrım korunuyor, kararın **yeri** değişti.
- **`Avatar` deterministik ton.** Aynı ad her zaman aynı kovaya düşüyor
  (djb2 karma, altı tint). Bir listede yan yana duran on kullanıcı hepsi aynı
  gri madalyonken ayırt edilemiyordu; rastgele renk ise madalyonu kimlik
  taşımaktan çıkarıp gürültüye çeviriyordu. Görsel varsa ton çizilmiyor.
- **`SkeletonCard` · `SkeletonRows` · `SkeletonTable`.** "İskelet yerleşimi
  kaydırmaz" sözü ancak iskelet gelecek içeriğin **ölçüsünü** taşıyorsa doğru;
  pratikte her çağıran ölçüyü gözle tahmin ediyordu ve tutmuyordu (180 px'lik
  görsel alanına 120 px'lik iskelet → içerik gelince 60 px sıçrama). Biçimler
  ölçüyü gerçek bileşenlerden alıyor: `CardMedia` oranı, `DataTable` satır
  yüksekliği, `Panel` dolgusu.

#### Kalan (Faz 4)

`Field` doğrulama zamanlaması (`aria-errormessage`), `Textarea` otomatik
yükseklik + karakter sayacı, `Tabs` manuel etkinleştirme + taşan sekmelerde
kaydırma, `Pagination` "toplam N sonuç" duyurusu, `Price` opsiyonel `Intl`,
`Combobox`/`Select` mantığının kancalara ayrılması (+ çoklu seçim ve
sanallaştırma), 64 bileşenin tek tek durum-üçlüsü denetimi.

---

### Faz 3 (P2) — tamamlayıcı bileşenler (ikinci parti) · **FAZ 3 TAMAM**

- **`DateField`** — yerel `<input type="date">`. Taklit takvim YOK ve gerekçesi
  yazılı: mobilde işletim sisteminin seçicisi, klavyeyle yazarak giriş, yerel
  biçim ve ekran okuyucunun bölümlü okuması — dördü de taklitte kayboluyor.
  Bedel (açılan panelin tema token'larını izlememesi) kabul edildi.
- **`DateRange`** — iki yerel alan; uçlar birbirini `min`/`max` ile kısıtlıyor,
  yani tarayıcı geçersiz aralığı **en baştan** seçtirmiyor. Özet `Intl` ile ve
  `labels.locale`den; yerel ayar verilmediğinde özet **hiç çizilmiyor** —
  yanlış biçimde bir tarih, hiç tarih olmamasından kötü.
- **`CommandPalette`** — `Combobox` + `Modal` bileşimi DENENDİ ve iki yerde
  kırıldı: `Combobox` bir DEĞER seçtiriyor (palet EYLEM çalıştırıyor) ve
  tetikleyicisi var (palette tetikleyici bir klavye kısayolu). Kısayolu
  kütüphane BAĞLAMAZ — belge düzeyinde bir dinleyici tüketicinin kendi
  kısayollarıyla sessizce çakışırdı.
- **`Carousel`** — **otomatik oynatma yok ve olmayacak**; bir prop olarak bile
  eklenmedi, eklenseydi kullanılırdı. Kaydırma yerel (`scroll-snap`): parmakla
  kaydırma, shift+tekerlek ve ok tuşları tarayıcıdan geliyor. Şerit yalnızca
  odaklanabilir çocuğu **yoksa** Tab durağı oluyor.

#### Düzeltildi

- **`Carousel` sayfa sayısı yanlıştı.** `pageCount` render sırasında bir
  ref'ten okunuyordu (`trackRef.current?.clientWidth`) — ilk render'da `null`,
  sonrasında hiç güncellenmiyor: beş kartın tamamı sığdığı hâlde beş nokta
  çiziliyordu. Sayı artık ölçümden geliyor. Görsel referansta yakalandı.

#### Bilinçli sapma — aralık takvimi yazılmadı

Program "taklit takvim yalnızca aralık seçimi için yazılır" diyordu. Yazılmadı
ve gerekçesi `DateRange` JSDoc'unda: taklit ızgaranın tek üstünlüğü iki ucu
aynı anda görmek, bedeli `DateField`te sayılan dört yeteneğin tamamı artı
APG ızgara klavye modelini sıfırdan yazmak. **Aralık seçimi tek başına yeterli
bir gerekçe değil** — "boş günleri gör" gibi ölçülmüş bir ihtiyaç çıktığında
yazılır. Karar kullanıcının; istenirse eklenir.

#### Bütçeler

ESM 33 → **36 kB** (34,73) · `styles.css` 20 → **22 kB** (20,18) · tek bileşen
`Button` 4 → 4,5 kB (3,93), `Badge` 3,5 → 3,8 kB (3,29).

---

### Faz 3 (P2) — tamamlayıcı bileşenler (ilk parti)

- **`Stat`** — ölçüm kutusu (KPI). Bileşen **hesap yapmaz**; `value` ve `delta`
  biçimlendirilmiş dizeler. Yön tek başına iyi/kötü demek değil: "iade oranı
  %12 arttı" kötü, "ciro %12 arttı" iyi — karar `isUpPositive` ile çağıranın.
  Değişim üç sinyalle anlatılıyor (ok yönü + renk + ekran okuyucuya okunan
  metin).
- **`Timeline`** — sipariş/işlem geçmişi. `Steps` ileri bakar, `Timeline`
  **geri**: olay sayısı değişken, hiçbiri tıklanabilir değil ve
  **`failed`** diye bir durum var — bir adım "başarısız" olamaz (akış orada
  durur), bir olay olabilir ve kayıtta kalır. Zaman biçimlendirmesi çağıranın:
  "3 saat önce" mi "14:32" mi, bağlama bağlı bir karar.
- **`TagInput`** — serbest değerli etiket girdisi. `Combobox` bilinen bir
  listeden seçtiriyor; burada değer serbest. Yerel `<input>` korunuyor
  (çipler DOM'da onun kardeşi — bir `<input>` çocuk alamıyor).
- **`ScrollArea`** — klavyeyle erişilebilir kaydırma bölgesi.
  `overflow: auto` tek başına yetmiyor: içinde odaklanabilir öğe olmayan bir
  kutu `tabindex` verilmediğinde klavye kullanıcısı için **ulaşılamaz**
  (WCAG 2.1.1; Firefox kendiliğinden veriyor, Chrome ve Safari vermiyor). Ama
  koşulsuz `tabindex` de olmaz — bileşen **taşmayı ölçüyor** ve yalnızca
  gerçekten kaydırılabilirken odaklanabilir kılıyor.

#### Düzeltildi

- **`TagInput`te yarım kalan metin kayboluyordu.** Alan terk edildiğinde
  yazılan metin artık etikete dönüyor; kullanıcı bunu ancak gönderdikten sonra
  fark ediyordu. Yinelenen değer de sessizce yutulmuyor: var olan çip bir kare
  vurgulanıyor ve "zaten ekli" duyuruluyor.
- **`Timeline` `failed` işareti yalnızca renkle ayrılıyordu** — "tamamlandı"
  (dolu daire + tik) ile aynı biçimdeydi. Çarpı eklendi; SCSS'teki yorum da
  zaten çarpı olduğunu söylüyordu ama kod öyle değildi.

#### Bütçeler

Değişmedi: ESM 32,48 / 33 kB · `styles.css` 19,18 / 20 kB · tek bileşen
`Badge` 3,13 kB.

#### P2'de kalan

`DatePicker`/`DateRange`, `CommandPalette`, `Carousel` — ve P1'den
`Combobox` çoklu seçim + sanallaştırma.

---

### Faz 3 (P1) — akış kalitesi

- **`Drawer`** — `BottomSheet`in geniş ekran karşılığı. Ayrım tercih değil
  EKRAN: kenardan gelen bir panel telefonda ekranın tamamını kaplıyor,
  dipten gelen bir panel 1440 px'te içeriğin tamamını örtüyor. `isOpen` alıyor
  — bu `BottomSheet`ten bilinçli bir ayrılık ve çıkış animasyonunu mümkün
  kılan tek şey.
- **`SegmentedControl`** — görünüm anahtarı. `ChipGroup`tan ayıran davranış
  testle kilitlendi: **seçili öğeye ikinci kez basmak hiçbir şey yapmaz**
  (çipte aynı hareket seçimi kaldırıyor; burada "hiçbiri" diye bir hâl yok).
- **`Steps`** — üç durum, **üç ayrı işaret** (tik / dolu madalyon + numara /
  boş madalyon) ve ayrıca metin karşılığı: `aria-current` tek başına yalnızca
  bulunulan adımı söylüyor, tamamlananları değil. `onStepClick` yokken adımlar
  `<button>` bile değil.
- **`FileUpload`** — yerel `<input type="file">` korunuyor; sürükle-bırak tek
  başına erişilebilir değil (fare gerektiriyor, WCAG 2.5.7). Boyut doğrulaması
  bileşende çünkü cevabı kesin; tür doğrulaması **değil** — `accept` bir öneri
  ve istemcide "geçerli" demek yanlış bir söz. Sonuç `useAnnounce` ile
  duyuruluyor.
- **`DataTable` yetenekleri** — sıralama (başlık gerçek bir `<button>`;
  `<th>` odaklanabilir değil ve klavye kullanıcısı sıralamaya hiç
  ulaşamıyordu), `aria-sort`, yön oku, yapışkan ilk sütun ve yapışkan toplu
  eylem şeridi. Sıralamanın kendisi çağıranın: sayfalanmış bir listede
  istemcide sıralamak yalnızca görünen sayfayı sıralar.

#### Düzeltildi

- **`Drawer` tam yükseklikte değildi.** `inset-block: 0` tek başına yetmiyor;
  tarayıcının `<dialog>` varsayılanı `height: fit-content` ve gerilmeyi
  eziyor. Görsel referansta yakalandı.
- **Galeride açık `Drawer` sayfayı inert bırakıyordu** — `showModal()` diğer
  her şeyi tıklanamaz kılıyor ve alt sayfa testleri zaman aşımına düşüyordu.
  `SOLO_ONLY` listesine alındı.

#### Bütçeler

ESM 30 → **33 kB** (30,75), `styles.css` 18 → **20 kB** (18,10). Tek bileşen
`Badge` 3,13 kB'de sabit — ağaç sarsma beş yeni bileşenden etkilenmedi.

#### Kalan (P2)

`DatePicker`/`DateRange`, `TagInput`, `ScrollArea`, `Stat`, `Timeline`,
`CommandPalette`, `Carousel` — ve P1'den **`Combobox` çoklu seçim +
sanallaştırma**. Sonuncusu bilinçli olarak ertelendi: 546 satırlık, testleri
olan bir bileşeni sanallaştırmaya geçirmek Faz 4'ün "mantığı kancalara ayır"
maddesiyle birlikte yapılırsa iki kez yazılmamış olacak.

---

### Faz 3 (P0) — tüketicide bugün elle yazılan bileşenler

Öncelik "moda"ya göre değil, **tüketicilerin bugün elle yazdığı şeylere** göre.
Yedi bileşen; hepsi APG desenine uygun klavye matrisiyle, `jest-axe` temiz,
galeri senaryolu ve görsel referanslı.

- **`ToastHub` + `toast`** — tek yığın; süre/ikon/renk kararları tek yerde.
  Harici kütüphaneye **sarmalayıcı yazılmadı**: tüketicinin `react-hot-toast`
  ile yaşadığı goober özgüllük hatası bir sarmalayıcıyla çözülmez, ertelenir.
  Yayın merkezi modül düzeyinde — `toast.error(…)` bir axios interceptor'unun
  içinden de çalışıyor. Hata `role="alert"`, geri kalanı `role="status"`;
  hover ve **klavye odağı** sayacı durduruyor (kalan süre korunuyor); en fazla
  üç bildirim, fazlası en eskisini düşürüyor; `Escape` en yenisini kapatıyor.
- **`Switch`** — anında uygulanan ayar. `Checkbox`ten farkı zamanlama ve bu
  fark ekran okuyucuda **duyuluyor**: `role="switch"` "açık/kapalı" der,
  onay kutusu "işaretli". Durumu renk değil **kulbun konumu** anlatıyor.
- **`Popover`** — eylem taşıyabilen, odak alan yüzey. Kipsel DEĞİL: arka plan
  tıklanabilir kalır, odak tuzağı yok, odak dışarı çıkınca kapanır.
- **`Menu`** — APG menu button. Odak **gerçekten** taşınır (`Select`in
  `aria-activedescendant` modeli menüde yanlış olurdu), harfe atlama,
  `Home`/`End`, dönen `tabindex`.
- **`Accordion`** — yerel `<details>`/`<summary>` üzerine. Sayfa içi bulma
  (Ctrl+F) taklit bir uygulamada imkânsız. Tek-açık kip elle kuruldu:
  `<details name>` Safari 17.2 öncesinde yok ve orada sessizce farklı
  davranıyordu. Yükseklik geçişi `interpolate-size: allow-keywords`.
- **`Progress` + `ProgressCircle`** — ölçülebilir bekleme. `value`
  verilmediğinde `aria-valuenow` **yazılmaz**: bilinmeyen bir değeri "0" diye
  bildirmek, işin hiç ilerlemediğini söylüyordu.

#### Düzeltildi

- **`Accordion` işaretçisi açık bölümde dönmüyordu.** Seçici `[open] > &`
  yazıyordu ama işaretçi `<summary>`nin içinde, `<details>`in doğrudan çocuğu
  değil — çocuk birleştiricisi hiçbir zaman eşleşmiyordu. Galeride görüldü.
- **`Menu`nun zorlanmış renk kipi halkası stylelint'e takıldı** ve mixin'e
  bağlandı: kendi kuralımı kendi nöbetçim yakaladı.

#### Bütçeler

ESM 25 → **30 kB** (28,09), `styles.css` 15 → **18 kB** (16,57), tek bileşen
`Badge` 3 → **3,5 kB** (3,13). Yedi bileşenin karşılığı; ağaç sarsma çalışmaya
devam ediyor (tüm paket 28 kB, tek bileşen 3,1 kB).

---

### Düzeltildi — alt sayfa gerçek cihazda çöküyordu

**Bildirim:** mobil gerçek cihazda sıralama ve araç seçimi panelleri açılıyor
ama **gövde neredeyse yok**: listede onlarca seçenek varken tek bir satırın
yarısı görünüyor, o yarıkta kaydırma yapılabiliyordu. Emülatörde ve
masaüstünde sorun görünmüyordu.

**Sebep — üç kusur birlikte:**

1. Panelin `max-height` değeri JavaScript'in ölçtüğü `--hanui-sheet-height`
   değişkenine bağlıydı ve **tabanı yoktu**. Ölçüldü: değişkene 120 px
   yazıldığında panel 96 px'e iniyor — 57 px başlık + **39 px gövde**, yani
   bildirilen görüntünün birebir kendisi.
2. `useSheetViewport` **her ölçümü koşulsuz yazıyordu.** Gerçek cihazda
   `visualViewport.height` klavye geçişlerinde, sayfa arka plandan dönerken ve
   `<dialog>` üst katmana girerken bir kare boyunca absürt küçük değerler
   raporluyor.
3. **Kare bayrağı kalıcı olarak takılı kalabiliyordu.** Bayrak yalnızca
   `requestAnimationFrame` geri çağrısında sıfırlanıyordu ve o geri çağrı
   çalışmayabilir (sekme arka planda, iOS üst katman geçişi). Kare hiç
   gelmediğinde **sonraki her ölçüm sessizce atlanıyor**, panel o an ne
   ölçüldüyse orada donuyordu — yani kötü bir ölçüm düzelmiyordu.

**Düzeltme:** CSS'te taban (`max(min(50dvh, 320px), …)`), ölçümde makul alt
sınır (240 px'in altı bir görünüm alanı değil geçici bir hâl; atlandığında
önceki doğru değer yerinde kalır) ve panel her açıldığında bekleyen karenin
iptal edilip ölçümün senkron yapılması.

**Nöbetçiler:** `hooks/__tests__/useSheetViewport.test.tsx` (üç yeni test) ve
`e2e/bottom-sheet.spec.ts` — gerçek tarayıcıda, ekran görüntüsü değil **sayı**
karşılaştıran, platform bağımsız bir yerleşim testi. jsdom `max-height`,
`min()`, `max()` ve `dvh` hesaplamadığı için bu hata yalnızca gerçek bir
yerleşim motorunda görülebiliyordu.

---

### Faz 2 — etkileşim altyapısı

Bu fazın çıktısı bileşen değil **altyapı**: konumlandırma, kaydırma kilidi,
duyuru merkezi, odak yönetimi ve hareket koreografisi. Faz 3'ün (`Popover`,
`Menu`, `Toast`, `Drawer`) yarısı bunlara dayanıyor.

#### Eklendi

- **`usePositioning`** — çarpışmaya duyarlı konumlandırma. Portal +
  `position: fixed`; tercih edilen kenara sığmayan yüzey karşıtına düşüyor,
  çapraz eksende görünüm alanına kırpılıyor. Ölçüm açılışta, yeniden
  boyutlandırmada ve **herhangi bir atanın** kaydırılmasında yenileniyor
  (`capture: true` ile tek dinleyici). **Yeni bağımlılık yok.**
- **`useScrollLock`** — sayaçlı kaydırma kilidi. `scrollbar-gutter: stable`
  ile yatay sıçrama, iOS'ta `position: fixed` ile kaydırma sızması ele
  alınıyor. Dışa veriliyor.
- **`useAnnounce`** — `aria-live` duyuru merkezi. İki bölge (`polite` /
  `assertive`), `aria-atomic`, aynı metnin ikinci kez duyurulabilmesi.
  Sağlayıcıya DEĞİL belgeye bağlı: sağlayıcı zorunlu değil ve ona bağlansaydı
  sağlayıcısız kullanımda hiçbir şey duyurulmazdı. Dışa veriliyor.
- **Odak yardımcıları** (`helpers/focus.helper`): `captureFocus` (odak geri
  dönüşü, DOM'dan kalkmış tetikleyiciyi tanır), `focusFirstMeaningful`
  (kapatma düğmesini atlar), `pushModal`/`isTopModal` (kipsel yığın).
- **Çıkış animasyonları** — `@starting-style` +
  `transition-behavior: allow-discrete`. `surface-transition` mixin'i giriş ve
  çıkışı tek kural kümesiyle veriyor.
- **Hareket koreografisi** `_mixins.scss` başında belgelendi; iki döngü
  token'ı eklendi (`duration-spin`, `duration-shimmer`).
- **stylelint kuralı**: bileşen SCSS'inde ham süre değeri (`0.7s`, `200ms`)
  yasak.

#### Değişti

- **`Tooltip` yeniden yazıldı.** Portal, çarpışmaya duyarlı yerleşim, 300 ms
  açılma gecikmesi (klavyede GECİKMESİZ), 120 ms kapanma toleransı, imleç
  balona giderken kapanmama, dokunmatikte uzun basma, `Escape` belge düzeyinde.
  `position` prop'u `side` oldu — eski prop bir sürüm boyunca çalışıyor
  (`docs/MIGRATION.md`).
- **`Modal` / `BottomSheet`** yeni altyapıya bağlandı: sayaçlı kilit, odak
  geri dönüşü, ilk anlamlı öğeye odak, kipsel yığın.

#### Düzeltildi

- **İç içe iki panelde kaydırma kilidi erken açılıyordu.** Her bileşen kilidi
  kendi yazıyordu; React'in sökme sırası garantili olmadığı için dış pencerenin
  temizliği önce koşabiliyor ve iç panel hâlâ açıkken kilit kalkıyordu.
- **Tek bir `Escape` üst üste iki paneli birden kapatıyordu.** `cancel` olayı
  her iki `<dialog>`a da ulaşıyor ve ikisi de kendi `onClose`unu çağırıyordu;
  artık yalnızca yığının en üstündeki işliyor.
- **Kipsel yüzeyler kapanırken bir karede yok oluyordu.** `animation` ile
  düzeltmenin yolu yok — bir animasyon öğenin `display: none` olmasını
  geciktiremez.
- **Odak kapatma düğmesine gidiyordu:** ekran okuyucu pencereyi "Kapat, düğme"
  diye açıyordu.
- **`Tooltip` bir tablo hücresinde ya da kartın içinde hiç görünmüyordu**
  (`overflow: hidden` kırpması), ekranın sağ kenarında taşıyordu ve
  dokunmatikte hiç açılmıyordu.

#### Tüketici tarafında gereken

- `Tooltip.position` → `side` (eski yol çalışıyor). Balon artık
  `document.body` altında; ona dışarıdan tutunan bir seçici varsa güncellenmeli.
- Ayrıntı: `docs/MIGRATION.md`.

---

### Faz 1 — sözleşme genişletmesi

Bu faza kadar çalışma zamanında **yalnızca renkler ve font aileleri**
ezilebiliyordu: bir tüketici markasının rengini verebiliyor ama yuvarlaklığını,
bilgi yoğunluğunu ya da hareket hızını veremiyordu. Bir tasarım sisteminin
"tema" tanımı bundan geniş.

#### Eklendi

- **43 ölçü token'ı CSS değişkenine taşındı** ve `HanuiProvider` /
  `initHanui` üzerinden ezilebilir hâle geldi: `radius-*`, `space-*`,
  `font-size-*`, `leading-*`, `icon-*`, `duration-*`, `ease-*`. Yeni alan
  `theme.metrics` — tema başına DEĞİL tek blokta (bir markanın yuvarlaklığı
  açık temada 12 px, koyu temada 8 px olmaz).
- **Yoğun kip** (`<html data-hanui-density="compact">`): satır yüksekliği,
  dolgu ve punto bir kademe iner. Boşluk ve punto ölçeği token düzeyinde
  değişir — hiçbir bileşende yoğunluğa özel kural YOK. Dokunma hedefi
  (44 px) yoğun kipte de küçülmez; `$tap-target-size` bilinçli olarak ölçü
  token'ı değil SCSS sabiti.
- **`@layer hanui`**: kütüphane CSS'inin tamamı tek katmanda. Tüketicinin
  sıradan bir sınıfı artık özgüllük savaşı vermeden kazanıyor. Sarmalama
  derleme anında, tek yerde (`scripts/lib/postcss-hanui-layer.mjs`);
  `@charset` katman dışında bırakılıyor.
- **`system` tema tercihi.** `useHanuiTheme` artık `preference` alanını da
  döndürüyor (`'light' | 'dark' | 'system'`) ve `setScheme('system')` açık
  seçimi siliyor. Üç durumlu tema anahtarı (Açık / Koyu / Sistem) artık
  kurulabiliyor. **Kırıcı değil**: `scheme` hâlâ ÇÖZÜLMÜŞ değeri döndürüyor.
- **`forced-colors: active`** (Windows Yüksek Kontrast) desteği: odak halkası
  sistem vurgu rengiyle yeniden çiziliyor, kutu sınırları `ButtonBorder`,
  seçili durum `Highlight`/`HighlightText`, pasif öğe `GrayText`. Kütüphanede
  bu kip için **sıfır kural** vardı.
- **`prefers-contrast: more`** — hairline'lar `border-strong`a, soluk metin bir
  kademe koyuya. **`prefers-reduced-transparency: reduce`** — `glass` opak
  karşılığına, perde tam opaklığa yaklaşıyor.
- **stylelint** (`npm run lint` içinde): `focus-ring` mixin'i dışında `outline`
  yazmak yasak.
- Görsel regresyona üç senaryo daha: **yoğun kip**, **zorlanmış renk kipi** ve
  RTL (240 referans).

#### Değişti

- **34 fiziksel yön bildirimi mantıksal özelliklere çevrildi**
  (`padding-inline-start`, `inset-inline`, `text-align: start`,
  `border-inline-start`). Yön TAŞIYAN ikonlar (`Pagination` okları,
  `Breadcrumb` ayracı, `TextLink` oku) `dir="rtl"` altında aynalanıyor.
  Fiziksel kalan üç yerin gerekçesi yazıldı: çentik payı (`env(safe-area-*)`
  yazı yönüyle dönmez) ve iki ortalama deyimi.
- **`heading()` mixin'i punto değil KADEME ADI alıyor**
  (`@include heading(lg)`). Puntolar çalışma zamanında ezilebilir olunca
  `@if $size >= $font-size-lg` karşılaştırması derlemeyi kırdı — ve kırması
  doğru: ezilebilir bir değer derleme anında karşılaştırılamaz.
- **Üç bileşenin elle yazdığı odak halkası** (`Tabs`, `RadioCard`,
  `RatingInput`) `focus-ring-shape` mixin'ine bağlandı. Üçü de ayrışmıştı:
  ikisi `$blue` kullanıyordu (`$ring-color` değil), offset 2 px ile 4 px
  arasında dolaşıyordu.
- `styles.css` bütçesi 14 → 15 kB. Büyüme kasıtlı: zorlanmış renk kipi,
  kontrast/saydamlık tercihleri, ölçü token'ları ve yoğun kip bloğu.

#### Düzeltildi

- **İki sessiz bozuk bildirim.** Ölçüler CSS değişkenine taşınınca
  `$space-8 - $space-2` ve `-$space-2` derlenmiyor — ama Sass HATA VERMİYOR:
  ifadeyi olduğu gibi geçirip tarayıcıya `var(--a)-var(--b)` yazıyor ve
  tarayıcı bütün bildirimi atıyor. `Input`un ön/son ek dolgusu ve `Radio`nun
  negatif kenar payı bu yolla düşmüştü; ikisi de `calc()`e çevrildi.

#### Tüketici tarafında gereken

- Kod değişikliği gerekmiyor. `useHanuiTheme` dönüşüne alan eklendi, hiçbiri
  kaldırılmadı.
- `@layer hanui` bir davranış değişikliği: tüketicinin kütüphaneyi ezmek için
  yazdığı `!important` ya da şişirilmiş özgüllük artık GEREKSİZ. Eskiden
  çalışan ezmeler çalışmaya devam eder (katmansız kural her zaman kazanır).
- `heading()` mixin'i kütüphane içi; dışa verilmiyor.

---

### Faz 0 — nöbetçiler

Kütüphanenin UI/UX kalitesini bu fazdan önce hiçbir otomatik kontrol
korumuyordu: kapsam eşiği, erişilebilirlik taraması, kontrast
ölçümü, görsel regresyon ve paket bütçesi yoktu. Aşağıdaki maddelerin çoğu yeni
bir yetenek değil, var olan bir davranışın **kilitlenmesi**.

### Eklendi

- **Eksen taraması** (`jest-axe`). Dışa verilen 57 bileşenin tamamı, varsayılan
  + hata + yükleme + boş durumlarıyla taranıyor (87 senaryo). Deftere girmeyen
  yeni bir bileşen testi kırar — liste `index.ts`ten türetiliyor.
- **Klavye sözleşmesi testleri** (34 test). `Combobox`, `Select`, `Tabs`,
  `ChipGroup`, `Modal`, `BottomSheet`, `RangeSlider`, `RatingInput`,
  `TableCheckbox` için WAI-ARIA APG desenlerine göre; tuş matrisleri ilgili
  bileşenlerin JSDoc'una yazıldı.
- **Kontrast denetçisi** (`npm run check:contrast`, `verify` içinde). İki temada
  118 metin/grafik çifti WCAG'a göre ölçülüyor; eşiği tutmayan bir token
  derlemeyi kırar. Hairline'lar ve pasif dolgular gerekçesiyle **advisory**
  listede (`HANUI_CONTRAST_VERBOSE=1`).
- **Token sözleşmesi testi.** Açık/koyu tema anahtar kümelerinin birebir aynı
  olduğu ve üretilmiş SCSS'in `tokens.ts` ile eşleştiği ölçülüyor. Ayrışma
  bugüne kadar sessizdi: bileşen `var(--hanui-yok)` okuyor, derleme yeşil
  dönüyordu.
- **Kapsam kapısı**: `helpers/` + `hooks/` + `theme/` satır ≥ %80
  (`npm run test:coverage`, `verify` içinde). Ölçüm %62,3'ten %95,8'e çıktı;
  `useHanuiTheme`, `useSheetViewport` ve `initHanui` testsizdi.
- **Görsel regresyon** (Playwright): 232 referans — her bileşen × {açık, koyu} ×
  {masaüstü, mobil}, kipsel bileşenler tek başına, artı iki `dir="rtl"` sahnesi.
  `npm run test:visual`.
- **Bileşen galerisi** (`npm run playground`): tüm bileşenler tek sayfada, tema
  ve yön anahtarıyla. Görsel regresyonun kaynağı ve tasarım kararının tek
  görüldüğü yer.
- **Paket boyutu bütçesi** (`size-limit`, `verify` içinde): ESM giriş noktası,
  `styles.css` ve tek bileşen import'u için ayrı bütçeler.
- `CHANGELOG.md` (bu dosya).

### Düzeltildi

- **`Combobox` temizleme düğmesi iç içe etkileşimli öğeydi.** `<button>`ın
  içinde `role="button"` taşıyan bir `<span>` duruyordu (dosyadaki yorum
  "DOM'da kardeş" diyordu, kod öyle değildi). Ekran okuyucular iç içe
  etkileşimli öğede yalnızca dıştakini duyurur: "seçimi temizle" eylemi destek
  teknolojisi kullanıcısı için **yoktu**. Artık kardeş bir `<button>`, görsel
  yeri aynı.
- **`DataTable` görünmez sütun başlığı.** `<th aria-label="Eylemler">` eksen
  taramasında boş başlık olarak raporlanıyordu; metin artık görsel olarak
  gizlenmiş gerçek bir düğüm.
- **`Badge` dolu bağlantı rozeti koyu temada okunmuyordu.** Metin `$on-scrim`
  (her iki temada beyaz) idi ve koyu temada zemin `#5b93ff`e açılıyor: 2,97:1.
  `$on-action` ile tema izleniyor — `Pagination` ve `Tile` zaten onu
  kullanıyordu, rozet tek başına ayrışmıştı.
- **Ağaç sallama hiç çalışmıyordu.** Yalnızca `Badge` import eden bir uygulama
  20,70 kB indiriyordu; paketin tamamı 21,82 kB. İki sebep: modül düzeyindeki
  `memo(...)` çağrıları saf işaretlenmemişti ve `X.displayName = 'X'` atamaları
  gerçek bir yan etki olarak bütün bağımlılık zincirini ayakta tutuyordu.
  Ölçülen sonuç: **`Badge` 2,71 kB, `Button` 3,38 kB.**

### Değişti — görünüş

Aşağıdaki dört düzeltme **kontrast denetçisinin bulduğu ihlallerdir**; hepsi
`palette.ts` / `tokens.ts` düzeyinde yapıldı, tek tek bileşene renk yazılmadı.

- `text-3` **açık** tema `#6b7583` → `#626c7a`. Eski değer yalnızca beyaz
  üzerinde ölçülmüştü (4,67:1); `page` üzerinde 4,36:1, `surface-2` üzerinde
  3,94:1 veriyordu — yer tutucu, üstü çizili fiyat ve çip sayacı ölçüm yapılan
  yer dışında her yerde ihlaldeydi. Bedeli: `text-2` ile fark daraldı.
- `text-3` **koyu** tema `#6b7583` → `#818b99` (3,69:1 → 4,51:1).
- `nav-fg-3` her iki temada `text-3` ile aynı tona bağlandı (açıkta 3,06:1,
  koyuda 3,42:1 idi). Bandın en soluk metni de metindir.
- `green-accent` **açık** tema `#34c759` → `#299d46`, hover `#2aae4b` →
  `#23883c`. Palet "ikon eşiği 3:1 ve hepsi geçiyor" diyordu; ölçüm 2,21:1
  gösterdi. `CopyField`in "kopyalandı" tiki tam bu tondaydı ve başarının **tek**
  görsel sinyaliydi.
- `scrim` %55 → %60 opaklık: üzerine yazılan beyaz metin açık temada 4,27:1'de
  kalıyordu (şimdi 5,01:1). Kip pencerenin perdesi bir tık koyulaştı.

### Tüketici tarafında gereken

- **`hanparca-frontend` / `hanparca-admin`**: kod değişikliği gerekmiyor. Görsel
  olarak dört ton değişti (yukarıdaki liste); soluk metinler bir kademe koyu,
  koyu temada bir kademe açık, yeşil ikonlar bir kademe koyu, kip pencere
  perdesi bir tık koyu. Tümü erişilebilirlik düzeltmesi.
- `Combobox` temizleme düğmesinin DOM'daki yeri değişti (tetikleyicinin çocuğu
  değil kardeşi). Bu öğeye CSS ya da test seçicisiyle dışarıdan tutunan bir yer
  varsa güncellenmeli.
