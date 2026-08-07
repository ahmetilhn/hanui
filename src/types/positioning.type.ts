export type PositioningRect = { top: number; left: number; width: number; height: number };

export type PositioningState = {
  /** Yüzeye uygulanacak stil — `position: fixed` + hesaplanmış koordinat. */
  style: { position: 'fixed'; top: number; left: number };
  /** ÇÖZÜLMÜŞ kenar: çarpışma yüzünden tercih edilenin karşıtı olabilir. */
  side: PositionSide;
  /** İlk ölçüm yapıldı mı. Yapılmadan çizilen yüzey sol üst köşede parlıyor. */
  isPositioned: boolean;
};

export type PositioningOptions = {
  side?: PositionSide;
  align?: PositionAlign;
  /** Tetikleyici ile yüzey arasındaki boşluk (px). */
  offset?: number;
  /** Görünüm alanının kenarından bırakılacak asgari pay (px). */
  padding?: number;
  /** Kapalıyken ölçüm yapılmaz ve dinleyici kurulmaz. */
  isOpen: boolean;
};

/** Tercih edilen kenar boyunca hizalama. */
export type PositionAlign = 'start' | 'center' | 'end';

/** Yüzeyin tercih ettiği kenar. Yer yoksa karşıtına düşer. */
export type PositionSide = 'top' | 'bottom' | 'left' | 'right';
