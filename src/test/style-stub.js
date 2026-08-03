/*
 * SCSS modülü saplaması.
 *
 * Erişilen her anahtar KENDI ADINI döndürür (`styles['button--primary']` →
 * `'button--primary'`). Boş nesne döndüren bir saplamada bileşen sınıfsız
 * çiziliyor ve "hangi varyant çizildi" sorusu testte sorulamıyordu.
 */
module.exports = new Proxy(
  {},
  {
    get: (_target, key) => (key === '__esModule' ? false : String(key)),
  },
);
