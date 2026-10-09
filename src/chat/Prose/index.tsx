import { type FC, type HTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  testId?: string;
};

/**
 * Uzun metin kabı — markdown çıktısının (başlık, paragraf, liste, alıntı, tablo, satır içi kod,
 * bağlantı, formül) tipografisi.
 *
 * ⚠ AYRIŞTIRICI İÇERMEZ: `react-markdown`, `remark`/`rehype` eklentileri ve KaTeX tüketicide kalır;
 * hanui yalnızca çıktının nasıl göründüğünü verir (`linkComponent` ile aynı desen). Bir UI paketinin
 * markdown ayrıştırıcısı taşıması, Hanparça'nın hiç kullanmadığı yüzlerce kB demek.
 */
const Prose: FC<Props> = ({ className, testId, ...rest }) => (
  <div className={cx(styles.prose, className)} data-testid={testId} {...rest} />
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Prose, 'Prose')) as typeof Prose;
