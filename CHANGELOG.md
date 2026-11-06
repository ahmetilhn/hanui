# Değişiklik günlüğü

Biçim: sürüm başına **kırıcı** / **eklenen** / **düzeltilen**. Ölçülmüş gerekçeler `CLAUDE.md`de
("Göç ve `@deprecated` yollar"), kullanım `README.md`de. 5.x ve öncesi `README.md` → "5.0'a geçiş"
ve "5.1 – 5.6'da eklenenler" tablolarında.

## 1.0.0 — 2026-11-07 — `@handijit/ui`

**Paket ve marka adı değişti.** `@ahmetilhn/hanui` (son sürüm 5.6.3) handijit organizasyonuna taşındı:
npm adı `@handijit/ui`, depo `github.com/handijit/ui`, sürüm 1.0.0'dan başlar. İç adlar da yeni
markayı taşır: CSS sınıf öneki `ui-` (eski `hanui-`), token'lar `--ui-*` (eski `--hanui-*`), katman
`@layer ui`, öznitelikler `data-ui-theme` / `data-ui-density`, bileşen ve kanca adları `UiProvider`,
`UiThemeScript`, `initUi`, `useUi`, `useUiTheme`, `useUiTokens`, tipler `Ui*` (eski `Hanui*`),
`<style id="ui-theme-overrides">`, keyframes `ui-*`, SCSS `@use '@handijit/ui/scss' as ui`. Eski
adlara takma ad yok. Eşlik eden paket: `@ahmetilhn/handy-utils` → `@handijit/utils` (peer bağımlılık).

Aşağıdaki maddeler 5.6.3'ten bu sürüme gelen teknik değişikliklerdir (6.0.0 adıyla hazırlanmış, 1.0.0
olarak yayımlanmıştır).

Bir **paketleme** sürümü: bileşen API'si değişmedi (`check:api`: 177 + 30 + 22 + 253 ad aynı),
kırılan şey paketin dosya düzeni, `'use client'` sınırı ve CSS'in nasıl indiği. Gerekçe: tek
dosyalık 5.x paketi tüketicide (Next 16, Turbopack) bileşen düzeyinde ağaçtan sarsılamıyor, her
`Button`/`Chip` bir hidrasyon sınırı oluyor ve `turbopackModuleFragments` tek dosyayı ~2.000 halkalık
bir değerlendirme zincirine bölüp tarayıcı yığınını taşırıyordu (handijit.com ölçümü, Kasım 2026).

### Kırıcı

- **Bileşen başına modül.** `build/index.js` tek dosya değil, `src/` ağacının birebir çıktısı:
  `build/components/Button/index.js`, `build/hooks/usePositioning.js`… Cephe `build/index.js`
  yalnızca yeniden dışa aktarım taşır. Paket içi derin yollar (`@handijit/ui/build/…`) **hâlâ
  kapalı**; her bileşenin resmî alt yolu var: `@handijit/ui/button`, `/chip-group`,
  `/combobox`… (68 alt yol; `node scripts/build-exports.mjs` üretir, `--check` doğrular).
- **`'use client'` dosya başına.** Kanca, tarayıcı API'si ya da kendi olay işleyicisi olmayan 18
  bileşen yönergesiz: `Alert`, `Badge`, `Button`, `Card` (+`CardBody/Footer/Media/Overlay`), `Chip`,
  `Divider`, `EmptyState`, `IconButton`, `Kbd`, `PageHeader`, `Panel` (+`PanelForm/Row`), `Progress`
  (+`ProgressCircle`), `SectionHeader`, `Skeleton` (+`SkeletonCard/Rows/Table`), `StatusDot`,
  `SummaryCard`, `TextLink`, `Tile`. Sunucu bileşeninden doğrudan çizilirler; istemciye JS inmez.
  Diğer her bileşen, kanca ve tema bağlamı yönergeli kalır. Nöbetçi: `__tests__/client-boundary.test.ts`.
  - Sonuç: 5.x'te "paket `'use client'` olduğu için sunucu bileşeni @handijit/ui enum'unu değer olarak içe
    aktaramaz" kısıtı kalktı (`UIVariant`, `UISize` sunucuda da içe aktarılır).
  - `Button`/`IconButton` bağlantı dalı (`href`) artık `UiLink`e işlev prop'u geçirmez: pasif
    bağlantı (`disabled` / `isLoading`) `aria-disabled` + `tabIndex=-1` + `pointer-events: none`
    ile durdurulur, tüketicinin `onClick`i yalnızca etkinken iletilir. Öncesinde `preventDefault`
    çağıran bir sarmalayıcı işlev vardı; sunucu bileşeninden çizimde RSC serileştirmesi düşerdi.
  - `Breadcrumb`, `Stat`, `Steps`, `Spinner`, `Field` sağlayıcı metinlerini (`useUi`) okuduğu için
    **istemci kalır** — metinleri zorunlu prop yapmak sağlayıcıya güvenen tüketicide erişilebilirlik
    metnini düşürürdü.
