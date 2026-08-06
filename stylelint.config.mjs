/** SCSS DENETÇİSİ. */
export default {
  extends: ['stylelint-config-standard-scss'],

  rules: {
    /*
     * BICIM KURALLARI KAPALI — Prettier'in isi.
     * Acik birakildiklarinda `npm run format` ve `npm run lint:css` birbirinin
     * ciktisini bozuyordu.
     */
    'scss/dollar-variable-pattern': null,
    'scss/at-mixin-pattern': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'scss/double-slash-comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'comment-empty-line-before': null,
    'no-descending-specificity': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'value-keyword-case': null,
    'scss/no-global-function-names': null,
    'media-feature-range-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'scss/comment-no-empty': null,
    'length-zero-no-unit': null,
    'scss/at-if-no-null': null,
    'selector-not-notation': null,
    'scss/dollar-variable-empty-line-before': null,
    /* CSS modulunun `:global()` kacisi; stylelint onu bilmiyor. */
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],

    /* HAREKET OLCEGI KILIDI. */
    'declaration-property-value-disallowed-list': [
      {
        outline: ['/^(?!none$).+$/'],
        'transition-duration': ['/[0-9]\\s*m?s/'],
        'animation-duration': ['/[0-9]\\s*m?s/'],
        transition: ['/[0-9]+\\.?[0-9]*\\s*m?s/'],
        animation: ['/[0-9]+\\.?[0-9]*\\s*m?s/'],
      },
      {
        message:
          'Ham sure/`outline` degeri yasak. Sure `$duration-*` token`larindan, ' +
          'odak halkasi `focus-ring` mixin`inden gelir.',
      },
    ],

    /* `outline-offset` tek basina anlamsiz: halkayi cizen kural onu da yazar. */
    'property-disallowed-list': [
      ['outline-offset', 'outline-color', 'outline-width', 'outline-style'],
      {
        message: 'Odak halkasinin butun parcalari `focus-ring` mixin`inde tanimli.',
      },
    ],
  },

  overrides: [
    {
      /*
       * Halkanin KENDISI burada tanimli; ayrica `base.scss` zorlanmis renk
       * kipinde (`forced-colors: active`) sistem renkleriyle bir yedek
       * ciziyor — orada `box-shadow` cizilmedigi icin `outline` TEK secenek.
       */
      files: ['src/styles/_mixins.scss', 'src/styles/base.scss'],
      rules: {
        'declaration-property-value-disallowed-list': null,
        'property-disallowed-list': null,
      },
    },
  ],

  ignoreFiles: ['**/*.generated.scss', 'build/**', 'build-playground/**', 'node_modules/**'],
};
