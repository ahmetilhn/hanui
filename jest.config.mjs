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
   * KAPSAM TUM `src/` UZERINDE OLCULUR.
   *
   * ⚠ Payda bir donem yalniz `helpers`+`hooks`+`theme` idi — 17 dosya,
   * 469 satir. Kutuphanenin ASIL yuzeyi olan 64 bilesen (125 dosya,
   * ~8.000 satir) paydanin DISINDAYDI, yani `lines: 80` kapisi kaynagin
   * %4,4'unu olcup gerisi hakkinda hicbir sey soylemiyordu. Olculdu:
   * dar paydada satir %97,22, genis paydada **%87,51**.
   *
   * `index.ts` disarida: saf re-export, calistirilacak bir satiri yok ve
   * paydada durmasi orani mekanik olarak sisirir.
   */
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
    '!src/**/*.d.ts',
  ],

  /*
   * Esikler OLCULEN degerin ~2-3 puan altina kuruldu (2026-08-15 olcumu:
   * satir 87,51 · ifade 84,57 · fonksiyon 75,10 · dal 73,04). Bu bir HEDEF
   * degil GERILEME kapisi: kapsam dusemez, ama kucuk dalgalanmada kirmizi
   * yanmaz.
   *
   * ⚠ DORT METRIGIN DE OLMASI ZORUNLU. Yalniz `lines` kilitliyken bir
   * bilesenin RENDER edilmesi satirlari isaretliyor ama tiklama/klavye
   * dallari hic kosmuyor: bugunku fark tam olarak bu — satir %87,5 iken
   * fonksiyon %75,1 ve dal %73,0. Test acigi "hangi dosya" degil "hangi
   * DAVRANIS" sorusunda ve onu yalnizca `functions`/`branches` gosterir.
   *
   * Esigi DUSUREREK yesile boyamak yasak. Tutmuyorsa davranisi kilitleyen
   * gercek bir test yazilir.
   */
  coverageThreshold: {
    /*
     * ⚠ Esikler OLCULENIN ~2 puan altinda — regresyon kapisi, hedef degil.
     * Olculdu (2026-08-16, `Toast` + `Select` + `FileUpload` testleri
     * eklendikten sonra): satir 91,67 · ifade 88,61 · fonksiyon 83,02 ·
     * dal 77,12. Onceki degerler (85/82/72/70) o testlerden ONCEKI olcume
     * gore konmustu ve artik dort puanlik bir bosluk birakiyordu.
     */
    global: { lines: 89, statements: 86, functions: 80, branches: 75 },
  },
};
