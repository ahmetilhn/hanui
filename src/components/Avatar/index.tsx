import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

export type AvatarShape = 'circle' | 'rounded';

/**
 * `auto`: baş harf madalyonu addan SABİT bir kovaya boyanır. `brand`: marka madalyonu — çam zemin,
 * mint işaret, iki temada aynı (logo kuralı; asistanın avatarı, boş sohbetin karosu).
 */
export type AvatarTone = 'auto' | 'brand';

type Props = {
  /** Tam ad; baş harfler buradan üretilir ve her durumda okunan addır (`aria-label`). */
  name: string;
  /** Profil görseli. */
  imageUrl?: string;
  /** Baş harf yerine ikon (marka işareti, sistem kullanıcısı). Görselden önce gelmez. */
  icon?: ReactNode;
  shape?: AvatarShape;
  tone?: AvatarTone;
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
const Avatar: FC<Props> = ({
  name,
  imageUrl,
  icon,
  locale,
  size = 'md',
  shape = 'circle',
  tone = 'auto',
  className,
  testId,
}) => {
  const { labels } = useHanui();

  return (
    <span
      className={cx(
        styles.avatar,
        styles[`avatar--${size}`],
        shape === 'rounded' && styles['avatar--rounded'],
        tone === 'brand' && styles['avatar--brand'],
        /*
         * Karma ton yalnizca BAS HARF madalyonunda: gorselin uzerine renk basmak fotografi bozuyordu,
         * ikon ise bir kisi degil.
         */
        tone === 'auto' &&
          !imageUrl &&
          !icon &&
          styles[`avatar--tone-${resolveTone(name, TONE_COUNT)}`],
        className,
      )}
      /*
       * Ad `role="img"` + `aria-label` ile taşınır: baş harfler ("AY") görsel bir kısaltma,
       * okunması gereken şey tam ad.
       * ⚠ `aria-hidden` KALDIRILDI. Kök üzerindeki `aria-hidden` yalnızca madalyonu değil KİŞİNİN
       * ADINI da erişilebilirlik ağacından çıkarıyordu
       */
      role="img"
      aria-label={name}
      data-testid={testId}
    >
      {imageUrl ? (
        /* `alt=""`: ad zaten kökte `aria-label` ile duyuruluyor, iki kez okunmasın. */
        <img className={styles.avatar__image} src={imageUrl} alt="" />
      ) : icon ? (
        <span className={styles.avatar__icon} aria-hidden>
          {icon}
        </span>
      ) : (
        resolveInitials(name, locale ?? labels?.locale)
      )}
    </span>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Avatar, 'Avatar')) as typeof Avatar;
