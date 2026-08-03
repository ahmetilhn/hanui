/**
 * Jest yapılandırması.
 *
 * <p>SCSS modülleri bir saplamaya (`identity-obj-proxy` yerine kendi
 * proxy'miz) çözülür: testlerde `styles.button--primary` gibi bir erişim
 * sınıfın <em>kendi adını</em> döndürür, böylece bir test "birincil varyant
 * çizildi mi" sorusunu sınıf adıyla sorabilir. Boş nesne döndüren bir saplama
 * bu soruyu imkânsız kılıyordu.
 */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.(scss|css)$': '<rootDir>/src/test/style-stub.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          target: 'ES2020',
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@ahmetilhn)/)'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}'],

  /*
   * KAPSAM YALNIZ UC SAF-MANTIK KATMANINDA OLCULUR.
   *
   * `helpers/`, `hooks/` ve `theme/`: karari bu uc katman veriyor — token
   * cozumlemesi, tema yazimi, metin normalizasyonu, odak kurallari. Bir hata
   * buraya girdiginde 46 bilesenin hepsinde ayni anda gorunur.
   *
   * BILESENLERE ESIK KONMAZ. Bir yuzde hedefi, bilesen tarafinda "cizildi mi"
   * diye soran anlamsiz render testleri uretir: sayi yukselir, gercek risk
   * (klavye yolu, durum uclusu, erisilebilir ad) kapsamsiz kalir. Bilesenlerin
   * nobetcisi kapsam degil DAVRANIS testleri — `a11y.test.tsx` ve
   * `keyboard.test.tsx` her disa verilen bileseni ve her tus matrisini
   * kilitliyor; onlar bir yuzdeye bakmadan calisiyor.
   */
  collectCoverageFrom: [
    'src/helpers/**/*.ts',
    'src/hooks/**/*.ts',
    'src/theme/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
  ],

  /*
   * Esigi DUSUREREK yesile boyamak yasak. Tutmuyorsa davranisi kilitleyen
   * gercek bir test yazilir — kapsam bir hedef degil, testsiz kalan bir
   * katmani gorunur kilan bir olcum.
   */
  coverageThreshold: { global: { lines: 80 } },
};
