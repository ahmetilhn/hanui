import { FC, memo, useEffect, useState } from 'react';

import { named } from '../../helpers/component.helper';

import ToastHub from '../Toast';

/**
 * `ToastHub`ı montajdan SONRA çizen sarmalayıcı.
 *
 * ⚠ SUNUCUDA ÇİZİLMEMESİ ŞART. `ToastHub` portal kullanıyor ve `document`
 * olmadan çalışamaz; sunucu tarafında çizilen bir ağaçta doğrudan kullanmak
 * hidrasyon uyuşmazlığı üretir. Next.js kullanan iki uygulamada da aynı
 * sarmalayıcı BİREBİR AYNI dosya olarak yazılmıştı — çözüm uygulamaya değil
 * bileşene ait.
 */
const ToastPortal: FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return <ToastHub />;
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ToastPortal, 'ToastPortal'),
) as typeof ToastPortal;
