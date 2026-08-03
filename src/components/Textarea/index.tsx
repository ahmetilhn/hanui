import { forwardRef, memo, type TextareaHTMLAttributes } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { testId?: string };

/**
 * Çok satırlı metin girdisi.
 *
 * <p>Görünüm {@link Input} ile aynı gövdeden gelir: bir formda tek satırlı ve
 * çok satırlı alanlar yan yana durur, kenarlık ve odak davranışları ayrışırsa
 * form derlenmemiş görünür.
 *
 * <p>Yeniden boyutlandırma yalnızca <strong>dikey</strong>: yatayda büyütmek
 * alanı kapsayıcısının dışına taşırıp yerleşimi bozuyordu.
 */
const Textarea = /*#__PURE__*/ forwardRef<HTMLTextAreaElement, Props>(
  ({ className, rows = 4, testId, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cx(styles.textarea, className)}
      data-testid={testId}
      {...rest}
    />
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Textarea, 'Textarea')) as typeof Textarea;
