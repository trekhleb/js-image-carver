// @see: https://tailwindcss.com/docs/configuration/
// @see: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  // Reminder! Tailwind can't recognise conditional classes when using purge.
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Roboto',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      boxShadow: {
        // The shadow-card class that is used for Cards.
        // @see: https://tailwindcss.com/docs/box-shadow
        card: '0 2px 1px -1px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
      },
      // Tailwinds typography customization
      // @see: https://github.com/tailwindlabs/tailwindcss-typography#customization
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // color: '#0FF',
            a: {
              color: theme('colors.red.600'),
              '&:hover': {
                color: theme('colors.red.500'),
              },
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    // eslint-disable-next-line global-require
    require('@tailwindcss/typography'),
  ],
};
