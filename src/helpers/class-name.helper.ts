import { ClassValue } from '@/types/common-element-props.type';

/** Sınıf adı birleştirici. */
export const cx = (...values: ClassValue[]): string => {
  let result = '';

  for (const value of values) {
    if (!value) continue;
    result = result === '' ? value : `${result} ${value}`;
  }

  return result;
};
