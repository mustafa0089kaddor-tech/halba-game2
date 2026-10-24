import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ٦٠٪ الأساس: بنفسجي ليلي عميق */
        deep: '#0F0A1E',
        night: '#160F29',
        /* ٣٠٪ الثانوي: بنفسجي ملكي ولافندر داكن */
        tide: '#2A1B4E',
        reef: '#3B2869',
        /* ١٠٪ التمييز: ذهبي كهرماني + سيان كهربائي */
        saffron: '#FFB800',
        ember: '#FF8A00',
        volt: '#00F5D4',
        /* ألوان الفرق والحالات (نفس الأسماء القديمة حتى لا ينكسر أي ملف آخر) */
        mint: '#3DDC97',
        rose: '#FF5C8A',
        sky: '#6EA8FF',
        paper: '#F3EEFF',
      },
      fontFamily: {
        display: ['"Readex Pro"', 'var(--font-display)', 'Cairo', 'system-ui', 'sans-serif'],
        body: ['Cairo', 'var(--font-body)', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        tile: '0 5px 0 #A65A00, 0 10px 18px -6px rgba(255,138,0,.5)',
        volt: '0 0 28px rgba(0,245,212,.45)',
      },
    },
  },
  plugins: [],
};
export default config;
