/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // matches the `.dark` class toggled on the root App div
  corePlugins: {
    preflight: false, // existing CSS reset in main.css handles this
  },
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      // ── Custom animations ─────────────────────────────────────────────────
      keyframes: {
        dropIn: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(3px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
        typingDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)',    opacity: '0.5' },
          '40%':            { transform: 'translateY(-4px)', opacity: '1'   },
        },
        spinLoader: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'drop-in':     'dropIn 0.15s ease both',
        'fade-in':     'fadeIn 0.4s ease both',
        'slide-in':    'slideIn 0.2s ease both',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'typing-dot':  'typingDot 1.2s ease-in-out infinite',
        'spin-loader': 'spinLoader 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};
