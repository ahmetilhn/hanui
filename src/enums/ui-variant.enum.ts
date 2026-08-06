/** Düğme ve eylem varyantları. */
enum UIVariant {
  /** Ekranın tek beklenen eylemi: <strong>nötr grafit</strong> dolgu. */
  PRIMARY = 'PRIMARY',
  /** <strong>Dönüşüm eylemi — ve yalnızca o.</strong> */
  CART = 'CART',
  /** Nötr ikincil eylem: gri kenarlık, koyu metin ("Vazgeç"). */
  SECONDARY = 'SECONDARY',
  /**
   * Mavi çerçeveli eylem — teşvik edilen ama birincil olmayan gezinme
   * ("Tümünü gör").
   */
  OUTLINE = 'OUTLINE',
  /** Vurgu bandı içindeki eylem: bandın kendi yüzey merdivenini kullanır. */
  DARK = 'DARK',
  /** Nötr yüzey dolgusu; kart içi ikincil eylem. */
  LIGHT = 'LIGHT',
  /** Zeminsiz eylem: araç çubuğu ve satır içi ikincil işler. */
  GHOST = 'GHOST',
  /** Yıkıcı eylem: silme onayı. Durum tinti değil, gerçek bir dolgu. */
  DANGER = 'DANGER',
}

export default UIVariant;
