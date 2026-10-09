import { type FC, memo } from 'react';

import { ScrollArea } from '@ahmetilhn/hanui';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  text: string;
  /** Kaydırılabildiğinde bölgenin okunan adı ("Akıl yürütme"). */
  label: string;
  /** Kutunun tavanı (px); akan metin bu yükseklikte sona yapışık kayar. */
  maxHeight?: number;
  className?: string;
  testId?: string;
};

/** Akıl yürütme metni — yüksekliği sınırlı, akarken sona yapışık (`ScrollArea isFollowingEnd`). */
const ReasoningText: FC<Props> = ({ text, label, maxHeight = 180, className, testId }) => (
  <ScrollArea
    className={cx(styles.text, className)}
    label={label}
    maxHeight={maxHeight}
    hasFade
    isFollowingEnd
    testId={testId}
  >
    <p className={styles.text__body}>{text}</p>
  </ScrollArea>
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ReasoningText, 'ReasoningText'),
) as typeof ReasoningText;
