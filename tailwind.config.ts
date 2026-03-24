import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#08070a',
        surface: '#0f0d13',
        card: { DEFAULT: '#13111a', hover: '#1a1724' },
        border: { DEFAULT: '#2a2035', accent: '#4a1a1a' },
        crimson: {
          DEFAULT: '#9b2020',
          bright: '#c42c2c',
          glow: 'rgba(155,32,32,0.35)',
        },
        gold: {
          DEFAULT: '#c9a227',
          dim: '#8a6c17',
          glow: 'rgba(201,162,39,0.25)',
        },
        txt: {
          primary: '#e2d9c8',
          muted: '#7a7088',
          dim: '#4a4258',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        decorative: ['Cinzel Decorative', 'serif'],
        body: ['Crimson Pro', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
