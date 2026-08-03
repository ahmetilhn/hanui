/**
 * Düğme ve eylem varyantları.
 *
 * <p>Sıra bir <strong>vurgu hiyerarşisi</strong>dir: bir ekranda tek bir
 * `PRIMARY` bulunur. İki dolu düğme yan yana durduğunda hiçbiri öne çıkmaz ve
 * kullanıcı hangisinin beklenen eylem olduğunu bilemez.
 *
 * <h3>Doygun dolgu = tıklanabilir</h3>
 * Bu kuralın karşılığı: durum etiketleri (rozet, uyarı) her zaman tint
 * zeminlidir, eylemler her zaman dolgulu veya çerçevelidir. İkisi karışırsa
 * kullanıcı bir durum etiketine tıklamayı dener.
 */
enum UIVariant {
  /**
   * Ekranın tek beklenen eylemi: <strong>nötr grafit</strong> dolgu.
   *
   * <p>`CART` DEĞİL. Doygun turuncu tek bir dönüşüm noktasına ayrıldı; her
   * dolu düğmeyi o renge boyamak tekilliği yok eder ve kullanıcı hangi
   * turuncunun dönüşüm olduğunu bilemez.
   */
  PRIMARY = 'PRIMARY',
  /**
   * <strong>Dönüşüm eylemi — ve yalnızca o.</strong>
   *
   * <p>Ekranda görünen tek doygun turuncu. Favori, karşılaştır, paylaş,
   * filtrele hepsi nötr veya mavidir. Bir kampanya bandında bu ton
   * kullanılırsa o ekranda dönüşüm düğmesi `PRIMARY`'ye çevrilir — ikisi aynı
   * anda olmaz.
   *
   * <p>Adı domain'den geliyor (kaynak sistemde "sepete ekle") ve
   * kasıtlı korundu: bir ekranda kaç tane olabileceğini adın kendisi
   * söylüyor. `ACCENT` deseydi hiyerarşi bilgisi kaybolurdu.
   */
  CART = 'CART',
  /** Nötr ikincil eylem: gri kenarlık, koyu metin ("Vazgeç"). */
  SECONDARY = 'SECONDARY',
  /**
   * Mavi çerçeveli eylem — teşvik edilen ama birincil olmayan gezinme
   * ("Tümünü gör").
   *
   * <p>Çerçeveli, dolgulu değil: mavi gezinme ve keşif rengidir; dolu mavi
   * düğme onu bir dönüşüm noktası gibi gösterip `CART` ile yarışıyordu.
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
