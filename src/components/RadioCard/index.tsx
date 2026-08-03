import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import type { CommonElementProps } from '../../types/common-element-props.type';

import styles from './index.module.scss';

type Props = {
  /** Radyo grubu adı — aynı gruptaki kartlar ok tuşlarıyla gezilir. */
  name: string;
  value: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  /** Zengin gövde: kartın içeriği çağırana aittir. */
  children: ReactNode;
} & CommonElementProps;

/**
 * Seçilebilir kart — zengin gövdeli radyo.
 *
 * <h3>Neden ayrı bir öğe</h3>
 * Varyant seçici ve hesap seçici aynı deseni elle kuruyordu: `<label>` + gizli
 * radyo + gövde + seçili/pasif durum matrisi. İki kopya çoktan ayrışmıştı —
 * biri odak halkasını metnin üstüne, diğeri hiç çizmiyordu; biri seçili zemini
 * boyuyor, diğeri boyamıyordu.
 *
 * <h3>Radyo GERÇEK, daire çizim</h3>
 * `<input type="radio">` görsel olarak gizlenir ama DOM'da kalır: ok
 * tuşlarıyla grup içinde gezinme, `Space` ile seçim ve ekran okuyucu duyurusu
 * tarayıcıdan gelir. Yerel daire bu boyutta bir kartta görsel olarak
 * kaybolduğu için işaret ayrıca çizilir (`__indicator`).
 *
 * <h3>Seçim üç sinyalle</h3>
 * Kenarlık + zemin tinti + dolan işaret aynı anda değişir. İşaretin dolu / boş
 * hâli bir BİÇİM farkıdır — renk tek başına anlam taşımaz (WCAG 1.4.1).
 *
 * <p>Odak halkası kartın kendisinde (`:has(:focus-visible)`): gizli girdiye
 * çizilen halka görünmüyor, yalnızca metne çizilen halka da kartın nerede
 * bittiğini söylemiyordu.
 *
 * <p>{@link Radio} yalın satır içindir, gövde taşıyamaz — ikisi karışmaz.
 */
const RadioCard: FC<Props> = ({
  name,
  value,
  isSelected,
  isDisabled,
  onChange,
  children,
  className,
  id,
  testId,
}) => (
  <label
    className={cx(
      styles.radioCard,
      isSelected && styles['radioCard--selected'],
      isDisabled && styles['radioCard--disabled'],
      className,
    )}
    data-testid={testId}
  >
    <input
      type="radio"
      id={id}
      name={name}
      value={value}
      checked={isSelected}
      disabled={isDisabled}
      onChange={() => onChange(value)}
      className={styles.radioCard__input}
    />
    <span className={styles.radioCard__indicator} aria-hidden />
    <span className={styles.radioCard__body}>{children}</span>
  </label>
);

export default memo(RadioCard) as typeof RadioCard;
