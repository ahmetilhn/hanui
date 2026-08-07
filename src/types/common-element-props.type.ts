/** Her bileşenin kabul ettiği ortak kanca noktaları. */
export type CommonElementProps = Partial<{
  className: string;
  id: string;
  testId: string;
}>;

/** Sınıf birleştiricinin kabul ettiği değerler. */
export type ClassValue = string | false | null | undefined;
