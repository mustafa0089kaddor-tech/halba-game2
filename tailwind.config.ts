import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deep: '#071F27', night: '#0A2F3A', tide: '#10495A', reef: '#1B6477',
        saffron: '#FFC247', mint: '#3DDC97', rose: '#FF6B8B', sky: '#5BC0F8', paper: '#EAF6F4',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
