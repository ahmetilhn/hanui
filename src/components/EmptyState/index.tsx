import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Kullanıcının buradan çıkabileceği eylem. */
  action?: ReactNode;
  /** İkincil eylem veya ipucu. */
  secondaryAction?: ReactNode;
  /**
   * `error` — liste BOŞ değil, ÇEKİLEMEDİ.
   *
   * <p>İkisi ayrı durumlar ve ayrı görünmek zorundalar: ağ hatasını "kayıt
   * kalmamış" diye okuyan kullanıcı yanlış karar veriyor (ürün aramayı
   * bırakıyor, siparişinin silindiğini sanıyor). Varyant `role="alert"`
   * taşıyor ve tonu farklı — layout aynı kalıyor ki iki durum arasındaki
   * geçiş sıçramasın.
   *
   * <p>Ayrım ÖNCE bu bileşenin dışındaydı ("ağ hatasında bu bileşen
   * çizilmez") ve sonucu şuydu: her çağıran kendi hata kutusunu yazıyor,
   * kutular birbirinden farklı görünüyordu. Ayrım korunuyor — ama artık
   * BİLEŞENDE kodlu, çağıranın disiplinine bırakılmış değil.
   */
  tone?: 'empty' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/**
 * Boş durum.
 *
 * <h3>Neden her boş durum bir eylem taşır</h3>
 * "Sonuç bulunamadı" tek başına çıkmaz sokaktır. Kullanıcı o ekranda ne
 * yapacağını bilmeli: aramayı temizle, filtreyi kaldır, listeye dön. `action`
 * isteğe bağlı ama çağıran taraf onu vermezse kullanıcı tıkanır.
 *
 * <h3>BOŞ ile YÜKLENEMEDİ ayrı durumlardır</h3>
 * Ağ hatasını "kayıt kalmamış" diye okuyan kullanıcı yanlış karar veriyor.
 * İkisi `tone` ile ayrılıyor: `error` farklı bir ton taşıyor ve
 * `role="alert"` ile duyuruluyor, ama YERLEŞİM aynı — iki durum arasındaki
 * geçiş sıçramıyor.
 *
 * <p>Ayrım önce bu bileşenin DIŞINDAYDI ("ağ hatasında çizilmez") ve sonucu
 * şuydu: her çağıran kendi hata kutusunu yazıyor, kutular birbirinden farklı
 * görünüyordu. Ayrım korunuyor, kararın yeri değişti.
 */
const EmptyState: FC<Props> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  tone = 'empty',
  size = 'md',
  className,
  testId,
}) => (
  <div
    className={cx(styles.empty, styles[`empty--${size}`], styles[`empty--${tone}`], className)}
    /* Hata DUYURULUR: gormeyen kullanici icin sessizce degisen bir liste, hic
       degismemis demekti. Bos durum duyurulmaz — o beklenen bir sonuc. */
    role={tone === 'error' ? 'alert' : undefined}
    data-testid={testId}
  >
    {icon && <span className={styles.empty__icon}>{icon}</span>}
    <h3 className={styles.empty__title}>{title}</h3>
    {description && <p className={styles.empty__description}>{description}</p>}
    {(action || secondaryAction) && (
      <div className={styles.empty__actions}>
        {action}
        {secondaryAction}
      </div>
    )}
  </div>
);

export default /*#__PURE__*/ memo(EmptyState) as typeof EmptyState;