- **CSS bileşen başına dosyada; JS CSS içe aktarmaz.** `build/components/<Ad>/style.css` (bileşen
  başına), `build/base.css` (token'lar, kutu modeli, `@keyframes` — 3,4 kB gz) ve `build/styles.css`
  (TAM paket, 5.x ile aynı kullanım) üretilir; alt yollar `./styles.css`, `./base.css`,
  `./components/*/style.css`. Tüketici CSS'i **tek dosya** olarak alır: ya `styles.css`, ya da
  `base.css` + kullandığı bileşenlerin `style.css` dosyalarını kendi derlemesinde birleştirerek.
  - Neden modül kendi CSS'ini getirmiyor (ölçüldü, handijit.com, Next 16.4.5 / Turbopack): modüllerin
    `import './style.css'` taşıdığı denemede Turbopack her istemci sınırının CSS'ini ayrı dosyaya koydu;
    render-blocking CSS 6 → 12–15 dosya ve LCP yavaş 4G'de 1,9 → 2,5 s (bayt 46,7 → 33,3 kB
    azalmasına rağmen). `turbopackModuleFragments` açıkken aynı içe aktarımlar çıktıdan tamamen
    düşüyordu; esbuild ise erişilemeyen modüllerin CSS'ini de topluyordu. Üç paketleyicide üç farklı
    davranış: CSS'in nasıl ineceği tüketicinin açık kararı olarak kalır.
  - Alt girişler (`chat.css`, `charts.css`) değişmedi: `styles.css`ten (ya da `base.css`ten) sonra içe
    aktarılır.
- **Tipler dosya başına.** `build/index.d.ts` toplanmış tek dosya değil; her modülün yanında
  `index.d.ts`. `import type { … } from '@handijit/ui'` aynı çalışır.
- **`Combobox` tetikleyicisi `role="combobox"`** (`Select` ile aynı): `aria-expanded`,
  `aria-controls` (kapalıyken de), `aria-invalid` ve `aria-required` tetikleyicide. Arama kutusu
  artık `role="combobox"` DEĞİL, metin kutusu (`aria-autocomplete="list"`, `aria-controls`,
  `aria-activedescendant` textbox rolünde geçerli — ARIA 1.2): panel açıkken sayfada tek combobox.
  Testte `getByRole('button', { name: placeholder })` → `getByRole('combobox', …)`; arama kutusu
  `getByRole('textbox', { name: searchPlaceholder })`. Gerekçe: düğme rolünde `aria-invalid`
  tanımsızdı ve form hatasında ilk hatalı alana odaklanılamıyordu (eksen taraması, handijit.com D-12).

### Eklenen

- **Bileşen değişkenleri** — tüketicinin `:root`a yazdığı, bileşenin `var(--ui-…, varsayılan)`
  ile okuduğu CSS özel özellikleri. Token sözleşmesine (`LIGHT_THEME`/`DARK_THEME`, 110 ad) girmez;
  `check-contrast` ve tema testleri değişmedi. Liste `README.md` → "Bileşen değişkenleri".
  `--ui-ring-width/offset`, `--ui-placeholder`, `--ui-scrim-blur`,
  `--ui-button-{radius,weight,tracking,wrap}`,
  `--ui-chip-{bg,line,fg,radius,weight,selected-bg,selected-line,selected-fg,selected-weight}`,
  `--ui-badge-{font,weight,tracking,transform,radius}` (+ 5.x'ten `bg/line/fg`),
  `--ui-stat-{label-font,label-size,label-weight,label-tracking,label-transform,value-font,value-weight,value-tracking,unit-font,unit-size,unit-tracking,unit-transform}`,
  `--ui-tab-weight`, `--ui-radio-card-{line,radius}`. Ölçüldü: handijit.com'un 497 satırlık
  `_ui-overrides.scss` dosyasının ~80 satırı (odak halkası, düğme, çip, rozet, istatistik, seçim
  kartı, yer tutucu) bu değişkenlerle `:root`ta 25 satıra iner.
- **`Select size="sm"`** 36 px kutuyu büyütmeden görünmez `::after` ile 44 px dokunma alanı
  (WCAG 2.5.8; `Chip` ile aynı kurgu). Nöbetçi listesi `__tests__/styles/tap-targets.test.ts`.
- `npm run exports` / `check:exports` — `exports` haritası üreteci ve doğrulayıcısı (`build`in son
  adımı).

### Düzeltilen

- `CommandPalette` girdisi `font-size-control` (≥ 16 px): iOS Safari küçük metin alanına odaklanınca
  sayfayı yakınlaştırıp yana kaydırıyordu.
- 5.x'te yönergesiz kalmış ama kanca kullanan 16 bileşene (`Avatar`, `Breadcrumb`, `Checkbox`,
  `DataTable`, `Directory`, `Field`, `FilterBar`, `Input`, `PasswordInput`, `Price`, `Radio`,
  `RadioCard`, `Rating`, `Spinner`, `TableCheckbox`, `ToastPortal`) `'use client'` yazıldı — tek
  dosyada bunun önemi yoktu, dosya başına çıktıda sunucu bileşeni sayılıp ilk kancada düşerlerdi.

