/**
 * tailwind.config.ts — Refined Sage 토큰 통합
 *
 * 사용법: 우리 web/tailwind.config.ts의 theme.extend 안에 아래 내용을 합쳐 넣으세요.
 * Tailwind 클래스로 즉시 사용 가능해집니다.
 *
 *   <div className="bg-surface border border-border-soft rounded-lg shadow-md">
 *   <button className="bg-primary text-white rounded-md px-4 py-2 shadow-primary hover:bg-primary-dark">
 *   <h1 className="text-h1 font-extrabold tracking-tight">
 *
 * (이 파일은 참고용 — 실제 config 파일에 붙여넣기)
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Colors ─────────────────────────────────────────
      colors: {
        // Base
        bg: '#F4F1E8',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#FBF9F2',
        },

        // Brand
        primary: {
          DEFAULT: '#1F5F4A',
          dark: '#16493A',
          50:  'rgba(31, 95, 74, 0.06)',
          100: 'rgba(31, 95, 74, 0.10)',
        },

        // Accent
        accent: {
          DEFAULT: '#B8956A',
          soft: '#E8D9BD',
        },

        // Text
        text: {
          DEFAULT: '#161A18',
          soft: '#5B6360',
          mute: '#9AA29D',
        },

        // Borders
        border: {
          DEFAULT: '#E5E0D2',
          soft: '#F0EBDB',
        },

        // Status
        danger: '#B84A3E',
        warn: '#C68A3A',
      },

      // ── Typography ────────────────────────────────────
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Numeric: keeping default Tailwind sizes
        // Semantic aliases for our design:
        display: ['48px', { lineHeight: '1.15', letterSpacing: '-0.035em', fontWeight: '800' }],
        h1:      ['26px', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '800' }],
        h2:      ['22px', { lineHeight: '1.3',  letterSpacing: '-0.02em',  fontWeight: '800' }],
        h3:      ['18px', { lineHeight: '1.35', letterSpacing: '-0.02em',  fontWeight: '800' }],
        card:    ['15px', { lineHeight: '1.4',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        // base body uses Tailwind text-sm (14px) / text-xs (12px)
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight:   '-0.025em',
        normal:  '-0.01em',
        wide:    '0.04em',
        wider:   '0.08em',
      },

      // ── Radius ────────────────────────────────────────
      borderRadius: {
        // override defaults to match design
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
        // pill = Tailwind's `rounded-full` (999px) — already exists
      },

      // ── Shadow ────────────────────────────────────────
      boxShadow: {
        md:      '0 1px 2px rgba(20,30,25,0.04), 0 8px 28px rgba(20,30,25,0.05)',
        lg:      '0 2px 4px rgba(20,30,25,0.04), 0 24px 64px rgba(20,30,25,0.08)',
        primary: '0 8px 20px rgba(31,95,74,0.25)',
        danger:  '0 2px 6px rgba(184,74,62,0.18)',
      },

      // ── Layout ────────────────────────────────────────
      maxWidth: {
        container: '1180px',
      },
    },
  },
  plugins: [],
};

export default config;

/* ──────────────────────────────────────────────────────────
 *  GLOBAL CSS (src/index.css)
 *  ──────────────────────────────────────────────────────────
 *
 *  @tailwind base;
 *  @tailwind components;
 *  @tailwind utilities;
 *
 *  @import 'pretendard/dist/web/static/pretendard.css';
 *
 *  @layer base {
 *    body {
 *      @apply bg-bg text-text font-sans antialiased;
 *    }
 *    // Numeric tabular nums for dates/times
 *    .tabular { font-variant-numeric: tabular-nums; }
 *  }
 *
 *  @layer components {
 *    // 자주 쓰는 컴포넌트 클래스 (optional, 컴포넌트로 빼는 게 베스트)
 *    .btn-primary {
 *      @apply bg-primary text-white rounded-md px-6 py-3 font-bold text-sm
 *             shadow-primary hover:bg-primary-dark transition-colors;
 *    }
 *    .btn-ghost {
 *      @apply bg-surface text-text border border-border rounded-md px-6 py-3
 *             font-semibold text-sm hover:bg-surface-2 transition-colors;
 *    }
 *    .btn-danger {
 *      @apply bg-danger text-white rounded-md px-5 py-2.5 font-bold text-sm
 *             shadow-danger;
 *    }
 *    .chip {
 *      @apply px-3 py-1.5 rounded-full bg-surface-2 border border-border-soft
 *             text-text-soft text-xs font-bold cursor-pointer;
 *    }
 *    .chip.is-active {
 *      @apply bg-primary text-white border-transparent;
 *    }
 *    .card {
 *      @apply bg-surface rounded-lg border border-border-soft shadow-md;
 *    }
 *    .card.is-selected {
 *      @apply border-2 border-primary;
 *      box-shadow: 0 4px 16px rgba(31,95,74,0.14);
 *    }
 *    .status-pill {
 *      @apply px-2.5 py-1 rounded-full text-2xs font-bold;
 *    }
 *    .status-confirmed { @apply bg-primary-100 text-primary; }
 *    .status-pending   { background: rgba(184,138,58,0.18); color: #8C6428; }
 *    .status-canceled  { @apply bg-border-soft text-text-mute; }
 *  }
 */
