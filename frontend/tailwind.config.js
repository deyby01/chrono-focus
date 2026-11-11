/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'glow-emerald': '0 0 28px -4px rgba(16, 185, 129, 0.4)',
        'glow-indigo': '0 0 25px -4px rgba(99, 102, 241, 0.4)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};

