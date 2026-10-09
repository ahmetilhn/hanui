

/** Doğrusal → sRGB gamma. */
const toGamma = channel =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

const clamp01 = value => Math.min(1, Math.max(0, value));

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map(channel =>
      Math.round(clamp01(channel) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

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

/** `{ l, c, h }` → `#rrggbb`. ⚠ Gamut dışı renk KIRPILMAZ, chroma DÜŞÜRÜLÜR. */
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

/** sRGB gamma → doğrusal. */
const toLinear = channel =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

/** `#rrggbb` → `{ l, a, b, c }` (OKLab + chroma). Kapıların ölçüm aracı. */
export const fromHex = hex => {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(start => toLinear(parseInt(value.slice(start, start + 2), 16) / 255));

  const long = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const medium = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const short = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lab = {
    l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  };

  return { ...lab, c: Math.hypot(lab.a, lab.b) };
};

/** İki renk arasındaki OKLab uzaklığı ×100 (ΔE). */
export const deltaE = (first, second) => {
  const x = fromHex(first);
  const y = fromHex(second);
  return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b) * 100;
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
