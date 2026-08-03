# Göç rehberi

Kırıcı değişiklikler ve `@deprecated` işaretli yollar burada kayıtlı.

**Kural:** bir prop adı ya da davranışı değişecekse eski yol **bir sürüm
boyunca çalışmaya devam eder**, `@deprecated` işaretlenir ve buraya yazılır.
Sessiz kırılma yok.

---

## Yayımlanmamış

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
