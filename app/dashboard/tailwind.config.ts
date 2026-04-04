import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#F9F8F6',
        surface: '#FFFFFF',
        foreground: '#1A1A1A',
        muted: '#9A9486',
        accent: '#2563EB',
        danger: '#DC2626',
        border: '#E8E4DC',
      },
    },
  },
  plugins: [],
}
export default config
