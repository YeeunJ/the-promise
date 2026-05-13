/**
 * Refined Sage — Design Tokens (TypeScript)
 * 가나안교회 장소 사용 신청 시스템
 *
 * 사용 예 (styled-components / emotion):
 *   import { theme } from '@/styles/theme';
 *   const StyledBtn = styled.button`
 *     background: ${theme.color.primary};
 *     border-radius: ${theme.radius.md};
 *   `;
 *
 * 또는 CSS 변수를 선호하면 tokens.css 사용.
 */

export const color = {
  bg:           '#F4F1E8',
  surface:      '#FFFFFF',
  surface2:     '#FBF9F2',

  primary:      '#1F5F4A',
  primaryDark:  '#16493A',
  primary50:    'rgba(31, 95, 74, 0.06)',
  primary100:   'rgba(31, 95, 74, 0.10)',

  accent:       '#B8956A',
  accentSoft:   '#E8D9BD',

  text:         '#161A18',
  textSoft:     '#5B6360',
  textMute:     '#9AA29D',

  border:       '#E5E0D2',
  borderSoft:   '#F0EBDB',

  danger:       '#B84A3E',
  warn:         '#C68A3A',

  status: {
    confirmed: { bg: 'rgba(31,95,74,0.10)',   fg: '#1F5F4A' },
    pending:   { bg: 'rgba(184,138,58,0.18)', fg: '#8C6428' },
    canceled:  { bg: '#F0EBDB',                fg: '#9AA29D' },
  },
} as const;

export const font = {
  family: `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`,
  size: {
    display: '48px',
    h1: '26px',
    h2: '22px',
    h3: '18px',
    card: '15px',
    body: '14px',
    sm: '13px',
    xs: '12px',
    '2xs': '11px',
    '3xs': '10px',
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  tracking: {
    tighter: '-0.035em',
    tight:   '-0.025em',
    normal:  '-0.01em',
    wide:    '0.04em',
    wider:   '0.08em',
  },
} as const;

export const space = {
  1: '4px',  2: '8px',  3: '12px', 4: '16px',
  5: '20px', 6: '24px', 7: '28px', 8: '32px',
  10: '40px',
} as const;

export const radius = {
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  pill: '999px',
} as const;

export const shadow = {
  md:      '0 1px 2px rgba(20,30,25,0.04), 0 8px 28px rgba(20,30,25,0.05)',
  lg:      '0 2px 4px rgba(20,30,25,0.04), 0 24px 64px rgba(20,30,25,0.08)',
  primary: '0 8px 20px rgba(31,95,74,0.25)',
  danger:  '0 2px 6px rgba(184,74,62,0.18)',
} as const;

export const layout = {
  containerMax: '1180px',
  containerPx:  '40px',
} as const;

export const theme = { color, font, space, radius, shadow, layout } as const;
export type Theme = typeof theme;
