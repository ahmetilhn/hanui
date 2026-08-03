# @ahmetilhn/hanui

Erişilebilir, tema güdümlü React bileşen kütüphanesi. SCSS Modules üzerine
kurulu; çalışma zamanında **hiçbir UI bağımlılığı yok**.

- **Tek CSS dosyası, iki tema.** Açık ve koyu hazır gelir, her token dışarıdan
  ezilebilir.
- **Yönlendirici enjekte edilir.** `next/link`, `react-router`, ham `<a>` —
  karar tüketicinin.
- **Metin dışarıdan, ama BİR KEZ.** Kütüphane hiçbir dilde metin uydurmaz;
  kullanıcıya görünen dizeler sağlayıcıda tek yerde tanımlanır.
- **Yerel öğeler korunur.** `<dialog>`, `<input type="range">`,
  `<input type="radio">` — odak tuzağı, klavye gezinmesi ve ekran okuyucu
  duyurusu tarayıcıdan gelir.

```bash
npm install @ahmetilhn/hanui @ahmetilhn/handy-utils
```

`react`, `react-dom` ve `@ahmetilhn/handy-utils` **peer** bağımlılıktır.

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

### İlk boyamadan önce yazın

```tsx
// app/layout.tsx — <head> içine.
<script
  dangerouslySetInnerHTML={{
    __html: `document.documentElement.dataset.hanuiTheme =
      localStorage.getItem('theme') ?? 'light';`,
  }}
/>
```

Bu satır React ağacına konamaz: sağlayıcı ağaç monte olduktan sonra çalışıyor
ve koyu tema seçmiş kullanıcı o ana kadar **bir kare beyaz ekran** görüyor.

### Token'ları ezmek

Yalnızca değiştirdiğiniz token'ı verin; gerisi varsayılanında kalır.

```tsx
import { HanuiProvider } from '@ahmetilhn/hanui';

const THEME = {
  light: { blue: '#0d6efd', 'blue-text': '#0a58ca' },
  dark: { blue: '#6ea8fe' },
  fonts: { heading: 'Archivo, sans-serif', body: 'Inter, sans-serif' },
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

### Temayı değiştirmek

```tsx
const { scheme, toggle, isReady } = useHanuiTheme();

useEffect(() => {
  if (isReady) localStorage.setItem('theme', scheme);
}, [scheme, isReady]);
```

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
theme/tokens.ts    → anlamsal token → hex (açık + koyu)
styles/*.generated → yukarıdakinden ÜRETİLİR (npm run tokens)
```

SCSS ve TypeScript tarafı elle tutulsaydı bir tarafta var olup diğerinde
olmayan bir token çıkardı — ve ayrışma sessiz: bileşen `var(--hanui-yok)`
okuyup rengini kaybediyor, derleme yeşil dönüyor.

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

| Grup       | Bileşenler                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Eylem      | `Button` · `IconButton` · `TextLink` · `Tooltip`                                                                                              |
| Seçim      | `Chip` · `ChipGroup` · `Select` · `Combobox` · `Checkbox` · `Radio` · `RadioCard` · `RangeSlider` · `RatingInput` · `QuantityStepper` · `TableCheckbox` |
| Girdi      | `Input` · `Textarea` · `Field`                                                                                                                |
| Yüzey      | `Card` (+ `CardMedia`, `CardOverlay`, `CardBody`, `CardFooter`) · `Panel` (+ `PanelForm`, `PanelRow`) · `PageHeader` · `SectionHeader` · `Tile` · `Directory` |
| Geri bild. | `Alert` · `Badge` · `EmptyState` · `Skeleton` · `Spinner` · `Divider` · `Avatar` · `Rating` · `Price` · `CopyField` · `Breadcrumb`             |
| Kipsel     | `Modal` · `BottomSheet` · `ConfirmDialog` · `PromptDialog`                                                                                     |
| Veri       | `Table` (+ `TableScroller`) · `DataTable` (+ `DataTableRow`) · `FilterBar` (+ `FilterBarField`) · `Pagination`                                 |

### Seçenek sayısı öğeyi belirler

| Seçenek sayısı | Öğe                                             |
| -------------- | ----------------------------------------------- |
| 2–4            | `ChipGroup` — hepsi ekranda, tek dokunuş        |
| 5–20           | `Select` — aramasız liste; mobilde alt sayfa    |
| 20+            | `Combobox` — yazarak ara                        |
| Aralık         | `RangeSlider` (+ kesin değer için sayı girdisi) |
| Tekil aç/kapa  | `Checkbox`                                      |

Hepsini onay kutusu listesi yapmak tek tip ama kötü bir arayüzdür: 1121 markayı
da 3 seçeneği de aynı biçimde göstermek, ikisini de yanlış gösterir.

---

## Sistemin taşıdığı kararlar

**Doygun dolgu = tıklanabilir.** Durum etiketleri **her zaman** tint zeminli
(`Badge`, `Alert`), eylemler **her zaman** dolgulu veya çerçeveli. Bu ayrım
bozulduğunda kullanıcı durum etiketine tıklamayı deniyor. `Badge`in `solid`
varyantı durum tonlarında bilinçli olarak `soft` ile aynı şeyi verir.

**Bir ekranda tek `PRIMARY`.** `UIVariant` bir vurgu hiyerarşisi: iki dolu düğme
yan yana durduğunda hiçbiri öne çıkmaz. `UIVariant.CART` ekrandaki tek doygun
turuncu — dönüşüm eylemi.

**Renk tek başına anlam taşımaz** (WCAG 1.4.1). Her durum bir metin, ikon veya
işaretle de bildirilir: `Alert`in her tonunun kendi ikonu var, `Field`in zorunlu
yıldızının yanında okunabilir bir metin, `RatingInput`in yıldızlarının altında
açıklama duruyor.

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

**Hareket 200 ms'yi geçmez** ve `prefers-reduced-motion` her animasyonda
karşılanır.

**Odak halkası `:focus-visible` ile.** `:focus` fareyle tıklandığında da halka
gösterip görsel gürültü yaratıyor ve kullanıcılar bunu hata sanıyordu.

---

## Next.js App Router

Paket `'use client'` sınırını **kendi içinde** çizer: sunucu bileşenlerinden
doğrudan import edilebilir, `children` sunucuda çizilip aktarılır.

```tsx
// app/layout.tsx
import '@ahmetilhn/hanui/styles.css';
import { HanuiProvider } from '@ahmetilhn/hanui';
import NextLink from 'next/link';
```

---

## Geliştirme

```bash
nvm use            # .nvmrc → 24
npm install
npm run verify     # tokens → typecheck → lint → test → build
```

| Komut               |                                                    |
| ------------------- | -------------------------------------------------- |
| `npm run tokens`    | SCSS token dosyalarını `theme/tokens.ts`ten üretir |
| `npm run build`     | `build/` (ESM + CJS + `.d.ts` + `styles.css`)      |
| `npm run test`      | Jest + Testing Library                             |
| `npm run typecheck` | `tsc --noEmit`                                     |

`master`a her push `npm publish` çalıştırır — **`package.json` sürümünü
yükseltmeyi unutmayın**, aynı sürüm ikinci kez yayımlanamaz ve iş akışı kırmızı
döner.

## Lisans

MIT
