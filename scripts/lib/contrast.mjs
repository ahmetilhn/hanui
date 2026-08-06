/** WCAG kontrast hesabı — ölçüm, karar değil. */

/** `#rgb` / `#rrggbb` / `rgba(r, g, b, a)` → `{ r, g, b, a }` (0-255, 0-1). */
export const parseColor = value => {
  const text = String(value).trim();

  const rgba = text.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(',').map(part => Number(part.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  const hex = text.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map(character => character + character)
          .join('')
      : hex;

  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Ayrıştırılamayan renk: ${value}`);

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
    a: 1,
  };
};

/** Saydam katmanı opak zeminin üzerine düzler (alpha compositing, sRGB). */
export const flatten = (color, backdrop) => {
  if (color.a >= 1) return color;

  return {
    r: color.r * color.a + backdrop.r * (1 - color.a),
    g: color.g * color.a + backdrop.g * (1 - color.a),
    b: color.b * color.a + backdrop.b * (1 - color.a),
    a: 1,
  };
};

/** WCAG 2.x bağıl parlaklık. */
export const luminance = ({ r, g, b }) => {
  const channel = raw => {
    const value = raw / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/**
 * İki rengin kontrast oranı. `foreground` saydamsa `background` üzerine
 * düzlenir; `background` saydamsa `base` üzerine (varsayılan beyaz — bir
 * saydam zeminin arkasında en kötü hâlde sayfa durur).
 */
export const contrast = (foreground, background, base = '#ffffff') => {
  const backdrop = flatten(parseColor(background), parseColor(base));
  const front = flatten(parseColor(foreground), backdrop);

  const light = Math.max(luminance(front), luminance(backdrop));
  const dark = Math.min(luminance(front), luminance(backdrop));

  return (light + 0.05) / (dark + 0.05);
};

/** İki ondalık basamak; eşiğe çok yakın değerler yukarı yuvarlanıp geçmesin. */
export const round = ratio => Math.floor(ratio * 100) / 100;
