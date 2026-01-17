import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf3e7',
          300: '#fcecd5',
          400: '#fae5c3',
          500: '#f5deb3',
          600: '#d4b896',
          700: '#b3927a',
          800: '#926d5e',
          900: '#6b4e3d',
        },
        accent: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf3e7',
          300: '#fcecd5',
          400: '#fae5c3',
          500: '#f5deb3',
          600: '#d4b896',
          700: '#b3927a',
          800: '#926d5e',
          900: '#6b4e3d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