### Ölçüm — tüketicide (handijit.com, Next 16.4.5 / Turbopack, `SITE_ENV=production`, gz)

| Hizmet sayfası | hanui 5.6.3 | ui 1.0.0 |
|---|---|---|
| Toplam JS (check-bundle) | 191,8 kB | **162,1 kB** |
| @handijit/ui içeren istemci parçaları | 39,7 kB | 27,8 kB (Combobox, Modal, Drawer, Toast, palet… istemci bileşenlerinin kullandıkları) |
| Render-blocking CSS (`styles.css` tek dosya) | 6 dosya, 46,7 kB (hanui 22,6) | 6 dosya (ui 24,0) |

Denenen ve geri alınan: modüllerin CSS'i kendilerinin getirmesi → 12 dosya, 33,3 kB, LCP (yavaş 4G,
Lighthouse medyan) 1,9 s → 2,5 s. Tek dosya ile LCP ölçümü tüketici raporunda.

### Ölçüm (`size-limit`, gz)

| | hanui 5.6.3 | ui 1.0.0 |
|---|---|---|
| yalnızca `Button` (JS) | 5,12 kB | **1,33 kB** |
| yalnızca `Badge` (JS) | 4,33 kB | **0,45 kB** |
| tüm paket (cephe) | 42,05 kB | 43,29 kB |
| `styles.css` (tam) | 23,07 kB | 24,22 kB |
| `base.css` + `Button/style.css` | — | 3,41 + 1,30 kB |

### `@ahmetilhn/hanui` 5.x'ten geçiş

0. Bağımlılık: `npm rm @ahmetilhn/hanui @ahmetilhn/handy-utils && npm i @handijit/ui @handijit/utils`;
   içe aktarımlarda paket adı, kodda `Hanui*` → `Ui*`, `useHanui*` → `useUi*`, `initHanui` → `initUi`;
   CSS'te `hanui-` → `ui-`, `--hanui-` → `--ui-`, `@layer hanui` → `@layer ui`, `data-hanui-*` →
   `data-ui-*`; SCSS'te `@use '@handijit/ui/scss' as ui`.

1. `import '@handijit/ui/styles.css'` aynen kalır (tek dosya). Alt küme isteyen tüketici
   `@handijit/ui/base.css` + `@handijit/ui/components/<Ad>/style.css` dosyalarını kendi derlemesinde
   TEK dosyaya birleştirir (bkz. yukarıdaki ölçüm: dosya sayısı LCP'yi bayttan çok etkiliyor).
2. Testlerde `Combobox` tetikleyicisini `combobox`, arama kutusunu `textbox` rolüyle sor.
3. Next.js App Router: `experimental.optimizePackageImports: ['@handijit/ui']` — cephe saf;
   içe aktarım bileşen dosyasına kısa devre yapılır. Sunucu bileşenlerinden yönergesiz bileşenler
   doğrudan içe aktarılır; `Client*` sarmalayıcıları yalnızca istemci bileşenleri için gerekir.
   ⚠ `experimental.turbopackModuleFragments` KAPALI kalır: açıkken Turbopack yan etkisiz sayılan
   modüllerin CSS içe aktarımlarını düşürüyor (ölçüldü, Next 16.4.5: @handijit/ui CSS'i çıktıda hiç yok;
   `optimizePackageImports` açık ya da kapalı fark etmiyor). Bileşen başına modülle parçalara gerek
   de kalmadı: ağaç sarsma modül düzeyinde (handijit.com hizmet sayfası toplam JS 191,8 → 162,1 kB).
4. Bağlantı düğmesinde `isLoading`/`disabled` iken `onClick`in çağrılmamasına güveniyorsan davranış
   aynı; `preventDefault`e güveniyorsan artık `pointer-events: none` + `tabIndex=-1` ile sağlanır.
5. Test ortamı değişmez: JS çıktısı CSS içe aktarmadığı için Node ESM modülleri doğrudan yükler.
