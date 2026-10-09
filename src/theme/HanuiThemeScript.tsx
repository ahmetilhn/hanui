'use client';

import { type FC } from 'react';

import { themeBootScript } from '../helpers/theme.helper';

type Props = {
  /** Kullanıcının seçiminin tutulduğu `localStorage` anahtarı. */
  storageKey: string;
};

/**
 * İLK BOYAMADAN ÖNCE tema — `<head>` içine, sunucu düzeninde.
 *
 * Kayıtlı açık seçimi (`light` / `dark`) `<html data-hanui-theme>`e yazar; kayıt yoksa sistem
 * tercihi izlenir. Sunucu çıktısındaki satır içi betik HTML ayrıştırılırken çalışır; React onu
 * istemcide YENİDEN çalıştırmaz.
 *
 * ⚠ BİR BİLEŞEN, fonksiyon değil: paket `'use client'` taşıdığı için dışa verilen düz bir
 * fonksiyon Next'in sunucu bileşeninde ÇAĞRILAMIYOR ("Attempted to call … from the server").
 * Bileşen ise sunucuda da çizilir. Bu yüzden 5.1 taslağındaki `themeBootScript()` dışa verilmedi.
 * @example <head><HanuiThemeScript storageKey="theme" /></head>
 */
const HanuiThemeScript: FC<Props> = ({ storageKey }) => (
  <script dangerouslySetInnerHTML={{ __html: themeBootScript({ storageKey }) }} />
);

export default HanuiThemeScript;
