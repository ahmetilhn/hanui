/** Sınıf birleştiricinin kabul ettiği değerler. */
export type ClassValue = string | false | null | undefined;

/** Sınıf adı birleştirici. */
export const cx = (...values: ClassValue[]): string => {
  let result = '';

  for (const value of values) {
    if (!value) continue;
    result = result === '' ? value : `${result} ${value}`;
  }

  return result;
};
