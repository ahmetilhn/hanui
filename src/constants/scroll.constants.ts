/**
 * Sona YAPIŞIK sayılma payı (px). Kullanıcı bu kadar yukarıdaysa akış onu aşağı çekmeye devam eder;
 * daha yukarı kaydırdıysa okuduğu yerde bırakılır.
 * ⚠ 0 değil: akan içerik her karede birkaç piksel büyüyor ve kesirli yerleşimde kutu sona tam
 * oturmuyor — sıfır pay, kullanıcı hiç kaydırmadan "bıraktı" sayılıyordu.
 */
export const STICK_TO_END_THRESHOLD = 80;
