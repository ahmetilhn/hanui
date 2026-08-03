import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  /** Tam ad; baş harfler buradan üretilir ve görsel yoksa `alt` metnidir. */
  name: string;
  /**
   * Profil görseli. Verilmezse baş harf madalyonuna düşer — çağıran tarafın
   * koşul yazması gerekmez.
   */
  imageUrl?: string;
  /**
   * Baş harfleri büyütürken kullanılacak dil etiketi ("tr", "az").
   *
   * <p>Türkçede ZORUNLU: `toUpperCase()` "i" harfini "I" yapıyor ve "İlhan"ın
   * baş harfi "I" çıkıyor. `toLocaleUpperCase('tr')` doğru "İ" verir.
   * Verilmezse `labels.locale`, o da yoksa çalışma ortamının varsayılan dili.
   */
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
};

/**
 * Baş harfleri üretir: "Ahmet İlhan" → "Aİ".
 *
 * <p>Tek kelimelik adda ilk iki harf alınır; tek harflik bir madalyon boş
 * görünüyordu.
 */
const resolveInitials = (name: string, locale?: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';

  const letters =
    words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[words.length - 1][0]}`;

  return locale ? letters.toLocaleUpperCase(locale) : letters.toLocaleUpperCase();
};

/**
 * Adı SABİT bir renk kovasına eşler.
 *
 * <h3>Neden rastgele değil, neden hash</h3>
 * Aynı kişi her ekranda AYNI tonda görünmeli: bir listede yan yana duran on
 * kullanıcı, hepsi aynı gri madalyonken birbirinden ayırt edilemiyordu ve
 * renk her render'da değişseydi (rastgele) madalyon kimliği taşımak yerine
 * gürültü üretiyordu.
 *
 * <p>Karma basit ve KASITLI olarak basit: kriptografik bir dağılım gerekmiyor,
 * gereken tek şey aynı girdinin aynı çıktıyı vermesi. `charCodeAt` toplamı
 * kısa adlarda kümeleniyordu (djb2'nin `* 33` çarpanı bunu dağıtıyor).
 *
 * <h3>Renk tek başına KİMLİK taşımaz</h3>
 * Madalyonun içinde zaten baş harfler var ve yanında adın kendisi yazıyor.
 * Ton yalnızca bir tarama yardımı — renk körü bir kullanıcı için hiçbir bilgi
 * kaybı yok (WCAG 1.4.1).
 */
const resolveTone = (name: string, total: number): number => {
  let hash = 5381;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 33) ^ name.charCodeAt(index);

  return Math.abs(hash) % total;
};

/** Madalyon tonlarının sayısı — `_module.scss` içindeki kova sayısıyla AYNI. */
const TONE_COUNT = 6;

/**
 * Avatar — kullanıcı madalyonu.
 *
 * <h3>Görsel yoksa baş harf</h3>
 * Profil görseli olmayan bir sistemde baş harf madalyonu kimliği
 * <em>yeterince</em> taşır: kullanıcı hesap menüsünün en üstünde doğru hesapta
 * olduğunu görmek ister, fotoğrafını değil. `imageUrl` verildiğinde görsel
 * çizilir ve baş harf yedeğe düşer; çağıran tarafların değişmesi gerekmez.
 *
 * <h3>Ekran okuyucuya okunmaz</h3>
 * Madalyon `aria-hidden`: yanında zaten adın kendisi yazıyor. İkisini de
 * okumak "A İ Ahmet İlhan" gibi bir gürültü üretiyordu. Adın yanında
 * durmadığı bir yerde kullanılıyorsa çağıran taraf metni kendisi yazar.
 */
const Avatar: FC<Props> = ({ name, imageUrl, locale, size = 'md', className, testId }) => {
  const { labels } = useHanui();

  return (
    <span
      className={cx(
        styles.avatar,
        styles[`avatar--${size}`],
        /* Ton yalnizca BAS HARF madalyonunda: gorselin uzerine renk basmak
           fotografi bozuyordu. */
        !imageUrl && styles[`avatar--tone-${resolveTone(name, TONE_COUNT)}`],
        className,
      )}
      aria-hidden
      data-testid={testId}
    >
      {imageUrl ? (
        <img className={styles.avatar__image} src={imageUrl} alt="" />
      ) : (
        resolveInitials(name, locale ?? labels?.locale)
      )}
    </span>
  );
};

export default /*#__PURE__*/ memo(Avatar) as typeof Avatar;
