/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brazilian flag inspired palette (mapped onto "amber" so existing
        // amber-* utility classes render green/gold instead of brown)
        amber: {
          50: '#FFFDE7',
          100: '#FFF3B0',
          500: '#FFD400',
          600: '#16A34A',
          700: '#15803D',
          800: '#14532D',
        },
      },
    },
  },
  plugins: [],
};
