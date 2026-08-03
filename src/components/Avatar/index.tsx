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
      className={cx(styles.avatar, styles[`avatar--${size}`], className)}
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

export default memo(Avatar) as typeof Avatar;
