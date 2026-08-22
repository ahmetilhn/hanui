/**
 * OKLCH ↔ sRGB dönüşümü — paletin türetme aritmetiği.
 *
 * <p>Bağımlılık eklenmedi (`culori` vb.): paket sıfır runtime bağımlılığıyla
 * yayınlanıyor ve bu dosya yalnızca derleme öncesi bir betikte koşuyor.
 *
 * <p>⚠ <strong>Neden OKLCH, neden HSL değil.</strong> HSL'de aynı `L` iki
 * farklı tonda iki farklı parlaklık verir — `hsl(60 100% 50%)` sarı ile
 * `hsl(240 100% 50%)` mavi kâğıt üzerinde 12:1 ile 2:1 arası fark eder. Bir
 * durum ailesinin altı üyesini "aynı ağırlıkta" kurmak HSL'de imkânsız;
 * OKLCH algısal olarak tekdüze olduğu için `L` sabitken ton değiştirmek
 * ağırlığı korur.
 */

const CBRT = value => Math.cbrt(value);

/** sRGB gamma → doğrusal. */
const toLinear = channel =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

/** Doğrusal → sRGB gamma. */
const toGamma = channel =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

/** `#rrggbb` → `{ r, g, b }`, 0-1. */
const hexToRgb = hex => {
  const text = hex.replace('#', '');
  const full =
    text.length === 3
      ? text
          .split('')
          .map(character => character + character)
          .join('')
      : text;

  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Ayrıştırılamayan renk: ${hex}`);

  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
};

const clamp01 = value => Math.min(1, Math.max(0, value));

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map(channel =>
      Math.round(clamp01(channel) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

/** `#rrggbb` → `{ l, c, h }`. `l` 0-1, `c` 0-~0.4, `h` derece. */
export const toOklch = hex => {
  const { r, g, b } = hexToRgb(hex);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const long = CBRT(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const medium = CBRT(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const short = CBRT(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const lightness = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short;
  const greenRed = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const blueYellow = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;

  const chroma = Math.sqrt(greenRed ** 2 + blueYellow ** 2);
  const hue = ((Math.atan2(blueYellow, greenRed) * 180) / Math.PI + 360) % 360;

  return { l: lightness, c: chroma, h: hue };
};

/** `{ l, c, h }` → doğrusal olmayan sRGB, gamut denetimi YAPMADAN. */
const oklchToRgb = ({ l, c, h }) => {
  const radians = (h * Math.PI) / 180;
  const greenRed = c * Math.cos(radians);
  const blueYellow = c * Math.sin(radians);

  const long = (l + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3;
  const medium = (l - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3;
  const short = (l - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3;

  return {
    r: toGamma(4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short),
    g: toGamma(-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short),
    b: toGamma(-0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short),
  };
};

const EPSILON = 0.0001;

const isInGamut = ({ r, g, b }) =>
  r >= -EPSILON && r <= 1 + EPSILON && g >= -EPSILON && g <= 1 + EPSILON && b >= -EPSILON && b <= 1 + EPSILON;

/**
 * `{ l, c, h }` → `#rrggbb`.
 *
 * <p>⚠ <strong>Gamut dışı renk KIRPILMAZ, chroma DÜŞÜRÜLÜR.</strong> Kanal
 * bazında kırpmak (`min(1, r)`) tonu kaydırır: doygun bir yeşilde yalnızca
 * `g` tavana dayanır ve sonuç sarıya döner. İkili arama chroma'yı gamut'a
 * sığan en yüksek değere indirir, `l` ve `h` korunur — yani "bu tonun bu
 * aydınlıkta üretilebilecek en canlı hâli".
 */
export const toHex = ({ l, c, h }) => {
  const direct = oklchToRgb({ l, c, h });
  if (isInGamut(direct)) return rgbToHex(direct);

  let low = 0;
  let high = c;

  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (isInGamut(oklchToRgb({ l, c: middle, h }))) low = middle;
    else high = middle;
  }

  return rgbToHex(oklchToRgb({ l, c: low, h }));
};

/** Verilen ton ve aydınlıkta sRGB'ye sığan en yüksek chroma. */
export const maxChroma = (l, h) => {
  let low = 0;
  let high = 0.4;

  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (isInGamut(oklchToRgb({ l, c: middle, h }))) low = middle;
    else high = middle;
  }

  return low;
};
