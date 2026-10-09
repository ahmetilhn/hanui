/** Düğme ve eylem varyantları. */
enum UIVariant {
  /** Ekranın tek beklenen eylemi: çam dolgu (koyu temada mint sınırla). Bir ekranda TEK. */
  PRIMARY = 'PRIMARY',
  /** Dönüşüm eylemi — ve yalnızca o. */
  CART = 'CART',
  /** Nötr ikincil eylem: gri kenarlık, koyu metin ("Vazgeç"). */
  SECONDARY = 'SECONDARY',
  /** Mürekkep çerçeveli eylem — teşvik edilen ama birincil olmayan gezinme ("Tümünü gör"). */
  OUTLINE = 'OUTLINE',
  /** Vurgu bandı içindeki eylem: bandın kendi yüzey merdivenini kullanır. */
  DARK = 'DARK',
  /** Nötr yüzey dolgusu; kart içi ikincil eylem. */
  LIGHT = 'LIGHT',
  /** Zeminsiz eylem: araç çubuğu ve satır içi ikincil işler. */
  GHOST = 'GHOST',
  /** Yıkıcı eylem: silme onayı. */
  DANGER = 'DANGER',
}

export default UIVariant;
