

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
