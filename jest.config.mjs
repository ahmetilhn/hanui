/** Jest yapılandırması. */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '\\.(scss|css)$': '<rootDir>/__tests__/support/style-stub.js',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1',
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
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],

  /* KAPSAM YALNIZ UC SAF-MANTIK KATMANINDA OLCULUR. */
  collectCoverageFrom: [
    'src/helpers/**/*.ts',
    'src/hooks/**/*.ts',
    'src/theme/**/*.{ts,tsx}',
  ],

  /*
   * Esigi DUSUREREK yesile boyamak yasak. Tutmuyorsa davranisi kilitleyen
   * gercek bir test yazilir — kapsam bir hedef degil, testsiz kalan bir
   * katmani gorunur kilan bir olcum.
   */
  coverageThreshold: { global: { lines: 80 } },
};
