import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
