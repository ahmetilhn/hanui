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

  /*
   * KAPSAM TUM `src/` UZERINDE OLCULUR. `index.ts` disarida: saf re-export, calistirilacak bir
   * satiri yok ve paydada durmasi orani mekanik olarak sisirir.
   * ⚠ Payda bir donem yalniz `helpers`+`hooks`+`theme` idi — 17 dosya, 469 satir.
   */
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
    '!src/**/*.d.ts',
  ],

  /*
   * Esikler OLCULEN degerin ~2-3 puan altina kuruldu (2026-08-15 olcumu: satir 87,51 · ifade 84,57
   * · fonksiyon 75,10 · dal 73,04).
   * ⚠ DORT METRIGIN DE OLMASI ZORUNLU.
   */
  coverageThreshold: {
    /* ⚠ Esikler OLCULENIN ~2 puan altinda — regresyon kapisi, hedef degil. */
    global: { lines: 89, statements: 86, functions: 80, branches: 75 },
  },
};
