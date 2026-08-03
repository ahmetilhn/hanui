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
};
