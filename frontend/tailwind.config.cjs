const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './index.html',                 
    './src/**/*.{js,ts,jsx,tsx}',   
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  safelist: [
    'hidden',
    { pattern: /h-\d+/ }
  ],

  corePlugins: {
    height: true
  },

  plugins: []
};