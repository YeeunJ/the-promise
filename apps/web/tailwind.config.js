/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ====================================================
        // Refined Sage 디자인 토큰 (Phase 2)
        // 동등한 CSS 변수: apps/web/src/styles/tokens.css
        //
        // flat key 사용 — Vite dev 모드에서 nested DEFAULT 키가
        // 일부 누락되는 이슈를 회피하기 위해 모든 색을 평탄화
        // ====================================================
        canvas: '#F4F1E8',
        surface: '#FFFFFF',
        'surface-2': '#FBF9F2',

        primary: '#1F5F4A',
        'primary-dark': '#16493A',
        'primary-50': 'rgba(31, 95, 74, 0.06)',
        'primary-100': 'rgba(31, 95, 74, 0.10)',

        accent: '#B8956A',
        'accent-soft': '#E8D9BD',

        ink: '#161A18',
        'ink-soft': '#5B6360',
        'ink-mute': '#9AA29D',

        edge: '#E5E0D2',
        'edge-soft': '#F0EBDB',

        danger: '#B84A3E',
        warn: '#C68A3A',

        'status-confirmed-bg': 'rgba(31, 95, 74, 0.10)',
        'status-confirmed-fg': '#1F5F4A',
        'status-pending-bg': 'rgba(184, 138, 58, 0.18)',
        'status-pending-fg': '#8C6428',
        'status-canceled-bg': '#F0EBDB',
        'status-canceled-fg': '#9AA29D',
      },
      boxShadow: {
        'design-md': '0 1px 2px rgba(20, 30, 25, 0.04), 0 8px 28px rgba(20, 30, 25, 0.05)',
        'design-lg': '0 2px 4px rgba(20, 30, 25, 0.04), 0 24px 64px rgba(20, 30, 25, 0.08)',
        'design-primary': '0 8px 20px rgba(31, 95, 74, 0.25)',
        'design-danger': '0 2px 6px rgba(184, 74, 62, 0.18)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(40px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 500ms ease-out',
        'slide-down-out': 'slide-down-out 350ms ease-in forwards',
        'fade-in': 'fade-in 300ms ease-out',
        'fade-out': 'fade-out 350ms ease-in forwards',
      },
    },
  },
  plugins: [],
}
