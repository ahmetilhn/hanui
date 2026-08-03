# Hareket

Bileşenler **kendi sürelerini seçmez.** Ölçek dışı bir süre gerekiyorsa
`theme/tokens.ts`e eklenir; nöbetçi `stylelint.config.mjs` — bileşen SCSS'inde
ham `ms`/`s` değeri yasak.

## Neden bir kural

Önce her bileşen kendi değerini yazıyordu ve ölçek dışına çıkanlar vardı
(1.4 s iskelet parıltısı, 3 px'lik bir kaymaya 320 ms). Aynı jest iki bileşende
iki farklı hızda oluyor, arayüz "elde dizilmiş" hissi veriyordu.

## Ölçek

| Token | Süre | Ne için |
| --- | ---: | --- |
| `duration-instant` | 80 ms | Geri bildirim: basma, tik, sayaç |
| `duration-fast` | 140 ms | Durum değişimi: hover, odak, renk, kenarlık |
| `duration-normal` | 200 ms | Yüzey açılışı: kip pencere, panel, açılır liste |
| `duration-slow` | 320 ms | Dipten açılan panel, uzun mesafeli kayma |

**200 ms üzerindeki geçişler** tıklama ile sonuç arasında görünür bir gecikme
yaratır ve arayüz yavaş hissedilir.

### Döngü süreleri — geçiş ölçeğinden ayrı

| Token | Süre | Ne için |
| --- | ---: | --- |
| `duration-spin` | 700 ms | `Spinner`, belirsiz `ProgressCircle` |
| `duration-shimmer` | 1400 ms | İskelet parıltısı, belirsiz `Progress` |

Sürekli dönen bir gösterge bir *geçiş* değil: 320 ms'lik bir dönüş baş
döndürücü, 140 ms'lik bir parıltı titreşim gibi okunuyor. Ayrı isim vermenin
sebebi ölçekten kaçmak değil, **ölçeği korumak**.

## Eğriler

| Token | Ne için |
| --- | --- |
| `ease-out` | Yüzey açılışı ve giriş — hızlı başlar, yumuşak durur |
| `ease-in-out` | İki yön de anlamlı olan geçiş (sekme altçizgisi) |
| `ease-spring` | **Yalnızca** dipten açılan panel |

## Giriş ve çıkış SİMETRİK

Kipsel yüzeyler açılırken canlanıp kapanırken bir karede yok oluyordu;
kullanıcı neyin kapandığını göremiyordu — özellikle iki panel üst üsteyken.

`surface-transition` mixin'i `@starting-style` + `transition-behavior:
allow-discrete` ile ikisini tek kural kümesinde veriyor. `animation` ile bu
mümkün değil: bir animasyon öğenin `display: none` olmasını geciktiremez.

`::backdrop` için **ayrı** mixin (`backdrop-transition`): `&[open]` sözde
öğeye uygulanamaz — `dialog::backdrop[open]` hiçbir zaman eşleşmez.

## Hareket azaltma

Her animasyon ve geçiş `@include reduced-motion` karşılar. Kapatıldığında
bilgi kaybolmamalı: belirsiz `Progress` çubuğu hareketsizken **yarım dolu**
kalır — boş bir ray "hiç ilerlemedi" gibi okunuyordu.
