'use client';

import { forwardRef, type InputHTMLAttributes, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> & {
  /** Anahtarın görünür etiketi. */
  label: ReactNode;
  /** Etiketin altındaki açıklama; `aria-describedby` ile bağlanır. */
  hint?: string;
  /** Etiket anahtarın SOLUNDA durur — ayar listelerinin yaygın düzeni. */
  isLabelFirst?: boolean;
  testId?: string;
};

/**
 * Anahtar (switch) — <strong>anında</strong> uygulanan aç/kapa.
 *
 * <h3>`Checkbox` ile farkı: NE ZAMAN etkili olduğu</h3>
 * İkisi de iki durumlu ve ikisi de yerel `<input type="checkbox">` üzerine
 * kurulu; ayrım görünüşte değil ZAMANLAMADA:
 *
 * <ul>
 *   <li>{@link Checkbox} bir formda <strong>gönderilecek</strong> seçimdir.
 *       "Sözleşmeyi okudum" işaretlendiğinde hiçbir şey olmaz; karar
 *       "Kaydet"e basıldığında geçerli olur. Geri almak için işareti kaldırıp
 *       yeniden göndermek gerekir.</li>
 *   <li><b>`Switch` ANINDA uygulanır.</b> "Kampanya bildirimleri" açıldığı
 *       anda sunucuya gider. Kaydet düğmesi yoktur, olmamalıdır da —
 *       kullanıcı anahtarı çevirdikten sonra bir düğme aramak zorunda
 *       kalıyordu.</li>
 * </ul>
 *
 * <p>Ayrım keyfi değil ekran okuyucuda DUYULUYOR: `role="switch"` "açık/kapalı"
 * diye okunur, onay kutusu "işaretli/işaretsiz" diye. İkisi kullanıcıya farklı
 * bir söz veriyor.
 *
 * <h3>Yerel öğe korunur</h3>
 * `<input type="checkbox" role="switch">` — `Space` ile değiştirme, `Tab`
 * sırası, form gönderimine katılma ve `:disabled` semantiği tarayıcıdan gelir.
 * `<div role="switch" tabindex="0">` yazmak bunların hepsini elle yeniden
 * kurmak demekti.
 *
 * <h3>Durum RENKLE ANLATILMAZ</h3>
 * Açık ve kapalı hâl arasındaki fark yalnızca zemin rengi olsaydı renk körü
 * bir kullanıcı için iki durum aynı görünürdü (WCAG 1.4.1). Kulp KONUM
 * değiştiriyor — bu bir biçim farkı — ve zorlanmış renk kipinde çerçeve +
 * konum tek başına yeterli kalıyor.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Space`</td><td>durumu değiştirir</td></tr>
 * </table>
 *
 * @example
 * <Switch
 *   label="Kampanya bildirimleri"
 *   hint="E-posta ile ayda en fazla iki ileti"
 *   checked={isSubscribed}
 *   onChange={event => subscribe(event.target.checked)}
 * />
 */
const Switch = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, isLabelFirst, className, id, testId, ...rest }, ref) => (
    <label
      className={cx(styles.switch, isLabelFirst && styles['switch--labelFirst'], className)}
      data-testid={testId}
    >
      <input
        ref={ref}
        type="checkbox"
        /*
         * `role="switch"` YEREL onay kutusunun UZERINE yazilir: davranis
         * checkbox'tan gelir, DUYURU switch olur. Ekran okuyucu "acik/kapali"
         * der; "isaretli" demek kullaniciya yanlis bir soz veriyordu.
         */
        role="switch"
        id={id}
        className={styles.switch__input}
        {...rest}
      />

      {/* Kulbun tasiyicisi; gorsel durum tamamen CSS'te. */}
      <span className={styles.switch__track} aria-hidden>
        <span className={styles.switch__thumb} />
      </span>

      <span className={styles.switch__text}>
        <span className={styles.switch__label}>{label}</span>
        {hint && <span className={styles.switch__hint}>{hint}</span>}
      </span>
    </label>
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Switch, 'Switch')) as typeof Switch;
