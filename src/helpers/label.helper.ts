/** Metin çözümlemesi: prop → sağlayıcı config'i → geliştirme uyarısı. */

import type { Formatter } from '@/types/theme.type';

/* Uyari ANAHTAR BASINA bir kez verilir. */
const warned = new Set<string>();

/** Uyarı durumu testler arasında sızmamalı; her test kendi durumundan başlar. */
export const resetLabelWarnings = (): void => warned.clear();

/**
 * Verilen metni çözer.
 *
 * @param key Uyarıda gösterilecek yol (`Modal.closeLabel`).
 * @param values Öncelik sırasına göre adaylar: prop önce, config sonra.
 */
export const resolveLabel = (key: string, ...values: (string | undefined)[]): string => {
  for (const value of values) if (value !== undefined) return value;

  if (process.env.NODE_ENV !== 'production' && !warned.has(key)) {
    warned.add(key);
    console.error(
      `[hanui] Eksik metin: ${key}. Prop olarak geçin ya da ` +
        '<HanuiProvider labels={…}> içinde bir kez tanımlayın. ' +
        'Metinsiz bırakılan öğe ekran okuyucuda adsız kalır.',
    );
  }

  return '';
};

/** Biçimlendirici çözümü — değere bağlı metinler için. */
export const resolveFormatter = <TArgs extends unknown[]>(
  key: string,
  formatter: Formatter<TArgs> | undefined,
  ...args: TArgs
): string => {
  if (formatter) return formatter(...args);

  return resolveLabel(key);
};
