import { configureAxe } from 'jest-axe';

export const axe = configureAxe({
  rules: {
    region: { enabled: false },
    'page-has-heading-one': { enabled: false },
    'landmark-one-main': { enabled: false },
    'html-has-lang': { enabled: false },
    bypass: { enabled: false },

    'color-contrast': { enabled: false },
  },
});
