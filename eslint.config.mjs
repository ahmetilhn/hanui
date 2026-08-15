import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jestPlugin from 'eslint-plugin-jest';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      /*
       * ⚠ `globals` LISTESI YOK ve olmamali. Onu okuyan tek kural `no-undef`
       * ve o kural asagida KAPALI (TypeScript tanimsiz tanitlayiciyi zaten
       * derleme aninda yakaliyor; typescript-eslint de TS dosyalarinda
       * `no-undef`i kapatmayi acikca oneriyor).
       *
       * Bir donem burada 21 DOM tipi ELLE listeliydi ve hicbir ise
       * yaramiyordu: her yeni DOM tipi kullanildiginda lint yapilandirmasini
       * acmak gerekiyor SANILIYORDU, oysa liste okunmuyordu bile.
       */
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'error',
    },
  },
  {
    /*
     * ⚠ TEST DOSYALARI DA LINT EDILIR. Bu blok bir donem VARDI ama
     * `parser` TASIMIYORDU ve `lint` betigi yalnizca `src`i gecirdigi icin
     * hic calismamisti — olculdu: kapsam `__tests__`e genisletildiginde
     * 40 dosya `Parsing error: Unexpected token :` veriyordu, yani TS
     * dosyalari duz JS olarak ayristirilmaya calisiliyordu. 7.000 satirlik
     * test kodu hicbir kurala tabi degildi.
     */
    files: ['__tests__/**/*.{ts,tsx}'],
    /*
     * ⚠ Playwright spec'leri HARIC. `__tests__/e2e/` Jest degil Playwright
     * kosuyor ve iki API ayni adlari farkli sozlesmelerle tasiyor — en somut
     * fark: Playwright'ta `expect(deger, 'mesaj')` GECERLI, Jest'te degil.
     * `jest/valid-expect` e2e dosyalarina uygulanirsa dogru kodu yanlis
     * isaretler.
     */
    ignores: ['__tests__/e2e/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin, jest: jestPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      /*
       * ⚠ JEST KURALLARI, YAPILAN BIR HATADAN SONRA EKLENDI. Test kodu bu
       * turda ilk kez lint kapsamina girdi ve ilk yazilan `Menu` testinde
       * `expect(deger, 'mesaj')` — yani Vitest/Playwright bicimi — kullanildi.
       * Jest bunu "Expect takes at most one argument" ile CALISMA ZAMANINDA
       * reddediyor; yani hata ancak test kosunca goruluyordu. `valid-expect`
       * onu yazarken yakalar.
       *
       * `no-focused-tests` ayni siniftan ve daha sinsi: commit'lenmis bir
       * `it.only` CI'yi yesil birakir ama diger her testi SESSIZCE atlar.
       */
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/valid-expect': 'error',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-conditional-expect': 'error',
      /* Bu depo `it`/`test` ikisini de kullaniyor; tek bicime zorlamak
         mevcut 36 dosyayi gerekcesiz degistirirdi. */
      'jest/consistent-test-it': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      /*
       * ⚠ Testte `any` UYARI, uretimde HATA. Bir testin bilincli olarak
       * bozuk bir sekli zorlamasi mesru (`as unknown as X` ile sozlesme
       * disi girdi uretmek); uretim kodunda ayni sey borctur.
       */
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    /*
     * ⚠ KAPILARI ZORLAYAN BETIKLER DE LINT EDILIR. `scripts/` bir donem lint
     * kapsaminin TAMAMEN disindaydi: `check-api`, `check-contrast`,
     * `check-animations`, `build-tokens` — yani depodaki her mekanik kurali
     * uygulayan kod, hicbir kurala tabi degildi. Node ortami burada acikca
     * bildirilir; `no-undef` ACIK kalir cunku bunlar tip denetiminden gecen
     * TS degil, duz `.mjs` dosyalari — tanimsiz bir tanitlayiciyi yakalayan
     * baska hicbir katman yok.
     */
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
      },
    },
  },
  {
    /*
     * Jest'in `moduleNameMapper`i tarafindan yuklenen CommonJS saplamasi.
     * ⚠ Bu aciklama bir donem `ignores` blogunun uzerindeydi ama oradaki yol
     * (`src/test/**`) bu dosyayi GOSTERMIYORDU — saplama `__tests__/support/`
     * altinda. Dosya ignore edilmek yerine DOGRU BICIMDE tanimlanir: hala
     * lint edilir, yalnizca CommonJS oldugu bildirilir.
     */
    files: ['__tests__/support/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'writable', require: 'readonly' },
    },
  },
  prettier,
  {
    /* ⚠ `src/test/**` KALDIRILDI: o dizin bu depoda hic var olmadi. */
    ignores: ['build/**', 'build-playground/**', 'node_modules/**', 'coverage/**'],
  },
];
