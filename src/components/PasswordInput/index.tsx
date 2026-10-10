import { FC, InputHTMLAttributes, memo, useState } from 'react';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import IconButton from '../IconButton';
import Input from '../Input';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Şifre gizliyken düğmenin erişilebilir adı. */
  showLabel?: string;
  /** Şifre görünürken düğmenin erişilebilir adı. */
  hideLabel?: string;
};

/**
 * Şifre girdisi — yanında göz düğmesi. iki tüketici uygulamada BİREBİR AYNI dosya
 * olarak duruyordu
 */
const PasswordInput: FC<Props> = ({ className, showLabel, hideLabel, ...rest }) => {
  const { labels } = useHanui();
  const [isVisible, setIsVisible] = useState(false);

  const toggleLabel = isVisible
    ? resolveLabel('PasswordInput.hideLabel', hideLabel, labels?.passwordHide)
    : resolveLabel('PasswordInput.showLabel', showLabel, labels?.passwordShow);

  return (
    <span className={styles.password}>
      <Input
        {...rest}
        className={`${styles.password__field} ${className ?? ''}`.trim()}
        type={isVisible ? 'text' : 'password'}
      />

      <IconButton
        className={styles.password__toggle}
        icon={isVisible ? <EyeSlashFill aria-hidden /> : <EyeFill aria-hidden />}
        label={toggleLabel}
        variant="ghost"
        size="sm"
        /* `tabIndex` DUSURULMEZ: klavye kullanicisi de sifresini gorebilmeli. */
        onClick={() => setIsVisible(current => !current)}
      />
    </span>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(PasswordInput, 'PasswordInput'),
) as typeof PasswordInput;
