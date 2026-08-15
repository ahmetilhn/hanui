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
  /** Baş harfleri büyütürken kullanılacak dil etiketi ("tr", "az"). */
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
};

/** Baş harfleri üretir: "Ahmet İlhan" → "Aİ". */
const resolveInitials = (name: string, locale?: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';

  const letters =
    words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[words.length - 1][0]}`;

  return locale ? letters.toLocaleUpperCase(locale) : letters.toLocaleUpperCase();
};

/** Adı SABİT bir renk kovasına eşler. */
const resolveTone = (name: string, total: number): number => {
  let hash = 5381;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 33) ^ name.charCodeAt(index);

  return Math.abs(hash) % total;
};

/** Madalyon tonlarının sayısı — `_module.scss` içindeki kova sayısıyla AYNI. */
const TONE_COUNT = 6;

/** Avatar — kullanıcı madalyonu. */
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
      /*
       * ⚠ `aria-hidden` KALDIRILDI. Kök üzerindeki `aria-hidden` yalnızca
       * madalyonu değil KİŞİNİN ADINI da erişilebilirlik ağacından çıkarıyordu;
       * `name` prop'unun kendi dokümantasyonu (`:9`) onu "görsel yoksa `alt`
       * metnidir" diye tanımladığı hâlde o metin hiçbir zaman duyurulmuyordu.
       * Ölçülen sonuç: yalnızca avatar çizilen bir kullanıcı listesi ekran
       * okuyucuda TAMAMEN BOŞ görünüyordu.
       *
       * Ad `role="img"` + `aria-label` ile taşınır: baş harfler ("AY") görsel
       * bir kısaltma, okunması gereken şey tam ad.
       */
      role="img"
      aria-label={name}
      data-testid={testId}
    >
      {imageUrl ? (
        /* `alt=""`: ad zaten kökte `aria-label` ile duyuruluyor, iki kez okunmasın. */
        <img className={styles.avatar__image} src={imageUrl} alt="" />
      ) : (
        resolveInitials(name, locale ?? labels?.locale)
      )}
    </span>
  );
};

export default /*#__PURE__*/ memo(Avatar) as typeof Avatar;
