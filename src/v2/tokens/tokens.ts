/** V2 Design Tokens — Cosmic Editorial
 *  Use these constants in JS/TS contexts (e.g. R3F, canvas, inline styles).
 *  For CSS, prefer the custom properties in tokens.css.
 */

export const v2Colors = {
  baseBg:      '#070B1A',
  surfaceBg:   '#0D1326',
  baseText:    '#F5F7FF',
  mutedText:   '#B8C0D9',
  navy:        '#0B1F3A',
  deepBlue:    '#1D4ED8',
  violet:      '#7C3AED',
  purple:      '#9333EA',
  magenta:     '#C026D3',
  cyan:        '#06B6D4',
  borderSoft:  'rgba(255,255,255,0.12)',
} as const

export const v2Fonts = {
  display: "'Proxima Nova', 'Inter', 'Arial', sans-serif",
  body:    "'Proxima Nova', 'Inter', 'Arial', sans-serif",
  weightDisplay: 600,
  weightBody:    300,
} as const

export const v2Radius = {
  sm: '8px',
  md: '16px',
  lg: '24px',
} as const
