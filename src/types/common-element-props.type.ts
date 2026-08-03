/**
 * Her bileşenin kabul ettiği ortak kanca noktaları.
 *
 * <p>`testId` `data-testid` olarak çizilir. Test kancasını prop olarak
 * geçirmek yerine `className`e bir işaret koymak da mümkündü ama sınıf adları
 * derleme sırasında karıştırılıyor: testin ona tutunması, kütüphane sürüm
 * atladığında sessizce kopuyordu.
 */
export type CommonElementProps = Partial<{
  className: string;
  id: string;
  testId: string;
}>;
