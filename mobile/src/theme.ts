/**
 * Design tokens for the Téranga Trans mobile app.
 * Brand colours mirror the web app (tailwind.config.js).
 */
export const colors = {
  // Marque Téranga — inspirée ExpressPay : bleu primaire + orange secondaire
  primary: '#0577DE',
  primaryDark: '#0563BC',
  primaryLight: '#E4F0FC',
  // Alias primaire (headers, marque, accents)
  blue: '#0577DE',
  blueDark: '#0563BC',
  blueLight: '#E4F0FC',
  // Neutral greys
  gray: '#5b6675',
  grayLight: '#eef1f5',
  // Secondaire : orange (boutons d'action / CTA)
  secondary: '#F88B1A',
  secondaryDark: '#E07A0E',
  orange: '#F88B1A',
  orangeDark: '#E07A0E',
  gold: '#c9a227',
  white: '#ffffff',
  background: '#f4f6f9',
  card: '#ffffff',
  text: '#1a2233',
  textMuted: '#6b7686',
  border: '#e2e6ec',
  success: '#1a9d5a',
  successBg: '#e6f6ee',
  danger: '#d64545',
  dangerBg: '#fdeaea',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const font = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
} as const;

/** Format a number as XOF currency (e.g. 12 500 FCFA). */
export function formatXof(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
}
